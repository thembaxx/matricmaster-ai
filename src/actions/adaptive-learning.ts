'use server';

import { and, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { getSubjectsForTarget, getWeightageForTopic } from '@/lib/constants/topic-weightages';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	flashcardDecks,
	topicConfidence,
	topicMastery,
	universityTargets,
} from '@/lib/db/schema';

type TopicMasteryRow = typeof topicMastery.$inferSelect;
type ConceptStruggleRow = typeof conceptStruggles.$inferSelect;
type FlashcardDeckRow = typeof flashcardDecks.$inferSelect;

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface WeakTopic {
	topic: string;
	subject: string;
	confidence: number;
	struggleCount: number;
	masteryLevel: number;
	recommendedAction: 'flashcard' | 'quiz' | 'review';
	weightagePercent?: number;
	hasTargetRelevance?: boolean;
	weightedScore?: number;
}

export interface AdaptiveRecommendation {
	type: 'flashcard' | 'quiz' | 'pastPaper' | 'lesson';
	topic: string;
	subject: string;
	priority: number;
	reason: string;
	resourceId?: string;
}

export async function getWeakTopics(limit = 5): Promise<WeakTopic[]> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const confidences = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
			limit: limit * 2,
		});

		const struggles = await db.query.conceptStruggles.findMany({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.isResolved, false)
			),
		});

		const masteries = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, session.user.id),
		});

		const topicMap = new Map<string, WeakTopic>();

		for (const c of confidences) {
			const confidenceNum = Number(c.confidenceScore);
			const mastery = masteries.find(
				(m: TopicMasteryRow) => m.topic === c.topic && m.subjectId.toString() === c.subject
			);
			const struggle = struggles.find((s: ConceptStruggleRow) => s.concept === c.topic);

			const struggleCount = struggle?.struggleCount || 0;
			const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;

			let recommendedAction: 'flashcard' | 'quiz' | 'review' = 'quiz';
			if (masteryLevel > 0.7 && confidenceNum < 0.5) {
				recommendedAction = 'review';
			} else if (confidenceNum < 0.3 || struggleCount >= 2) {
				recommendedAction = 'flashcard';
			}

			topicMap.set(c.topic, {
				topic: c.topic,
				subject: c.subject,
				confidence: confidenceNum,
				struggleCount,
				masteryLevel,
				recommendedAction,
			});
		}

		return Array.from(topicMap.values())
			.sort((a, b) => {
				const aScore =
					(1 - a.confidence) * 0.4 + a.struggleCount * 0.3 + (1 - a.masteryLevel) * 0.3;
				const bScore =
					(1 - b.confidence) * 0.4 + b.struggleCount * 0.3 + (1 - b.masteryLevel) * 0.3;
				return bScore - aScore;
			})
			.slice(0, limit);
	} catch (error) {
		console.error('getWeakTopics failed:', error);
		return [];
	}
}

export async function getAdaptiveRecommendations(limit = 10): Promise<AdaptiveRecommendation[]> {
	try {
		const weakTopics = await getWeakTopics(10);
		const recommendations: AdaptiveRecommendation[] = [];

		for (const topic of weakTopics) {
			if (topic.recommendedAction === 'flashcard') {
				const db = await getDb();
				const auth = await getAuth();
				const session = await auth.api.getSession();
				if (!session?.user) throw new Error('Unauthorized');

				const decks = await db.query.flashcardDecks.findMany({
					where: eq(flashcardDecks.userId, session.user.id),
				});

				for (const deck of decks) {
					recommendations.push({
						type: 'flashcard',
						topic: topic.topic,
						subject: topic.subject,
						priority: 100 - topic.confidence * 100,
						reason: `Review flashcards for ${topic.topic} - confidence: ${(topic.confidence * 100).toFixed(0)}%`,
						resourceId: deck.id,
					});
				}
			} else {
				recommendations.push({
					type: topic.recommendedAction === 'review' ? 'lesson' : 'quiz',
					topic: topic.topic,
					subject: topic.subject,
					priority: 100 - topic.confidence * 100,
					reason: `${topic.recommendedAction === 'review' ? 'Review' : 'Practice'} ${topic.topic} - struggles: ${topic.struggleCount}`,
				});
			}
		}

		return recommendations.slice(0, limit);
	} catch (error) {
		console.error('getAdaptiveRecommendations failed:', error);
		return [];
	}
}

export async function generateFlashcardsFromWeakTopics(
	userId: string,
	topics: string[]
): Promise<{
	success: boolean;
	error?: string;
	deck?: typeof flashcardDecks.$inferSelect;
	topicsGenerated?: number;
}> {
	try {
		const db = await getDb();

		const existingDecks = await db.query.flashcardDecks.findMany({
			where: eq(flashcardDecks.userId, userId),
		});

		let adaptiveDeck = existingDecks.find((d: FlashcardDeckRow) => d.name === 'Adaptive Review');

		if (!adaptiveDeck) {
			const [created] = await db
				.insert(flashcardDecks)
				.values({
					userId,
					name: 'Adaptive Review',
					description: 'Your flashcards from weak topics',
					cardCount: 0,
				})
				.returning();
			adaptiveDeck = created;
		}

		const confidences = await db.query.topicConfidence.findMany({
			where: sql`${topicConfidence.userId} = ${userId} AND ${topicConfidence.topic} IN ${topics}`,
		});

		return {
			success: true,
			deck: adaptiveDeck,
			topicsGenerated: confidences.length,
		};
	} catch (error) {
		console.error('generateFlashcardsFromWeakTopics failed:', error);
		return { success: false, error: 'Failed to generate flashcards' };
	}
}

export async function syncMasteryToConfidence(
	userId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const db = await getDb();

		const masteries = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, userId),
		});

		for (const mastery of masteries) {
			const accuracy = mastery.questionsCorrect / mastery.questionsAttempted || 0;

			await db
				.insert(topicConfidence)
				.values({
					userId,
					topic: mastery.topic,
					subject: mastery.subjectId.toString(),
					confidenceScore: accuracy.toFixed(2),
					timesCorrect: mastery.questionsCorrect,
					timesAttempted: mastery.questionsAttempted,
				})
				.onConflictDoUpdate({
					target: [topicConfidence.userId, topicConfidence.topic, topicConfidence.subject],
					set: {
						confidenceScore: accuracy.toFixed(2),
						timesCorrect: mastery.questionsCorrect,
						timesAttempted: mastery.questionsAttempted,
						lastAttemptAt: mastery.lastPracticed,
						updatedAt: new Date(),
					},
				});
		}

		return { success: true };
	} catch (error) {
		console.error('syncMasteryToConfidence failed:', error);
		return { success: false, error: 'Failed to sync mastery to confidence' };
	}
}

function determineRecommendedAction(
	confidenceNum: number,
	masteryLevel: number,
	struggleCount: number
): 'flashcard' | 'quiz' | 'review' {
	if (masteryLevel > 0.7 && confidenceNum < 0.5) {
		return 'review';
	}
	if (confidenceNum < 0.3 || struggleCount >= 2) {
		return 'flashcard';
	}
	return 'quiz';
}

function calculateTopicRelevance(
	subject: string,
	requiredSubjects: string[],
	target: typeof universityTargets.$inferSelect | undefined,
	weightage: number
): { hasTargetRelevance: boolean; targetMultiplier: number; weightedScore: number } {
	const hasTargetRelevance = target
		? requiredSubjects.some((s) => s.toLowerCase() === subject.toLowerCase())
		: false;

	const targetMultiplier = hasTargetRelevance ? 1 + weightage / 100 : 1.0;

	return { hasTargetRelevance, targetMultiplier, weightedScore: 0 };
}

function calculateWeightedScore(
	confidenceNum: number,
	masteryLevel: number,
	struggleCount: number,
	targetMultiplier: number
): number {
	const baseScore = (1 - confidenceNum) * 0.4 + struggleCount * 0.3 + (1 - masteryLevel) * 0.3;
	return baseScore * targetMultiplier;
}

async function fetchTopicData(userId: string, limit: number) {
	const db = await getDb();

	const target = await db.query.universityTargets.findFirst({
		where: and(eq(universityTargets.userId, userId), eq(universityTargets.isActive, true)),
	});

	const confidences = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, userId),
		orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
		limit: limit * 3,
	});

	const struggles = await db.query.conceptStruggles.findMany({
		where: and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.isResolved, false)),
	});

	const masteries = await db.query.topicMastery.findMany({
		where: eq(topicMastery.userId, userId),
	});

	const requiredSubjects = target
		? getSubjectsForTarget(target.universityName, target.faculty)
		: [];

	return { target, confidences, struggles, masteries, requiredSubjects };
}

function processTopicWithRelevance(
	c: typeof topicConfidence.$inferSelect,
	mastery: typeof topicMastery.$inferSelect | undefined,
	struggle: typeof conceptStruggles.$inferSelect | undefined,
	requiredSubjects: string[],
	target: typeof universityTargets.$inferSelect | undefined,
	weightage: number
): WeakTopic {
	const confidenceNum = Number(c.confidenceScore);
	const struggleCount = struggle?.struggleCount || 0;
	const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;

	const { hasTargetRelevance, targetMultiplier } = calculateTopicRelevance(
		c.subject,
		requiredSubjects,
		target,
		weightage
	);

	const weightedScore = calculateWeightedScore(
		confidenceNum,
		masteryLevel,
		struggleCount,
		targetMultiplier
	);

	const recommendedAction = determineRecommendedAction(confidenceNum, masteryLevel, struggleCount);

	return {
		topic: c.topic,
		subject: c.subject,
		confidence: confidenceNum,
		struggleCount,
		masteryLevel,
		recommendedAction,
		weightagePercent: weightage,
		hasTargetRelevance,
		weightedScore,
	};
}

export async function getWeightedWeakTopics(limit = 5): Promise<WeakTopic[]> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const { target, confidences, struggles, masteries, requiredSubjects } = await fetchTopicData(
			session.user.id,
			limit
		);

		const topicMap = new Map<string, WeakTopic>();

		for (const c of confidences) {
			const mastery = masteries.find(
				(m: TopicMasteryRow) => m.topic === c.topic && m.subjectId.toString() === c.subject
			);
			const struggle = struggles.find((s: ConceptStruggleRow) => s.concept === c.topic);
			const weightage = getWeightageForTopic(c.subject, c.topic);

			const weakTopic = processTopicWithRelevance(
				c,
				mastery,
				struggle,
				requiredSubjects,
				target,
				weightage
			);

			topicMap.set(c.topic, weakTopic);
		}

		return Array.from(topicMap.values())
			.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0))
			.slice(0, limit);
	} catch (error) {
		console.error('getWeightedWeakTopics failed:', error);
		return [];
	}
}

export async function saveUniversityTargetAction(
	universityName: string,
	faculty: string,
	targetAps: number
): Promise<{ success: boolean; error?: string; target?: typeof universityTargets.$inferSelect }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		await db
			.update(universityTargets)
			.set({ isActive: false })
			.where(eq(universityTargets.userId, session.user.id));

		const [newTarget] = await db
			.insert(universityTargets)
			.values({
				userId: session.user.id,
				universityName,
				faculty,
				targetAps,
				isActive: true,
			})
			.returning();

		return { success: true, target: newTarget };
	} catch (error) {
		console.error('saveUniversityTargetAction failed:', error);
		return { success: false, error: 'Failed to save university target' };
	}
}

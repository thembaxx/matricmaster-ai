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
			(m) => m.topic === c.topic && m.subjectId.toString() === c.subject
		);
		const struggle = struggles.find((s) => s.concept === c.topic);

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
			const aScore = (1 - a.confidence) * 0.4 + a.struggleCount * 0.3 + (1 - a.masteryLevel) * 0.3;
			const bScore = (1 - b.confidence) * 0.4 + b.struggleCount * 0.3 + (1 - b.masteryLevel) * 0.3;
			return bScore - aScore;
		})
		.slice(0, limit);
}

export async function getAdaptiveRecommendations(limit = 10): Promise<AdaptiveRecommendation[]> {
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
}

export async function generateFlashcardsFromWeakTopics(userId: string, topics: string[]) {
	const db = await getDb();

	const existingDecks = await db.query.flashcardDecks.findMany({
		where: eq(flashcardDecks.userId, userId),
	});

	let adaptiveDeck = existingDecks.find((d) => d.name === 'Adaptive Review');

	if (!adaptiveDeck) {
		const [created] = await db
			.insert(flashcardDecks)
			.values({
				userId,
				name: 'Adaptive Review',
				description: 'Auto-generated flashcards from weak topics',
				cardCount: 0,
			})
			.returning();
		adaptiveDeck = created;
	}

	const confidences = await db.query.topicConfidence.findMany({
		where: sql`${topicConfidence.userId} = ${userId} AND ${topicConfidence.topic} IN ${topics}`,
	});

	return {
		deck: adaptiveDeck,
		topicsGenerated: confidences.length,
	};
}

export async function syncMasteryToConfidence(userId: string) {
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
}

export async function getWeightedWeakTopics(limit = 5): Promise<WeakTopic[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const target = await db.query.universityTargets.findFirst({
		where: (targets, { eq, and }) =>
			and(eq(targets.userId, session.user.id), eq(targets.isActive, true)),
	});

	const confidences = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, session.user.id),
		orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
		limit: limit * 3,
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

	const requiredSubjects = target
		? getSubjectsForTarget(target.universityName, target.faculty)
		: [];

	const topicMap = new Map<string, WeakTopic>();

	for (const c of confidences) {
		const confidenceNum = Number(c.confidenceScore);
		const mastery = masteries.find(
			(m) => m.topic === c.topic && m.subjectId.toString() === c.subject
		);
		const struggle = struggles.find((s) => s.concept === c.topic);

		const struggleCount = struggle?.struggleCount || 0;
		const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;
		const weightage = getWeightageForTopic(c.subject, c.topic);

		const baseScore = (1 - confidenceNum) * 0.4 + struggleCount * 0.3 + (1 - masteryLevel) * 0.3;

		let targetMultiplier = 1.0;
		const hasTargetRelevance = target
			? requiredSubjects.some((s) => s.toLowerCase() === c.subject.toLowerCase())
			: false;

		if (target && hasTargetRelevance) {
			targetMultiplier = 1 + weightage / 100;
		}

		const weightedScore = baseScore * targetMultiplier;

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
			weightagePercent: weightage,
			hasTargetRelevance,
			weightedScore,
		});
	}

	return Array.from(topicMap.values())
		.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0))
		.slice(0, limit);
}

export async function saveUniversityTargetAction(
	universityName: string,
	faculty: string,
	targetAps: number
) {
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

	return newTarget;
}

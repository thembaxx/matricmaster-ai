'use server';

import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	apsMilestones,
	flashcardDecks,
	flashcards,
	questionAttempts,
	topicConfidence,
	topicMastery,
	universityTargets,
} from '@/lib/db/schema';
import { calculateNextReview } from './spacedRepetition';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');
	return session.user;
}

export interface WeakTopicData {
	topic: string;
	subject: string;
	confidence: number;
	attempts: number;
	recommendedAction: 'flashcard' | 'ai_tutor' | 'review' | 'milestone';
}

export interface FlowRecommendation {
	type: string;
	priority: 'high' | 'medium' | 'low';
	title: string;
	description: string;
	actionUrl: string;
	estimatedImpact: string;
}

export async function analyzeWeakTopics(): Promise<WeakTopicData[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const confidences = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, user.id),
		orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
	});

	const results: WeakTopicData[] = [];

	for (const confidence of confidences) {
		const score = Number(confidence.confidenceScore);

		if (score < 0.6) {
			const attemptCount = await db.query.questionAttempts.findMany({
				where: and(
					eq(questionAttempts.userId, user.id),
					eq(questionAttempts.topic, confidence.topic)
				),
			});

			let action: 'flashcard' | 'ai_tutor' | 'review' | 'milestone' = 'review';
			if (score < 0.4) action = 'ai_tutor';
			if (attemptCount.length > 3 && score < 0.5) action = 'flashcard';

			results.push({
				topic: confidence.topic,
				subject: confidence.subject,
				confidence: score,
				attempts: confidence.timesAttempted || 0,
				recommendedAction: action,
			});
		}
	}

	return results;
}

export async function generateCrossFeatureRecommendations(): Promise<FlowRecommendation[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const recommendations: FlowRecommendation[] = [];

	const weakTopics = await analyzeWeakTopics();
	const topWeak = weakTopics.slice(0, 3);

	for (const weak of topWeak) {
		if (weak.recommendedAction === 'flashcard') {
			recommendations.push({
				type: 'flashcard_generation',
				priority: 'high',
				title: `Generate flashcards for "${weak.topic}"`,
				description: `Your confidence is ${Math.round(weak.confidence * 100)}%. Auto-generated flashcards from your mistakes can help improve.`,
				actionUrl: `/flashcards?generate=${encodeURIComponent(weak.topic)}`,
				estimatedImpact: '+10-15% confidence',
			});
		} else if (weak.recommendedAction === 'ai_tutor') {
			recommendations.push({
				type: 'ai_tutor_session',
				priority: 'high',
				title: `Get AI help with "${weak.topic}"`,
				description: `Struggling with ${weak.topic}? The AI tutor can explain this topic in a personalized way.`,
				actionUrl: `/ai-tutor?topic=${encodeURIComponent(weak.topic)}&context=help`,
				estimatedImpact: '+15-20% confidence',
			});
		}
	}

	const spacedDue = await db.query.questionAttempts.findMany({
		where: and(eq(questionAttempts.userId, user.id), lt(questionAttempts.nextReviewAt, new Date())),
		orderBy: [desc(questionAttempts.nextReviewAt)],
		limit: 5,
	});

	if (spacedDue.length > 0) {
		recommendations.push({
			type: 'spaced_review',
			priority: 'medium',
			title: `${spacedDue.length} questions due for review`,
			description: 'Maintain your memory with spaced repetition review.',
			actionUrl: '/review',
			estimatedImpact: 'Prevents knowledge decay',
		});
	}

	const universityTarget = await db.query.universityTargets.findFirst({
		where: and(eq(universityTargets.userId, user.id), eq(universityTargets.isActive, true)),
	});

	if (universityTarget) {
		const pendingMilestones = await db.query.apsMilestones.findMany({
			where: and(eq(apsMilestones.userId, user.id), eq(apsMilestones.status, 'pending')),
			orderBy: [sql`${apsMilestones.apsPotentialPoints} DESC`],
			limit: 3,
		});

		if (pendingMilestones.length > 0) {
			const totalPotential = pendingMilestones.reduce(
				(sum, m) => sum + (m.apsPotentialPoints || 0),
				0
			);

			recommendations.push({
				type: 'milestone_progress',
				priority: 'medium',
				title: `Complete milestones for ${universityTarget.universityName}`,
				description: `${pendingMilestones.length} milestones can give you +${totalPotential} APS points toward your ${universityTarget.targetAps} target.`,
				actionUrl: `/study-path?university=${encodeURIComponent(universityTarget.universityName)}`,
				estimatedImpact: `+${totalPotential} APS`,
			});
		}
	}

	return recommendations.sort((a, b) => {
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});
}

export async function triggerAutoFlashcardGeneration(
	topic: string,
	_subject: string
): Promise<{ success: boolean; cardsCreated: number }> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	let deck = await db.query.flashcardDecks.findFirst({
		where: eq(flashcardDecks.userId, user.id),
	});

	if (!deck) {
		const [newDeck] = await db
			.insert(flashcardDecks)
			.values({
				userId: user.id,
				name: 'Auto-Generated Review',
				description: 'Cards generated from weak topics and mistakes',
			})
			.returning();
		deck = newDeck;
	}

	const mistakes = await db.query.questionAttempts.findMany({
		where: and(
			eq(questionAttempts.userId, user.id),
			eq(questionAttempts.isCorrect, false),
			eq(questionAttempts.topic, topic)
		),
		limit: 10,
	});

	let cardsCreated = 0;

	for (const mistake of mistakes) {
		await db.insert(flashcards).values({
			deckId: deck!.id,
			front: mistake.topic,
			back: 'Review this topic - check your quiz history for details',
			difficulty: 'medium',
			easeFactor: '2.5',
			intervalDays: 1,
			repetitions: 0,
			nextReview: new Date(),
		});
		cardsCreated++;
	}

	if (deck.cardCount !== undefined) {
		await db
			.update(flashcardDecks)
			.set({ cardCount: (deck.cardCount || 0) + cardsCreated })
			.where(eq(flashcardDecks.id, deck.id));
	}

	return { success: true, cardsCreated };
}

export async function syncQuizToSpacedRepetition(
	questionId: string,
	topic: string,
	isCorrect: boolean,
	responseTimeMs?: number
): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const existing = await db.query.questionAttempts.findFirst({
		where: and(eq(questionAttempts.userId, user.id), eq(questionAttempts.questionId, questionId)),
	});

	const now = new Date();

	if (existing) {
		const consecutiveCorrect = isCorrect ? (existing.isCorrect ? 3 : 1) : 0;
		const { intervalDays, easeFactor } = calculateNextReview(
			isCorrect,
			existing.intervalDays,
			Number(existing.easeFactor),
			consecutiveCorrect
		);

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + intervalDays);

		await db
			.update(questionAttempts)
			.set({
				isCorrect,
				responseTimeMs: responseTimeMs ?? existing.responseTimeMs,
				intervalDays,
				easeFactor: easeFactor.toFixed(2) as any,
				nextReviewAt: nextReview,
				attemptedAt: now,
			})
			.where(eq(questionAttempts.id, existing.id));
	} else {
		const { intervalDays, easeFactor } = calculateNextReview(isCorrect, 1, 2.5, 0);

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + intervalDays);

		await db.insert(questionAttempts).values({
			userId: user.id,
			questionId,
			topic,
			isCorrect,
			responseTimeMs,
			intervalDays,
			easeFactor: easeFactor.toFixed(2) as any,
			nextReviewAt: nextReview,
		});
	}

	const existingMastery = await db.query.topicMastery.findFirst({
		where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, topic)),
	});

	if (existingMastery) {
		const newCorrect = (existingMastery.questionsCorrect || 0) + (isCorrect ? 1 : 0);
		const newAttempted = (existingMastery.questionsAttempted || 0) + 1;
		const masteryLevel = newCorrect / newAttempted;

		await db
			.update(topicMastery)
			.set({
				masteryLevel: masteryLevel.toFixed(2) as any,
				questionsAttempted: newAttempted,
				questionsCorrect: newCorrect,
				lastPracticed: now,
			})
			.where(eq(topicMastery.id, existingMastery.id));
	} else {
		await db.insert(topicMastery).values({
			userId: user.id,
			subjectId: 1, // Default subject ID, should eventually be retrieved dynamically
			topic,
			masteryLevel: isCorrect ? '1.0' : '0.0',
			questionsAttempted: 1,
			questionsCorrect: isCorrect ? 1 : 0,
			lastPracticed: now,
		});
	}
}

export async function updateMilestoneFromMastery(milestoneId: string): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const milestone = await db.query.apsMilestones.findFirst({
		where: and(eq(apsMilestones.id, milestoneId), eq(apsMilestones.userId, user.id)),
	});

	if (!milestone || !milestone.topic || !milestone.subject) return;

	const mastery = await db.query.topicMastery.findFirst({
		where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, milestone.topic)),
	});

	if (mastery && Number(mastery.masteryLevel) >= 0.7) {
		await db
			.update(apsMilestones)
			.set({ status: 'completed', completedAt: new Date() })
			.where(eq(apsMilestones.id, milestoneId));
	}
}

'use server';

import { and, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { getMistakesFromStore } from '@/lib/db/learning-loop-actions';
import {
	conceptStruggles,
	flashcardDecks,
	flashcards,
	topicConfidence,
	topicMastery,
	topicWeightages,
} from '@/lib/db/schema';

export interface AdaptiveTrigger {
	type: 'weak_topic_flagged' | 'review_suggested' | 'path_updated' | 'flashcard_added';
	topic: string;
	subjectId: number;
	score?: number;
	threshold: number;
	action: 'ai_tutor_flag' | 'schedule_review' | 'update_path' | 'generate_flashcards';
}

export interface PoorPerformanceAlert {
	topic: string;
	subject: string;
	score: number;
	threshold: number;
	suggestions: string[];
}

export interface TopicResult {
	topic: string;
	subject: string;
	subjectId: number;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
}

interface QuizResult {
	topic: string;
	subject: string;
	subjectId: number;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
}

const THRESHOLDS = {
	POOR_PERFORMANCE: 0.6,
	REVIEW_SUGGESTED: 0.7,
	FLASHCARD_GENERATION: 0.5,
} as const;

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

export async function checkWeakTopic(
	_topic: string,
	score: number,
	threshold?: number
): Promise<boolean> {
	const effectiveThreshold = threshold ?? THRESHOLDS.POOR_PERFORMANCE;
	return score < effectiveThreshold;
}

export async function processQuizResults(
	_quizId: string,
	results: QuizResult[]
): Promise<AdaptiveTrigger[]> {
	const triggers: AdaptiveTrigger[] = [];

	for (const result of results) {
		const percentage =
			result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0;

		if (await checkWeakTopic(result.topic, percentage, THRESHOLDS.POOR_PERFORMANCE)) {
			triggers.push({
				type: 'weak_topic_flagged',
				topic: result.topic,
				subjectId: result.subjectId,
				score: percentage,
				threshold: THRESHOLDS.POOR_PERFORMANCE,
				action: 'ai_tutor_flag',
			});
		}

		if (percentage < THRESHOLDS.REVIEW_SUGGESTED && percentage >= THRESHOLDS.POOR_PERFORMANCE) {
			triggers.push({
				type: 'review_suggested',
				topic: result.topic,
				subjectId: result.subjectId,
				score: percentage,
				threshold: THRESHOLDS.REVIEW_SUGGESTED,
				action: 'schedule_review',
			});
		}

		if (percentage < THRESHOLDS.FLASHCARD_GENERATION) {
			triggers.push({
				type: 'flashcard_added',
				topic: result.topic,
				subjectId: result.subjectId,
				score: percentage,
				threshold: THRESHOLDS.FLASHCARD_GENERATION,
				action: 'generate_flashcards',
			});
		}
	}

	return triggers;
}

export async function generatePoorPerformanceAlerts(
	results: QuizResult[]
): Promise<PoorPerformanceAlert[]> {
	const alerts: PoorPerformanceAlert[] = [];

	for (const result of results) {
		const percentage =
			result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0;

		if (await checkWeakTopic(result.topic, percentage)) {
			const suggestions: string[] = [];

			if (percentage < THRESHOLDS.FLASHCARD_GENERATION) {
				suggestions.push('Generate flashcards for focused practice');
			}

			if (percentage < THRESHOLDS.REVIEW_SUGGESTED) {
				suggestions.push('Schedule a review session');
			}

			suggestions.push('Ask the AI Tutor for help with this topic');

			alerts.push({
				topic: result.topic,
				subject: result.subject,
				score: percentage,
				threshold: THRESHOLDS.POOR_PERFORMANCE,
				suggestions,
			});
		}
	}

	return alerts;
}

export async function flagTopicForAI(
	_trainingSet: string[],
	topic: string,
	_subjectId: number
): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const existing = await db.query.conceptStruggles.findFirst({
		where: and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.concept, topic)),
	});

	if (existing) {
		await db
			.update(conceptStruggles)
			.set({
				struggleCount: (existing.struggleCount || 0) + 1,
				isResolved: false,
			})
			.where(eq(conceptStruggles.id, existing.id));
	} else {
		await db.insert(conceptStruggles).values({
			userId: user.id,
			concept: topic,
			struggleCount: 1,
			isResolved: false,
		});
	}
}

export async function scheduleReviewSession(
	topic: string,
	_subject: string,
	_dueDate: Date
): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	await db.insert(conceptStruggles).values({
		userId: user.id,
		concept: topic,
		struggleCount: 1,
		isResolved: false,
	});
}

export async function suggestPathRetake(
	pathId: string,
	topic: string,
	moduleId: string
): Promise<{ pathId: string; moduleId: string; topic: string; suggested: boolean }> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const existing = await db.query.topicMastery.findFirst({
		where: and(eq(topicMastery.userId, user.id), eq(topicMastery.topic, topic)),
	});

	if (existing) {
		await db
			.update(topicMastery)
			.set({
				masteryLevel: sql`${topicMastery.masteryLevel} * 0.5`,
				consecutiveCorrect: 0,
				lastPracticed: new Date(),
			})
			.where(eq(topicMastery.id, existing.id));
	}

	return {
		pathId,
		moduleId,
		topic,
		suggested: true,
	};
}

export async function generateFlashcardsForWeakTopic(
	topic: string,
	_subject: string
): Promise<{ success: boolean; cardsCreated: number; error?: string }> {
	try {
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
					name: 'Weak Topics Review',
					description: 'Auto-generated flashcards from weak topics',
				})
				.returning();
			deck = newDeck;
		}

		const mistakes = await getMistakesFromStore();
		const topicMistakes = mistakes.filter((m) => m.topic === topic);

		if (topicMistakes.length === 0) {
			return { success: true, cardsCreated: 0, error: 'no_mistakes_for_topic' };
		}

		let cardsCreated = 0;

		for (const mistake of topicMistakes) {
			const existingCards = await db
				.select()
				.from(flashcards)
				.where(
					and(
						eq(flashcards.deckId, deck!.id),
						eq(flashcards.front, mistake.questionText.substring(0, 500))
					)
				)
				.limit(1);

			if (existingCards.length > 0) continue;

			const back = mistake.explanation
				? `${mistake.correctAnswer}\n\nExplanation: ${mistake.explanation}`
				: mistake.correctAnswer;

			await db.insert(flashcards).values({
				deckId: deck!.id,
				front: mistake.questionText.substring(0, 1000),
				back: back.substring(0, 2000),
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
	} catch (error) {
		console.debug('[AdaptiveLearning] Error generating flashcards:', error);
		return { success: false, cardsCreated: 0, error: 'Generation failed' };
	}
}

export async function updateTopicConfidence(
	topic: string,
	subjectId: number,
	isCorrect: boolean
): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const existing = await db.query.topicConfidence.findFirst({
		where: and(eq(topicConfidence.userId, user.id), eq(topicConfidence.topic, topic)),
	});

	if (existing) {
		const timesAttempted = (existing.timesAttempted || 0) + 1;
		const timesCorrect = (existing.timesCorrect || 0) + (isCorrect ? 1 : 0);
		const newScore = timesCorrect / timesAttempted;

		await db
			.update(topicConfidence)
			.set({
				confidenceScore: newScore.toFixed(2),
				timesCorrect,
				timesAttempted,
				lastAttemptAt: new Date(),
			})
			.where(eq(topicConfidence.id, existing.id));
	} else {
		await db.insert(topicConfidence).values({
			userId: user.id,
			topic,
			subject: subjectId.toString(),
			confidenceScore: isCorrect ? '1.0' : '0.0',
			timesCorrect: isCorrect ? 1 : 0,
			timesAttempted: 1,
		});
	}
}

export interface AdaptiveInsights {
	weakTopics: { topic: string; confidence: number; trend: 'improving' | 'declining' | 'stable' }[];
	recommendedActions: { type: string; topic: string; priority: 'high' | 'medium' | 'low' }[];
}

export interface DifficultyRecommendation {
	recommendedDifficulty: 'easy' | 'medium' | 'hard';
	confidence: number;
	reasoning: string;
	recentAccuracy: number;
	streakFactor: number;
}

export async function calculateOptimalDifficulty(
	subjectId: number,
	topic?: string
): Promise<DifficultyRecommendation> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const whereClause = topic
		? and(
				eq(topicConfidence.userId, user.id),
				eq(topicConfidence.subject, subjectId.toString()),
				eq(topicConfidence.topic, topic)
			)
		: and(eq(topicConfidence.userId, user.id), eq(topicConfidence.subject, subjectId.toString()));

	const recentAttempts = await db
		.select()
		.from(topicConfidence)
		.where(whereClause)
		.orderBy(sql`${topicConfidence.lastAttemptAt} DESC`)
		.limit(20);

	if (recentAttempts.length === 0) {
		return {
			recommendedDifficulty: 'medium',
			confidence: 0.5,
			reasoning: 'No prior performance data available, defaulting to medium difficulty',
			recentAccuracy: 0,
			streakFactor: 1,
		};
	}

	const totalAttempts = recentAttempts.reduce(
		(sum: number, a: typeof topicConfidence.$inferSelect) => sum + (a.timesAttempted || 0),
		0
	);
	const totalCorrect = recentAttempts.reduce(
		(sum: number, a: typeof topicConfidence.$inferSelect) => sum + (a.timesCorrect || 0),
		0
	);
	const recentAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

	const masteryRecords = await db.query.topicMastery.findMany({
		where: and(
			eq(topicMastery.userId, user.id),
			topic ? eq(topicMastery.topic, topic) : undefined,
			eq(topicMastery.subjectId, Number(subjectId))
		),
		orderBy: [sql`${topicMastery.lastPracticed} DESC`],
		limit: 10,
	});

	let consecutiveCorrect = 0;
	let streakFactor = 1;
	if (masteryRecords.length > 0) {
		consecutiveCorrect = masteryRecords[0].consecutiveCorrect || 0;
		if (consecutiveCorrect >= 5) {
			streakFactor = 1.5;
		} else if (consecutiveCorrect >= 3) {
			streakFactor = 1.2;
		} else if (consecutiveCorrect < 0) {
			streakFactor = 0.7;
		}
	}

	const adjustedAccuracy = Math.min(recentAccuracy * streakFactor, 1);

	let recommendedDifficulty: 'easy' | 'medium' | 'hard';
	if (adjustedAccuracy >= 0.85 && recentAccuracy >= 0.8) {
		recommendedDifficulty = 'hard';
	} else if (adjustedAccuracy >= 0.6) {
		recommendedDifficulty = 'medium';
	} else if (adjustedAccuracy >= 0.4) {
		recommendedDifficulty = 'easy';
	} else {
		recommendedDifficulty = 'easy';
	}

	let reasoning: string;
	if (recommendedDifficulty === 'hard') {
		reasoning = `Strong performance detected (${Math.round(recentAccuracy * 100)}% accuracy with ${consecutiveCorrect} correct streak). Ready for challenging questions.`;
	} else if (recommendedDifficulty === 'medium') {
		reasoning = `Moderate performance (${Math.round(recentAccuracy * 100)}% accuracy). Recommended for steady progress.`;
	} else {
		reasoning = `Current accuracy is ${Math.round(recentAccuracy * 100)}%. Starting with easier questions to build confidence.`;
	}

	return {
		recommendedDifficulty,
		confidence: adjustedAccuracy,
		reasoning,
		recentAccuracy,
		streakFactor,
	};
}

export interface AdaptiveInsights {
	weakTopics: { topic: string; confidence: number; trend: 'improving' | 'declining' | 'stable' }[];
	recommendedActions: { type: string; topic: string; priority: 'high' | 'medium' | 'low' }[];
}

export interface TopicWeightage {
	subject: string;
	topic: string;
	weightagePercent: number;
	examPaper: string;
}

export async function getTopicWeightages(subject: string): Promise<TopicWeightage[]> {
	const db = await getDb();

	const weightages = await db.query.topicWeightages.findMany({
		where: eq(topicWeightages.subject, subject),
	});

	return weightages.map((w: typeof topicWeightages.$inferSelect) => ({
		subject: w.subject,
		topic: w.topic,
		weightagePercent: w.weightagePercent,
		examPaper: w.examPaper || 'Paper 1',
	}));
}

export interface PrioritizedTopic {
	topic: string;
	priorityScore: number;
	weightagePercent: number;
	currentMastery: number;
	recommendedAction: 'practice' | 'review' | 'master' | 'skip';
	reasoning: string;
}

export async function getPrioritizedStudyTopics(
	subject: string,
	limit = 5
): Promise<PrioritizedTopic[]> {
	const db = await getDb();
	const user = await ensureAuthenticated();

	const weightages = await getTopicWeightages(subject);

	const topicMasteries = await db.query.topicMastery.findMany({
		where: and(
			eq(topicMastery.userId, user.id),
			subject ? sql`${topicMastery.subjectId} = ${BigInt(subject)}` : undefined
		),
	});

	const masteryMap = new Map<string, (typeof topicMasteries)[number]>();
	for (const m of topicMasteries) {
		masteryMap.set(m.topic, m);
	}

	const prioritizedTopics: PrioritizedTopic[] = [];

	for (const weightage of weightages) {
		const mastery = masteryMap.get(weightage.topic);
		const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;
		const questionsAttempted = mastery?.questionsAttempted || 0;

		const importanceScore = weightage.weightagePercent / 100;
		const weaknessScore = Math.max(0, 1 - masteryLevel);
		const practiceScore = questionsAttempted === 0 ? 0.5 : Math.min(questionsAttempted / 50, 1);

		const priorityScore = importanceScore * 0.5 + weaknessScore * 0.3 + practiceScore * 0.2;

		let recommendedAction: 'practice' | 'review' | 'master' | 'skip';
		let reasoning: string;

		if (masteryLevel >= 0.8) {
			recommendedAction = 'skip';
			reasoning = `Already mastered (${Math.round(masteryLevel * 100)}% mastery)`;
		} else if (masteryLevel >= 0.5) {
			recommendedAction = 'practice';
			reasoning = `Good foundation, needs more practice (${Math.round(masteryLevel * 100)}% mastery)`;
		} else if (questionsAttempted > 0) {
			recommendedAction = 'review';
			reasoning = `Struggling with this important topic (${weightage.weightagePercent}% exam weight)`;
		} else {
			recommendedAction = 'master';
			reasoning = `High-priority topic not yet studied (${weightage.weightagePercent}% exam weight)`;
		}

		prioritizedTopics.push({
			topic: weightage.topic,
			priorityScore,
			weightagePercent: weightage.weightagePercent,
			currentMastery: masteryLevel,
			recommendedAction,
			reasoning,
		});
	}

	prioritizedTopics.sort((a, b) => b.priorityScore - a.priorityScore);
	return prioritizedTopics.slice(0, limit);
}

export async function getAdaptiveInsights(): Promise<AdaptiveInsights> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const confidences = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, user.id),
		orderBy: [sql`${topicConfidence.lastAttemptAt} DESC`],
		limit: 10,
	});

	const weakTopics = confidences
		.filter(
			(c: (typeof confidences)[number]) => Number(c.confidenceScore) < THRESHOLDS.POOR_PERFORMANCE
		)
		.map((c: (typeof confidences)[number]) => ({
			topic: c.topic,
			confidence: Number(c.confidenceScore),
			trend: 'declining' as const,
		}));

	const struggles = await db.query.conceptStruggles.findMany({
		where: and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.isResolved, false)),
	});

	const recommendedActions = struggles.map((s: (typeof struggles)[number]) => ({
		type: s.struggleCount >= 3 ? 'flashcard' : 'review',
		topic: s.concept,
		priority: (s.struggleCount >= 3 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
	}));

	return {
		weakTopics,
		recommendedActions,
	};
}

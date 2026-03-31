import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { questionAttempts, quizResults, topicConfidence } from '@/lib/db/schema';
import { calculateNextReviewBoolean } from '@/lib/spaced-repetition';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}
	return session.user;
}

export interface QuestionAttempt {
	id: string;
	questionId: string;
	topic: string;
	isCorrect: boolean;
	responseTimeMs: number | null;
	intervalDays: number;
	easeFactor: number;
	nextReviewAt: Date | null;
	attemptedAt: Date | null;
}

export interface SpacedRepetitionResult {
	questionIds: string[];
	prioritizeWeakTopics: boolean;
}

// Re-export canonical SM-2 implementations from lib
export {
	calculateNextReview,
	calculateNextReviewBoolean,
	getCrossTopicSuggestions,
} from '@/lib/spaced-repetition';

// Record a question attempt
export async function recordQuestionAttempt(
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
		const { intervalDays, easeFactor } = calculateNextReviewBoolean(
			isCorrect,
			existing.intervalDays,
			Number.parseFloat(existing.easeFactor as string)
		);

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + intervalDays);

		await db
			.update(questionAttempts)
			.set({
				isCorrect,
				responseTimeMs: responseTimeMs ?? existing.responseTimeMs,
				intervalDays,
				easeFactor: easeFactor.toFixed(2) as unknown as typeof questionAttempts.easeFactor,
				nextReviewAt: nextReview,
				attemptedAt: now,
			})
			.where(eq(questionAttempts.id, existing.id));
	} else {
		const { intervalDays, easeFactor } = calculateNextReviewBoolean(isCorrect, 1, 2.5);

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + intervalDays);

		await db.insert(questionAttempts).values({
			userId: user.id,
			questionId,
			topic,
			isCorrect,
			intervalDays,
			easeFactor: easeFactor.toFixed(2) as unknown as string,
			nextReviewAt: nextReview,
		});
	}
}

// Get questions due for review (due now or in past)
export async function getQuestionsDueForReview(): Promise<QuestionAttempt[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const now = new Date();

	const results = await db.query.questionAttempts.findMany({
		where: and(eq(questionAttempts.userId, user.id), lt(questionAttempts.nextReviewAt, now)),
		orderBy: [desc(questionAttempts.nextReviewAt)],
		limit: 20,
	});

	return results.map((r) => ({
		id: r.id,
		questionId: r.questionId,
		topic: r.topic,
		isCorrect: r.isCorrect,
		responseTimeMs: r.responseTimeMs,
		intervalDays: r.intervalDays,
		easeFactor: Number.parseFloat(r.easeFactor as string),
		nextReviewAt: r.nextReviewAt,
		attemptedAt: r.attemptedAt ?? new Date(),
	}));
}

// Get weak topics (topics with lowest confidence)
export async function getWeakTopics(limit = 5): Promise<{ topic: string; confidence: number }[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const results = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, user.id),
		orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
		limit,
	});

	return results.map((r) => ({
		topic: r.topic,
		confidence: Number.parseFloat(r.confidenceScore as string),
	}));
}

// Calculate adaptive difficulty based on recent performance
export async function getAdaptiveDifficulty(): Promise<'easy' | 'medium' | 'hard'> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const recentAttempts = await db.query.questionAttempts.findMany({
		where: eq(questionAttempts.userId, user.id),
		orderBy: [desc(questionAttempts.attemptedAt)],
		limit: 10,
	});

	if (recentAttempts.length < 5) {
		return 'medium';
	}

	const correctCount = recentAttempts.filter((a) => a.isCorrect).length;
	const accuracy = correctCount / recentAttempts.length;

	if (accuracy >= 0.8) return 'hard';
	if (accuracy >= 0.5) return 'medium';
	return 'easy';
}

export interface ReviewQueueItem {
	id: string;
	questionId: string;
	topic: string;
	subject: string;
	isCorrect: boolean;
	responseTimeMs: number | null;
	intervalDays: number;
	easeFactor: number;
	nextReviewAt: Date | null;
	attemptedAt: Date | null;
	forgettingScore: number;
}

function calculateForgettingScore(
	lastReview: Date | null,
	easeFactor: number,
	intervalDays: number
): number {
	if (!lastReview) return 100;

	const now = new Date();
	const daysSinceReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);

	const easeWeight = Math.max(0.5, Math.min(2.5, easeFactor - 1.3)) / 2;
	const decayRate = 0.1 / easeWeight;
	const forgettingCurve = Math.exp(-decayRate * daysSinceReview);

	const intervalPenalty =
		intervalDays > 30 ? 0.5 : intervalDays > 14 ? 0.7 : intervalDays > 7 ? 0.85 : 1;

	return Math.min(100, Math.round(forgettingCurve * intervalPenalty * 100));
}

export async function getQuizQuestionsForReview(limit = 20): Promise<ReviewQueueItem[]> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const now = new Date();

	const attempts = await db.query.questionAttempts.findMany({
		where: and(eq(questionAttempts.userId, user.id), lt(questionAttempts.nextReviewAt, now)),
		orderBy: [desc(questionAttempts.nextReviewAt)],
		limit: limit * 2,
	});

	const topicConfidenceMap = new Map<string, { confidence: number; subject: string }>();
	const confidenceData = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, user.id),
	});
	for (const tc of confidenceData) {
		topicConfidenceMap.set(tc.topic, {
			confidence: Number.parseFloat(tc.confidenceScore as string),
			subject: tc.subject,
		});
	}

	const reviewItems: ReviewQueueItem[] = attempts.map((attempt) => {
		const confidence = topicConfidenceMap.get(attempt.topic);
		const forgettingScore = calculateForgettingScore(
			attempt.attemptedAt,
			Number.parseFloat(attempt.easeFactor as string),
			attempt.intervalDays
		);

		return {
			id: attempt.id,
			questionId: attempt.questionId,
			topic: attempt.topic,
			subject: confidence?.subject || '',
			isCorrect: attempt.isCorrect,
			responseTimeMs: attempt.responseTimeMs,
			intervalDays: attempt.intervalDays,
			easeFactor: Number.parseFloat(attempt.easeFactor as string),
			nextReviewAt: attempt.nextReviewAt,
			attemptedAt: attempt.attemptedAt,
			forgettingScore,
		};
	});

	reviewItems.sort((a, b) => b.forgettingScore - a.forgettingScore);

	return reviewItems.slice(0, limit);
}

export async function recordQuizResultWithSR(
	quizId: string,
	questionResults: Array<{
		questionId: string;
		topic: string;
		subject: string;
		isCorrect: boolean;
		responseTimeMs: number;
	}>
): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const now = new Date();
	const userId = user.id;

	const quizResult = await db.query.quizResults.findFirst({
		where: and(eq(quizResults.userId, userId), eq(quizResults.quizId, quizId)),
	});

	if (!quizResult) {
		const correctCount = questionResults.filter((r) => r.isCorrect).length;
		const totalQuestions = questionResults.length;
		const percentage =
			totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : '0';

		await db.insert(quizResults).values({
			userId,
			quizId,
			score: correctCount,
			totalQuestions,
			percentage: percentage as `${number}.${number}`,
			timeTaken: questionResults.reduce((sum, r) => sum + r.responseTimeMs, 0) / 1000,
			completedAt: now,
		});
	}

	const confidenceData = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, userId),
	});

	const topicConfidenceMap = new Map<
		string,
		{
			id: string;
			confidence: string;
			timesCorrect: number;
			timesAttempted: number;
		}
	>();
	for (const tc of confidenceData) {
		topicConfidenceMap.set(tc.topic, {
			id: tc.id,
			confidence: tc.confidenceScore as string,
			timesCorrect: tc.timesCorrect,
			timesAttempted: tc.timesAttempted,
		});
	}

	for (const result of questionResults) {
		await recordQuestionAttempt(
			result.questionId,
			result.topic,
			result.isCorrect,
			result.responseTimeMs
		);

		const confidence = topicConfidenceMap.get(result.topic);
		if (confidence) {
			const newConfidence = result.isCorrect
				? Math.min(1, Number(confidence.confidence) + 0.05)
				: Math.max(0, Number(confidence.confidence) - 0.1);

			await db
				.update(topicConfidence)
				.set({
					confidenceScore: newConfidence.toFixed(
						2
					) as unknown as typeof topicConfidence.confidenceScore,
					timesAttempted: confidence.timesAttempted + 1,
					timesCorrect: result.isCorrect ? confidence.timesCorrect + 1 : confidence.timesCorrect,
					lastAttemptAt: now,
					updatedAt: now,
				})
				.where(eq(topicConfidence.id, confidence.id));
		} else {
			await db.insert(topicConfidence).values({
				userId,
				topic: result.topic,
				subject: result.subject,
				confidenceScore: result.isCorrect ? '0.6' : '0.3',
				timesCorrect: result.isCorrect ? 1 : 0,
				timesAttempted: 1,
				lastAttemptAt: now,
			});
		}
	}
}

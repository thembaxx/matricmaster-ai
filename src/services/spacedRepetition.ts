import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { questionAttempts, topicConfidence } from '@/lib/db/schema';

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

// SM-2 Algorithm simplified
// Returns new interval days and ease factor
export function calculateNextReview(
	isCorrect: boolean,
	currentInterval: number,
	currentEaseFactor: number
): { intervalDays: number; easeFactor: number } {
	if (isCorrect) {
		// Increase interval
		const newInterval = Math.round(currentInterval * currentEaseFactor);
		const newEaseFactor = Math.max(1.3, currentEaseFactor + 0.1);
		return {
			intervalDays: Math.min(newInterval, 30), // Cap at 30 days
			easeFactor: newEaseFactor,
		};
	}
	// Reset interval, decrease ease factor
	return {
		intervalDays: 1,
		easeFactor: Math.max(1.3, currentEaseFactor - 0.2),
	};
}

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
		const { intervalDays, easeFactor } = calculateNextReview(
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
		const { intervalDays, easeFactor } = calculateNextReview(isCorrect, 1, 2.5);

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + intervalDays);

		const values = {
			userId: user.id,
			questionId,
			topic,
			isCorrect,
			intervalDays,
			easeFactor: easeFactor.toFixed(2),
			nextReviewAt: nextReview,
		};

		await db.insert(questionAttempts).values(values as any);
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

	// Get last 10 attempts
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

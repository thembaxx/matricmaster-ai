'use server';

import { and, desc, eq } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/db/auth-utils';
import { questionAttempts, quizResults } from '@/lib/db/schema';
import { calculateNextReviewBoolean } from '@/lib/spaced-repetition';

export interface QuizQuestionResult {
	questionId: string;
	topic: string;
	subject: string;
	isCorrect: boolean;
	responseTimeMs: number;
	selectedAnswer?: string;
	correctAnswer?: string;
}

export interface QuizWithSRResult {
	success: boolean;
	quizResultId?: string;
	questionResults?: QuizQuestionResult[];
	error?: string;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export async function saveQuizResultWithSpacedRepetition(
	quizId: string,
	_subjectId: number | undefined,
	_topic: string,
	score: number,
	totalQuestions: number,
	timeTakenSeconds: number,
	questionResults: QuizQuestionResult[],
	isReviewMode = false
): Promise<QuizWithSRResult> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : '0';

		const quizResult = await db
			.insert(quizResults)
			.values({
				userId: user.id,
				quizId,
				score,
				totalQuestions,
				percentage: percentage as `${number}.${number}`,
				timeTaken: timeTakenSeconds,
				completedAt: new Date(),
				questionResults: JSON.stringify(questionResults),
				source: isReviewMode ? 'review' : 'quiz',
				isReviewMode,
			})
			.returning();

		for (const result of questionResults) {
			const existingAttempt = await db.query.questionAttempts.findFirst({
				where: and(
					eq(questionAttempts.userId, user.id),
					eq(questionAttempts.questionId, result.questionId)
				),
			});

			const now = new Date();
			let consecutiveCorrect = 0;

			if (existingAttempt) {
				consecutiveCorrect = result.isCorrect
					? existingAttempt.isCorrect
						? existingAttempt.isCorrect
							? 1
							: 0
						: 0
					: 0;
			}

			const { intervalDays, easeFactor } = calculateNextReviewBoolean(
				result.isCorrect,
				existingAttempt?.intervalDays || 1,
				Number.parseFloat((existingAttempt?.easeFactor as string) || '2.5'),
				consecutiveCorrect
			);

			const nextReview = new Date(now);
			nextReview.setDate(nextReview.getDate() + intervalDays);

			if (existingAttempt) {
				await db
					.update(questionAttempts)
					.set({
						isCorrect: result.isCorrect,
						responseTimeMs: result.responseTimeMs,
						intervalDays,
						easeFactor: easeFactor.toFixed(2) as unknown as typeof questionAttempts.easeFactor,
						nextReviewAt: nextReview,
						attemptedAt: now,
					})
					.where(eq(questionAttempts.id, existingAttempt.id));
			} else {
				await db.insert(questionAttempts).values({
					userId: user.id,
					questionId: result.questionId,
					topic: result.topic,
					subject: result.subject,
					isCorrect: result.isCorrect,
					responseTimeMs: result.responseTimeMs,
					intervalDays,
					easeFactor: easeFactor.toFixed(2) as unknown as string,
					nextReviewAt: nextReview,
					attemptedAt: now,
					source: isReviewMode ? 'review' : 'quiz',
				});
			}
		}

		return {
			success: true,
			quizResultId: quizResult[0]?.id,
			questionResults,
		};
	} catch (error) {
		console.error('Error saving quiz result with SR:', error);
		return { success: false, error: 'Failed to save quiz result' };
	}
}

export async function getQuizResultsHistory(limit = 10) {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const results = await db.query.quizResults.findMany({
			where: eq(quizResults.userId, user.id),
			orderBy: [desc(quizResults.completedAt)],
			limit,
		});

		return results.map((r) => ({
			id: r.id,
			quizId: r.quizId,
			score: r.score,
			totalQuestions: r.totalQuestions,
			percentage: Number.parseFloat(r.percentage as string),
			timeTaken: r.timeTaken,
			completedAt: r.completedAt,
			questionResults: r.questionResults ? JSON.parse(r.questionResults) : [],
			source: r.source,
			isReviewMode: r.isReviewMode,
		}));
	} catch (error) {
		console.error('Error getting quiz history:', error);
		return [];
	}
}

export async function getWeakTopicsFromQuiz(quizId: string): Promise<string[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const quiz = await db.query.quizResults.findFirst({
			where: and(eq(quizResults.userId, user.id), eq(quizResults.quizId, quizId)),
		});

		if (!quiz?.questionResults) {
			return [];
		}

		const results = JSON.parse(quiz.questionResults) as QuizQuestionResult[];
		const topicPerformance = new Map<string, { correct: number; total: number }>();

		for (const result of results) {
			const existing = topicPerformance.get(result.topic) || { correct: 0, total: 0 };
			existing.total++;
			if (result.isCorrect) {
				existing.correct++;
			}
			topicPerformance.set(result.topic, existing);
		}

		const weakTopics: string[] = [];
		topicPerformance.forEach((perf, topic) => {
			const accuracy = perf.total > 0 ? perf.correct / perf.total : 0;
			if (accuracy < 0.6) {
				weakTopics.push(topic);
			}
		});

		return weakTopics;
	} catch (error) {
		console.error('Error getting weak topics:', error);
		return [];
	}
}

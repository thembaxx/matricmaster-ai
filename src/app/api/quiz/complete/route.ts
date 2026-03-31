import { and, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { getAuth } from '@/lib/auth';
import { dbManager, getDb } from '@/lib/db';
import {
	leaderboardEntries,
	quizResults,
	studyPlans,
	topicMastery,
	userProgress,
} from '@/lib/db/schema';
import { detectWeakTopics, type QuizResultForAnalysis, type TopicStats } from '@/lib/quiz-grader';
import { processQuizMistakes, type WrongAnswerData } from '@/services/wrongAnswerPipeline';

export interface QuizAnswer {
	questionId: string;
	questionText: string;
	selectedOption: string | null;
	correctOption: string | null;
	isCorrect: boolean;
	timeSpentMs: number;
	confidenceLevel?: 'sure' | 'guess' | 'unsure';
	partialCredit?: number;
	explanation?: string;
}

export interface QuizCompletionRequest {
	quizId: string;
	subjectId: number;
	topic?: string;
	score: number;
	totalQuestions: number;
	percentage: number;
	timeTaken: number;
	answers: QuizAnswer[];
}

interface CompletionResponse {
	success: boolean;
	resultId: string;
	xpEarned: number;
	flashcardsCreated: number;
	weakTopicsDetected: number;
	studyPlanAdjusted: boolean;
	performance: {
		score: number;
		accuracy: number;
		averageTimeMs: number;
	};
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body: QuizCompletionRequest = await request.json();
		const { quizId, subjectId, topic, score, totalQuestions, percentage, timeTaken, answers } =
			body;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		const db = await getDb();
		const userId = session.user.id;

		const [savedResult] = await db
			.insert(quizResults)
			.values({
				userId,
				quizId,
				score,
				totalQuestions,
				percentage: percentage.toString(),
				timeTaken,
				completedAt: new Date(),
			})
			.returning();

		const averageTimeMs =
			answers.length > 0
				? answers.reduce((sum, a) => sum + (a.timeSpentMs || 0), 0) / answers.length
				: 0;

		const wrongAnswers = answers.filter((a) => !a.isCorrect);
		const slowCorrectAnswers = answers.filter(
			(a) => a.isCorrect && a.timeSpentMs > averageTimeMs * 2 && a.confidenceLevel !== 'sure'
		);

		const flashcardsToCreate: WrongAnswerData[] = [
			...wrongAnswers.map((a) => ({
				questionId: a.questionId,
				questionText: a.questionText,
				correctAnswer: a.correctOption || '',
				userAnswer: a.selectedOption || undefined,
				explanation: a.explanation,
				topic: topic || 'General',
				subject: subjectId.toString(),
				difficulty: 'medium' as const,
			})),
			...slowCorrectAnswers.map((a) => ({
				questionId: a.questionId,
				questionText: a.questionText,
				correctAnswer: a.correctOption || '',
				userAnswer: a.selectedOption || undefined,
				explanation: a.explanation || 'This was a slow but correct answer - review for efficiency',
				topic: topic || 'General',
				subject: subjectId.toString(),
				difficulty: 'hard' as const,
			})),
		];

		let flashcardsCreated = 0;
		if (flashcardsToCreate.length > 0) {
			try {
				const result = await processQuizMistakes(flashcardsToCreate);
				flashcardsCreated = result.createdCount;
			} catch (error) {
				console.debug('[QuizComplete] Flashcard generation error:', error);
			}
		}

		const existingMastery = await db.query.topicMastery.findFirst({
			where: and(eq(topicMastery.userId, userId), eq(topicMastery.subjectId, subjectId)),
		});

		if (existingMastery) {
			const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;
			const newMastery = Math.min(
				100,
				Math.max(0, Number(existingMastery.masteryLevel) + accuracy * 20 - 10)
			);

			await db
				.update(topicMastery)
				.set({
					masteryLevel: newMastery.toString(),
					questionsAttempted: sql`${topicMastery.questionsAttempted} + ${totalQuestions}`,
					questionsCorrect: sql`${topicMastery.questionsCorrect} + ${score}`,
					lastPracticed: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(topicMastery.id, existingMastery.id));
		} else {
			await db.insert(topicMastery).values({
				userId,
				subjectId,
				topic: topic || 'General',
				masteryLevel: '0',
				questionsAttempted: totalQuestions,
				questionsCorrect: score,
			});
		}

		const topicStats: TopicStats[] = [
			{
				topic: topic || 'General',
				correct: score,
				total: totalQuestions,
				timeMs: answers.map((a) => a.timeSpentMs),
			},
		];

		const quizResultForAnalysis: QuizResultForAnalysis = {
			quizId,
			subject: subjectId.toString(),
			topics: topicStats,
			totalTimeSeconds: timeTaken,
		};

		const weakTopics = detectWeakTopics(quizResultForAnalysis);

		let studyPlanAdjusted = false;
		if (weakTopics.length > 0) {
			const activePlan = await db.query.studyPlans.findFirst({
				where: and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)),
			});

			if (activePlan) {
				studyPlanAdjusted = true;
			}
		}

		const existingProgress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		const xpEarned = Math.round(score * 1.5);

		if (existingProgress) {
			await db
				.update(userProgress)
				.set({
					totalQuestionsAttempted: sql`${userProgress.totalQuestionsAttempted} + ${totalQuestions}`,
					totalCorrect: sql`${userProgress.totalCorrect} + ${score}`,
					totalMarksEarned: sql`${userProgress.totalMarksEarned} + ${xpEarned}`,
					lastActivityAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(userProgress.id, existingProgress.id));
		} else {
			await db.insert(userProgress).values({
				userId,
				subjectId,
				topic: topic || 'General',
				totalQuestionsAttempted: totalQuestions,
				totalCorrect: score,
				totalMarksEarned: xpEarned,
				streakDays: 1,
			});
		}

		const now = new Date();
		const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

		const existingLeaderboard = await db.query.leaderboardEntries.findFirst({
			where: and(
				eq(leaderboardEntries.userId, userId),
				eq(leaderboardEntries.periodType, 'monthly'),
				eq(leaderboardEntries.periodStart, periodStart)
			),
		});

		if (existingLeaderboard) {
			await db
				.update(leaderboardEntries)
				.set({
					totalPoints: sql`${leaderboardEntries.totalPoints} + ${xpEarned}`,
					questionsCompleted: sql`${leaderboardEntries.questionsCompleted} + ${totalQuestions}`,
					accuracyPercentage: Math.round((score / totalQuestions) * 100),
					updatedAt: new Date(),
				})
				.where(eq(leaderboardEntries.id, existingLeaderboard.id));
		} else {
			await db.insert(leaderboardEntries).values({
				userId,
				periodType: 'monthly',
				periodStart,
				totalPoints: xpEarned,
				questionsCompleted: totalQuestions,
				accuracyPercentage: Math.round((score / totalQuestions) * 100),
			});
		}

		await trackEvent({
			event: 'quiz_completed',
			userId,
			properties: {
				quizId,
				subjectId,
				score,
				totalQuestions,
				xpEarned,
				flashcardsCreated,
			},
		});

		const response: CompletionResponse = {
			success: true,
			resultId: savedResult.id,
			xpEarned,
			flashcardsCreated,
			weakTopicsDetected: weakTopics.length,
			studyPlanAdjusted,
			performance: {
				score,
				accuracy: Math.round((score / totalQuestions) * 100),
				averageTimeMs: Math.round(averageTimeMs),
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('[QuizComplete] Error:', error);
		return NextResponse.json({ error: 'Failed to complete quiz' }, { status: 500 });
	}
}

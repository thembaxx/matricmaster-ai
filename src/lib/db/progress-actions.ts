'use server';

import { and, desc, eq } from 'drizzle-orm';
import type { WeakTopic } from '@/lib/quiz-grader';
import { detectWeakTopics, type QuizResultForAnalysis } from '@/lib/quiz-grader';
import { ensureAuthenticated } from './actions';
import { dbManager } from './index';
import { leaderboardEntries, type StudySession, studySessions, userProgress } from './schema';
import { adjustStudyPlanForWeakTopics } from './study-plan-actions';

export interface ActivityResult {
	subjectId?: number;
	topic?: string;
	score: number;
	totalQuestions: number;
	marksEarned: number;
}

export type ProgressUpdateData = ActivityResult;

export interface UserProgressSummary {
	totalQuestionsAttempted: number;
	totalCorrect: number;
	totalMarksEarned: number;
	accuracy: number;
	streakDays: number;
	recentSessions: StudySession[];
}

/**
 * Gets a summary of user progress
 */
export async function getUserProgressSummary(): Promise<UserProgressSummary | null> {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, user.id),
		});

		if (!progress) return null;

		// Fetch recent sessions
		const recent = await db.query.studySessions.findMany({
			where: eq(studySessions.userId, user.id),
			orderBy: [desc(studySessions.completedAt)],
			limit: 5,
		});

		return {
			totalQuestionsAttempted: progress.totalQuestionsAttempted,
			totalCorrect: progress.totalCorrect,
			totalMarksEarned: progress.totalMarksEarned,
			accuracy:
				progress.totalQuestionsAttempted > 0
					? Math.round((progress.totalCorrect / progress.totalQuestionsAttempted) * 100)
					: 0,
			streakDays: progress.streakDays,
			recentSessions: recent,
		};
	} catch (error) {
		console.debug('Error getting progress summary:', error);
		return null;
	}
}

/**
 * Gets the current user's streak
 */
export async function getUserStreak() {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, user.id),
		});

		return {
			currentStreak: progress?.streakDays || 0,
			bestStreak: progress?.bestStreak || 0,
			lastActivityDate: progress?.lastActivityAt?.toISOString() || null,
		};
	} catch (error) {
		console.debug('Error getting user streak:', error);
		return { currentStreak: 0, bestStreak: 0, lastActivityDate: null };
	}
}

/**
 * Records a study session
 */
export async function recordStudySession(data: {
	subjectId?: number;
	topic?: string;
	duration?: number;
	durationMinutes?: number;
	marksEarned: number;
	questionsAttempted?: number;
	correctAnswers?: number;
	sessionType?: string;
}) {
	// Implementation for recording study sessions
	return await completeActivityAction({
		subjectId: data.subjectId,
		topic: data.topic,
		score: data.correctAnswers || 0,
		totalQuestions: data.questionsAttempted || 0,
		marksEarned: data.marksEarned,
	});
}

/**
 * Updates user progress and leaderboard stats when an activity is completed.
 * This is the core XP and Leveling link.
 */
export async function completeActivityAction(result: ActivityResult) {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		// 1. Update User Progress
		// Check if progress exists for this user
		const existingProgress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, user.id),
		});

		if (existingProgress) {
			await db
				.update(userProgress)
				.set({
					totalQuestionsAttempted: existingProgress.totalQuestionsAttempted + result.totalQuestions,
					totalCorrect: existingProgress.totalCorrect + result.score,
					totalMarksEarned: existingProgress.totalMarksEarned + result.marksEarned,
					lastActivityAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(userProgress.id, existingProgress.id));
		} else {
			await db.insert(userProgress).values({
				userId: user.id,
				subjectId: result.subjectId,
				topic: result.topic,
				totalQuestionsAttempted: result.totalQuestions,
				totalCorrect: result.score,
				totalMarksEarned: result.marksEarned,
			});
		}

		// 2. Update Leaderboard (Current Month)
		const now = new Date();
		const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

		const existingLeaderboard = await db.query.leaderboardEntries.findFirst({
			where: and(
				eq(leaderboardEntries.userId, user.id),
				eq(leaderboardEntries.periodType, 'monthly'),
				eq(leaderboardEntries.periodStart, periodStart)
			),
		});

		if (existingLeaderboard) {
			await db
				.update(leaderboardEntries)
				.set({
					totalPoints: existingLeaderboard.totalPoints + result.marksEarned,
					questionsCompleted: existingLeaderboard.questionsCompleted + result.totalQuestions,
					updatedAt: new Date(),
				})
				.where(eq(leaderboardEntries.id, existingLeaderboard.id));
		} else {
			await db.insert(leaderboardEntries).values({
				userId: user.id,
				periodType: 'monthly',
				periodStart: periodStart,
				totalPoints: result.marksEarned,
				questionsCompleted: result.totalQuestions,
			});
		}

		return { success: true, xpGained: result.marksEarned };
	} catch (error) {
		console.debug('Error in completeActivityAction:', error);
		return { success: false, error: 'Failed to update progress' };
	}
}

// ============================================================================
// QUIZ RESULT PROCESSING FOR STUDY PLAN INTEGRATION
// ============================================================================

interface QuizResultProcessingResult {
	success: boolean;
	weakTopicsDetected: number;
	weakTopics: WeakTopic[];
	studyPlanAdjusted: boolean;
	studyPlanAdjustment?: {
		topicsPrioritized: string[];
		difficultyAdjustments: Array<{
			topic: string;
			newDifficulty: 'easier' | 'harder' | 'same';
			reason: string;
		}>;
		focusAreasUpdated: boolean;
		sessionsReordered: boolean;
	};
	error?: string;
}

/**
 * Processes quiz results to detect weak topics and adjust the user's study plan
 * This is the main integration point between quiz completion and study plan adjustment
 */
export async function processQuizResultForStudyPlan(
	quizResult: QuizResultForAnalysis
): Promise<QuizResultProcessingResult> {
	try {
		const user = await ensureAuthenticated();

		// Detect weak topics from quiz results
		const weakTopics = detectWeakTopics(quizResult);

		// If no weak topics detected, return early
		if (weakTopics.length === 0) {
			return {
				success: true,
				weakTopicsDetected: 0,
				weakTopics: [],
				studyPlanAdjusted: false,
			};
		}

		// Adjust study plan based on weak topics
		const adjustmentResult = await adjustStudyPlanForWeakTopics(user.id, weakTopics);

		if (!adjustmentResult.success) {
			console.warn('[Quiz Processing] Study plan adjustment failed:', adjustmentResult.error);
			return {
				success: true,
				weakTopicsDetected: weakTopics.length,
				weakTopics,
				studyPlanAdjusted: false,
				error: adjustmentResult.error,
			};
		}

		return {
			success: true,
			weakTopicsDetected: weakTopics.length,
			weakTopics,
			studyPlanAdjusted: true,
			studyPlanAdjustment: adjustmentResult.adjustment,
		};
	} catch (error) {
		console.error('[Quiz Processing] Error processing quiz result:', error);
		return {
			success: false,
			weakTopicsDetected: 0,
			weakTopics: [],
			studyPlanAdjusted: false,
			error: error instanceof Error ? error.message : 'Failed to process quiz result',
		};
	}
}

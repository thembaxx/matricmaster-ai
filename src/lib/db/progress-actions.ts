'use server';

import { eq, sql, and } from 'drizzle-orm';
import { dbManager } from './index';
import { userProgress, leaderboardEntries, subjects } from './schema';
import { ensureAuthenticated } from './actions';

export interface ActivityResult {
    subjectId?: number;
    topic?: string;
    score: number;
    totalQuestions: number;
    marksEarned: number;
}

/**
 * Updates user progress and leaderboard stats when an activity is completed.
 * This is the core XP and Leveling link.
 */
export async function completeActivityAction(result: ActivityResult) {
    try {
        const user = await ensureAuthenticated();
        const db = dbManager.getDb();

        // 1. Update User Progress
        // Check if progress exists for this user
        const existingProgress = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, user.id)
        });

        if (existingProgress) {
            await db.update(userProgress)
                .set({
                    totalQuestionsAttempted: existingProgress.totalQuestionsAttempted + result.totalQuestions,
                    totalCorrect: existingProgress.totalCorrect + result.score,
                    totalMarksEarned: existingProgress.totalMarksEarned + result.marksEarned,
                    lastActivityAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(userProgress.id, existingProgress.id));
        } else {
            await db.insert(userProgress)
                .values({
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
            )
        });

        if (existingLeaderboard) {
            await db.update(leaderboardEntries)
                .set({
                    totalPoints: existingLeaderboard.totalPoints + result.marksEarned,
                    questionsCompleted: existingLeaderboard.questionsCompleted + result.totalQuestions,
                    updatedAt: new Date(),
                })
                .where(eq(leaderboardEntries.id, existingLeaderboard.id));
        } else {
            await db.insert(leaderboardEntries)
                .values({
                    userId: user.id,
                    periodType: 'monthly',
                    periodStart: periodStart,
                    totalPoints: result.marksEarned,
                    questionsCompleted: result.totalQuestions,
                });
        }

        return { success: true, xpGained: result.marksEarned };
    } catch (error) {
        console.error('Error in completeActivityAction:', error);
        return { success: false, error: 'Failed to update progress' };
    }
}

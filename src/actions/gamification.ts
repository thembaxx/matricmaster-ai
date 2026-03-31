'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { ACHIEVEMENT_DEFS, type Achievement, type APSProgress } from '@/content';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	flashcardReviews,
	leaderboardEntries,
	questionAttempts,
	quizResults,
	studySessions,
	universityTargets,
	userAchievements,
	userProgress,
} from '@/lib/db/schema';
import { getUnifiedApsScore } from '@/services/apsCalculationEngine';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

export async function checkAndUnlockAchievements(): Promise<{
	success: boolean;
	error?: string;
	achievements?: Achievement[];
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const userId = session.user.id;
		const newAchievements: Achievement[] = [];

		const existingAchievements = await db.query.userAchievements.findMany({
			where: eq(userAchievements.userId, userId),
		});
		const existingIds = new Set(
			existingAchievements.map((a: (typeof existingAchievements)[number]) => a.achievementId)
		);

		const quizCount = await db.query.quizResults.findMany({
			where: eq(quizResults.userId, userId),
		});

		if (quizCount.length >= 1 && !existingIds.has('first_quiz')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.FIRST_QUIZ);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.FIRST_QUIZ, unlockedAt: new Date() });
		}

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		if (progress && progress.streakDays >= 7 && !existingIds.has('streak_7')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.STREAK_7);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.STREAK_7, unlockedAt: new Date() });
		}

		if (progress && progress.streakDays >= 30 && !existingIds.has('streak_30')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.STREAK_30);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.STREAK_30, unlockedAt: new Date() });
		}

		const perfectQuizzes = quizCount.filter(
			(q: (typeof quizCount)[number]) => Number(q.percentage) === 100
		);
		if (perfectQuizzes.length >= 1 && !existingIds.has('perfect_quiz')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.PERFECT_QUIZ);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.PERFECT_QUIZ, unlockedAt: new Date() });
		}

		const flashcardCount = await db.query.flashcardReviews.findMany({
			where: eq(flashcardReviews.userId, userId),
		});

		if (flashcardCount.length >= 100 && !existingIds.has('flashcard_100')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.FLASHCARD_100);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.FLASHCARD_100, unlockedAt: new Date() });
		}

		const hour = new Date().getHours();
		if (hour < 7 && !existingIds.has('early_bird')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.EARLY_BIRD);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.EARLY_BIRD, unlockedAt: new Date() });
		}

		if (hour >= 22 && !existingIds.has('night_owl')) {
			await unlockAchievement(userId, ACHIEVEMENT_DEFS.NIGHT_OWL);
			newAchievements.push({ ...ACHIEVEMENT_DEFS.NIGHT_OWL, unlockedAt: new Date() });
		}

		return { success: true, achievements: newAchievements };
	} catch (error) {
		console.error('checkAndUnlockAchievements failed:', error);
		return { success: false, error: 'Failed to check achievements' };
	}
}

async function unlockAchievement(userId: string, achievement: typeof ACHIEVEMENT_DEFS.FIRST_QUIZ) {
	const db = await getDb();

	await db.insert(userAchievements).values({
		userId,
		achievementId: achievement.id,
		title: achievement.title,
		description: achievement.description,
		icon: achievement.icon,
	});
}

export async function updateStreak(): Promise<{
	success: boolean;
	error?: string;
	streakDays?: number;
	bonusPoints?: number;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const userId = session.user.id;

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		const lastActivity = progress?.lastActivityAt ? new Date(progress.lastActivityAt) : null;
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		let streakDays = progress?.streakDays || 0;
		let bonusPoints = 0;

		if (lastActivity) {
			const lastDay = new Date(
				lastActivity.getFullYear(),
				lastActivity.getMonth(),
				lastActivity.getDate()
			);
			const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

			if (daysDiff === 0) {
				return { success: true, streakDays, bonusPoints: 0 };
			}
			if (daysDiff === 1) {
				streakDays++;
				bonusPoints = Math.min(streakDays * 10, 100);
			} else {
				streakDays = 1;
				bonusPoints = 10;
			}
		} else {
			streakDays = 1;
			bonusPoints = 10;
		}

		const bestStreak = Math.max(streakDays, progress?.bestStreak || 0);

		await db
			.insert(userProgress)
			.values({
				userId,
				streakDays,
				bestStreak,
				lastActivityAt: now,
			})
			.onConflictDoUpdate({
				target: [userProgress.userId],
				set: {
					streakDays,
					bestStreak,
					lastActivityAt: now,
					updatedAt: now,
				},
			});

		await checkAndUnlockAchievements();

		return { success: true, streakDays, bonusPoints };
	} catch (error) {
		console.error('updateStreak failed:', error);
		return { success: false, error: 'Failed to update streak' };
	}
}

export async function claimLoginBonus(): Promise<{
	success: boolean;
	error?: string;
	bonus?: number;
	streakDays?: number;
	totalBonuses?: number;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const userId = session.user.id;

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		const lastBonus = progress?.lastLoginBonusAt;
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		if (lastBonus) {
			const lastBonusDay = new Date(
				lastBonus.getFullYear(),
				lastBonus.getMonth(),
				lastBonus.getDate()
			);
			if (lastBonusDay.getTime() === today.getTime()) {
				return { success: false, error: 'Bonus already claimed today' };
			}
		}

		const streakDays = progress?.consecutiveLoginDays || 0;
		const bonus = Math.min(50 + streakDays * 10, 200);
		const totalBonuses = (progress?.totalLoginBonusesClaimed || 0) + 1;

		await db
			.insert(userProgress)
			.values({
				userId,
				lastLoginBonusAt: now,
				consecutiveLoginDays: streakDays + 1,
				totalLoginBonusesClaimed: totalBonuses,
				totalMarksEarned: (progress?.totalMarksEarned || 0) + bonus,
			})
			.onConflictDoUpdate({
				target: [userProgress.userId],
				set: {
					lastLoginBonusAt: now,
					consecutiveLoginDays: streakDays + 1,
					totalLoginBonusesClaimed: totalBonuses,
					totalMarksEarned: (progress?.totalMarksEarned || 0) + bonus,
					updatedAt: now,
				},
			});

		await checkAndUnlockAchievements();

		return { success: true, bonus, streakDays: streakDays + 1, totalBonuses };
	} catch (error) {
		console.error('claimLoginBonus failed:', error);
		return { success: false, error: 'Failed to claim login bonus' };
	}
}

export async function calculateLeaderboardPoints(): Promise<{
	success: boolean;
	error?: string;
	points?: number;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const userId = session.user.id;

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		const achievements = await db.query.userAchievements.findMany({
			where: eq(userAchievements.userId, userId),
		});

		const recentSessions = await db.query.studySessions.findMany({
			where: and(
				eq(studySessions.userId, userId),
				gte(studySessions.startedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
			),
		});

		const pointsFromProgress = (progress?.totalMarksEarned || 0) / 10;
		const pointsFromAchievements = achievements.length * 50;
		const pointsFromStreak = (progress?.streakDays || 0) * 5;
		const pointsFromActivity = recentSessions.length * 10;

		const points = Math.floor(
			pointsFromProgress + pointsFromAchievements + pointsFromStreak + pointsFromActivity
		);

		return { success: true, points };
	} catch (error) {
		console.error('calculateLeaderboardPoints failed:', error);
		return { success: false, error: 'Failed to calculate leaderboard points' };
	}
}

export async function syncLeaderboard(
	periodType = 'weekly'
): Promise<{ success: boolean; error?: string }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const userId = session.user.id;

		const pointsResult = await calculateLeaderboardPoints();
		if (!pointsResult.success || pointsResult.points === undefined) {
			return { success: false, error: pointsResult.error || 'Failed to calculate points' };
		}
		const points = pointsResult.points;
		const periodStart = getPeriodStart(periodType);

		await db
			.insert(leaderboardEntries)
			.values({
				userId,
				periodType,
				periodStart,
				totalPoints: points,
				rank: 0,
			})
			.onConflictDoUpdate({
				target: [
					leaderboardEntries.userId,
					leaderboardEntries.periodType,
					leaderboardEntries.periodStart,
				],
				set: {
					totalPoints: points,
					updatedAt: new Date(),
				},
			});

		const allEntries = await db.query.leaderboardEntries.findMany({
			where: and(
				eq(leaderboardEntries.periodType, periodType),
				eq(leaderboardEntries.periodStart, periodStart)
			),
			orderBy: [desc(leaderboardEntries.totalPoints)],
		});

		for (let i = 0; i < allEntries.length; i++) {
			await db
				.update(leaderboardEntries)
				.set({ rank: i + 1 })
				.where(eq(leaderboardEntries.id, allEntries[i].id));
		}

		return { success: true };
	} catch (error) {
		console.error('syncLeaderboard failed:', error);
		return { success: false, error: 'Failed to sync leaderboard' };
	}
}

function getPeriodStart(periodType: string): Date {
	const now = new Date();
	switch (periodType) {
		case 'daily':
			now.setHours(0, 0, 0, 0);
			break;
		case 'weekly':
			now.setDate(now.getDate() - now.getDay());
			now.setHours(0, 0, 0, 0);
			break;
		case 'monthly':
			now.setDate(1);
			now.setHours(0, 0, 0, 0);
			break;
	}
	return now;
}

export async function getUserApsProgress(): Promise<{
	success: boolean;
	error?: string;
	data?: APSProgress;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const target = await db.query.universityTargets.findFirst({
			where: and(
				eq(universityTargets.userId, session.user.id),
				eq(universityTargets.isActive, true)
			),
		});

		const monthlyPoints = await getMonthlyApsPoints(session.user.id);

		const { totalAps } = await getUnifiedApsScore(session.user.id);

		const currentAps = totalAps > 0 ? totalAps : 32;
		const targetAps = target?.targetAps || 42;

		return {
			success: true,
			data: {
				currentAps,
				targetAps,
				pointsThisMonth: monthlyPoints,
				universityTarget: target?.universityName,
				faculty: target?.faculty,
			},
		};
	} catch (error) {
		console.error('getUserApsProgress failed:', error);
		return { success: false, error: 'Failed to get APS progress' };
	}
}

export async function getMonthlyApsPoints(userId: string): Promise<number> {
	const db = await getDb();
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const attempts = await db.query.questionAttempts.findMany({
		where: and(
			eq(questionAttempts.userId, userId),
			gte(questionAttempts.attemptedAt, startOfMonth)
		),
	});

	let points = 0;
	for (const attempt of attempts) {
		if (attempt.isCorrect) {
			points += 1;
		}
		if (attempt.isCorrect && attempt.easeFactor && Number(attempt.easeFactor) > 2.5) {
			points += 1;
		}
	}

	return points;
}

export async function addQuizApsPoints(_userId: string, isCorrect: boolean): Promise<number> {
	const points = isCorrect ? 1 : 0;
	return points;
}

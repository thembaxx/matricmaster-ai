'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	flashcardReviews,
	leaderboardEntries,
	quizResults,
	studySessions,
	userAchievements,
	userProgress,
} from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt?: Date;
}

export const ACHIEVEMENTS = {
	FIRST_QUIZ: {
		id: 'first_quiz',
		title: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
	},
	STREAK_7: {
		id: 'streak_7',
		title: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
	},
	STREAK_30: {
		id: 'streak_30',
		title: 'Monthly Master',
		description: 'Maintain a 30-day streak',
		icon: '💎',
	},
	PERFECT_QUIZ: {
		id: 'perfect_quiz',
		title: 'Perfect Score',
		description: 'Get 100% on a quiz',
		icon: '⭐',
	},
	FLASHCARD_100: {
		id: 'flashcard_100',
		title: 'Flashcard Pro',
		description: 'Review 100 flashcards',
		icon: '📚',
	},
	TOPIC_MASTER: {
		id: 'topic_master',
		title: 'Topic Master',
		description: 'Achieve 90%+ mastery on 5 topics',
		icon: '🏆',
	},
	STUDY_BUDDY: {
		id: 'study_buddy',
		title: 'Social Learner',
		description: 'Connect with a study buddy',
		icon: '🤝',
	},
	EARLY_BIRD: {
		id: 'early_bird',
		title: 'Early Bird',
		description: 'Study before 7am',
		icon: '🌅',
	},
	NIGHT_OWL: { id: 'night_owl', title: 'Night Owl', description: 'Study after 10pm', icon: '🦉' },
	CONSISTENT: {
		id: 'consistent',
		title: 'Consistent',
		description: 'Study for 7 days in a row',
		icon: '📈',
	},
};

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const userId = session.user.id;
	const newAchievements: Achievement[] = [];

	const existingAchievements = await db.query.userAchievements.findMany({
		where: eq(userAchievements.userId, userId),
	});
	const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

	const quizCount = await db.query.quizResults.findMany({
		where: eq(quizResults.userId, userId),
	});

	if (quizCount.length >= 1 && !existingIds.has('first_quiz')) {
		await unlockAchievement(userId, ACHIEVEMENTS.FIRST_QUIZ);
		newAchievements.push({ ...ACHIEVEMENTS.FIRST_QUIZ, unlockedAt: new Date() });
	}

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	if (progress && progress.streakDays >= 7 && !existingIds.has('streak_7')) {
		await unlockAchievement(userId, ACHIEVEMENTS.STREAK_7);
		newAchievements.push({ ...ACHIEVEMENTS.STREAK_7, unlockedAt: new Date() });
	}

	if (progress && progress.streakDays >= 30 && !existingIds.has('streak_30')) {
		await unlockAchievement(userId, ACHIEVEMENTS.STREAK_30);
		newAchievements.push({ ...ACHIEVEMENTS.STREAK_30, unlockedAt: new Date() });
	}

	const perfectQuizzes = quizCount.filter((q) => Number(q.percentage) === 100);
	if (perfectQuizzes.length >= 1 && !existingIds.has('perfect_quiz')) {
		await unlockAchievement(userId, ACHIEVEMENTS.PERFECT_QUIZ);
		newAchievements.push({ ...ACHIEVEMENTS.PERFECT_QUIZ, unlockedAt: new Date() });
	}

	const flashcardCount = await db.query.flashcardReviews.findMany({
		where: eq(flashcardReviews.userId, userId),
	});

	if (flashcardCount.length >= 100 && !existingIds.has('flashcard_100')) {
		await unlockAchievement(userId, ACHIEVEMENTS.FLASHCARD_100);
		newAchievements.push({ ...ACHIEVEMENTS.FLASHCARD_100, unlockedAt: new Date() });
	}

	const hour = new Date().getHours();
	if (hour < 7 && !existingIds.has('early_bird')) {
		await unlockAchievement(userId, ACHIEVEMENTS.EARLY_BIRD);
		newAchievements.push({ ...ACHIEVEMENTS.EARLY_BIRD, unlockedAt: new Date() });
	}

	if (hour >= 22 && !existingIds.has('night_owl')) {
		await unlockAchievement(userId, ACHIEVEMENTS.NIGHT_OWL);
		newAchievements.push({ ...ACHIEVEMENTS.NIGHT_OWL, unlockedAt: new Date() });
	}

	return newAchievements;
}

async function unlockAchievement(userId: string, achievement: typeof ACHIEVEMENTS.FIRST_QUIZ) {
	const db = await getDb();

	await db.insert(userAchievements).values({
		userId,
		achievementId: achievement.id,
		title: achievement.title,
		description: achievement.description,
		icon: achievement.icon,
	});
}

export async function updateStreak(): Promise<{ streakDays: number; bonusPoints: number }> {
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
			return { streakDays, bonusPoints: 0 };
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

	return { streakDays, bonusPoints };
}

export async function claimLoginBonus(): Promise<{
	bonus: number;
	streakDays: number;
	totalBonuses: number;
}> {
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
			throw new Error('Bonus already claimed today');
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

	return { bonus, streakDays: streakDays + 1, totalBonuses };
}

export async function calculateLeaderboardPoints(): Promise<number> {
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

	return Math.floor(
		pointsFromProgress + pointsFromAchievements + pointsFromStreak + pointsFromActivity
	);
}

export async function syncLeaderboard(periodType = 'weekly') {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const userId = session.user.id;

	const points = await calculateLeaderboardPoints();
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

export interface APSProgress {
	currentAps: number;
	targetAps: number;
	pointsThisMonth: number;
	universityTarget?: string;
	faculty?: string;
}

export async function getUserApsProgress(): Promise<APSProgress> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const target = await db.query.universityTargets.findFirst({
		where: (ut, { eq, and }) => and(eq(ut.userId, session.user.id), eq(ut.isActive, true)),
	});

	const monthlyPoints = await getMonthlyApsPoints(session.user.id);

	const currentAps = 32;
	const targetAps = target?.targetAps || 42;

	return {
		currentAps,
		targetAps,
		pointsThisMonth: monthlyPoints,
		universityTarget: target?.universityName,
		faculty: target?.faculty,
	};
}

export async function getMonthlyApsPoints(userId: string): Promise<number> {
	const db = await getDb();
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const attempts = await db.query.questionAttempts.findMany({
		where: (qa, { eq, gte }) => and(eq(qa.userId, userId), gte(qa.attemptedAt, startOfMonth)),
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

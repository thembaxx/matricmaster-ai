'use server';

import { eq, sql } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import {
	leaderboardEntries,
	quizResults,
	studyBuddies,
	studySessions,
	userAchievements,
	userProgress,
} from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export const ACHIEVEMENTS = {
	STUDY_STREAK_7: {
		id: 'STUDY_STREAK_7',
		title: 'Week Warrior',
		description: 'Maintain a 7-day study streak',
		icon: 'flame',
		category: 'streaks',
		xpReward: 100,
	},
	FOCUS_CHAMPION: {
		id: 'FOCUS_CHAMPION',
		title: 'Focus Champion',
		description: 'Complete 10 hours in focus rooms',
		icon: 'target',
		category: 'mastery',
		xpReward: 250,
	},
	QUIZ_MASTER: {
		id: 'QUIZ_MASTER',
		title: 'Quiz Master',
		description: 'Complete 100 quizzes',
		icon: 'graduation-cap',
		category: 'mastery',
		xpReward: 500,
	},
	PERFECT_QUIZ: {
		id: 'PERFECT_QUIZ',
		title: 'Perfectionist',
		description: 'Score 100% on a quiz',
		icon: 'star',
		category: 'mastery',
		xpReward: 150,
	},
	SPIRITED_STUDY: {
		id: 'SPIRITED_STUDY',
		title: 'Night Owl',
		description: 'Study at midnight',
		icon: 'moon',
		category: 'learning',
		xpReward: 50,
	},
	EARLY_BIRD: {
		id: 'EARLY_BIRD',
		title: 'Early Bird',
		description: 'Study before 6am',
		icon: 'sun',
		category: 'learning',
		xpReward: 50,
	},
	CONSISTENT_WEEK: {
		id: 'CONSISTENT_WEEK',
		title: 'Consistency King',
		description: 'Study every day for a week',
		icon: 'calendar',
		category: 'streaks',
		xpReward: 200,
	},
	TOP_10: {
		id: 'TOP_10',
		title: 'Top 10',
		description: 'Reach the top 10 on the leaderboard',
		icon: 'trophy',
		category: 'social',
		xpReward: 300,
	},
	HELPER: {
		id: 'HELPER',
		title: 'Helpful Spirit',
		description: 'Help 5 study buddies',
		icon: 'heart',
		category: 'social',
		xpReward: 150,
	},
	FOCUS_TEAM: {
		id: 'FOCUS_TEAM',
		title: 'Team Player',
		description: 'Complete a group focus session',
		icon: 'users',
		category: 'social',
		xpReward: 100,
	},
	CURIOUS_MIND: {
		id: 'CURIOUS_MIND',
		title: 'Curious Mind',
		description: 'Have 50 AI tutor conversations',
		icon: 'brain',
		category: 'learning',
		xpReward: 200,
	},
	SELF_LEARNER: {
		id: 'SELF_LEARNER',
		title: 'Self-Learner',
		description: 'Generate your own flashcards',
		icon: 'book-open',
		category: 'learning',
		xpReward: 100,
	},
	PLANNER: {
		id: 'PLANNER',
		title: 'Planner',
		description: 'Complete a study plan',
		icon: 'clipboard',
		category: 'learning',
		xpReward: 75,
	},
	ADAPTIVE: {
		id: 'ADAPTIVE',
		title: 'Adaptive Student',
		description: 'Follow an AI-recommended study plan',
		icon: 'sparkles',
		category: 'learning',
		xpReward: 100,
	},
	SPEED_DEMON: {
		id: 'SPEED_DEMON',
		title: 'Speed Demon',
		description: 'Finish a quiz under time with 90%+',
		icon: 'zap',
		category: 'mastery',
		xpReward: 100,
	},
	CLIMBING_STAR: {
		id: 'CLIMBING_STAR',
		title: 'Climbing Star',
		description: 'Move up 10+ positions in a week',
		icon: 'trending-up',
		category: 'social',
		xpReward: 200,
	},
	FIRST_QUIZ: {
		id: 'FIRST_QUIZ',
		title: 'First Steps',
		description: 'Complete your first quiz',
		icon: 'flag',
		category: 'learning',
		xpReward: 25,
	},
	TOPIC_EXPLORER: {
		id: 'TOPIC_EXPLORER',
		title: 'Topic Explorer',
		description: 'Master 20 different topics',
		icon: 'compass',
		category: 'mastery',
		xpReward: 300,
	},
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;
export type AchievementCategory = 'learning' | 'social' | 'streaks' | 'mastery';

export interface AchievementProgress {
	achievementId: string;
	current: number;
	target: number;
	percentage: number;
	isUnlocked: boolean;
	unlockedAt?: Date;
}

export interface AchievementWithProgress extends Achievement {
	progress: AchievementProgress;
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	category: AchievementCategory;
	xpReward: number;
}

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
	const db = await getDb();
	const newlyUnlocked: string[] = [];

	const unlocked = await db.query.userAchievements.findMany({
		where: eq(userAchievements.userId, userId),
	});
	const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

	const progress = await getAllAchievementProgress(userId);

	for (const [achievementId, achievementProgress] of Object.entries(progress)) {
		if (!unlockedIds.has(achievementId) && achievementProgress.isUnlocked) {
			const achievement = ACHIEVEMENTS[achievementId as AchievementId];
			if (achievement && !unlockedIds.has(achievementId)) {
				await db.insert(userAchievements).values({
					userId,
					achievementId,
					title: achievement.title,
					description: achievement.description,
					icon: achievement.icon,
				});

				await db
					.update(userProgress)
					.set({
						totalMarksEarned: sql`${userProgress.totalMarksEarned} + ${achievement.xpReward}`,
						updatedAt: new Date(),
					})
					.where(eq(userProgress.userId, userId));

				newlyUnlocked.push(achievementId);
			}
		}
	}

	return newlyUnlocked;
}

export async function getAllAchievementProgress(
	userId: string
): Promise<Record<string, AchievementProgress>> {
	const db = await getDb();

	const progress: Record<string, AchievementProgress> = {};

	const userProgressData = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	const quizzes = await db.query.quizResults.findMany({
		where: eq(quizResults.userId, userId),
	});

	const sessions = await db.query.studySessions.findMany({
		where: eq(studySessions.userId, userId),
	});

	const buddies = await db.query.studyBuddies.findMany({
		where: sql`${studyBuddies.userId1} = ${userId} OR ${studyBuddies.userId2} = ${userId}`,
	});

	const leaderboard = await db.query.leaderboardEntries.findFirst({
		where: eq(leaderboardEntries.userId, userId),
	});

	progress.STUDY_STREAK_7 = {
		achievementId: 'STUDY_STREAK_7',
		current: userProgressData?.streakDays || 0,
		target: 7,
		percentage: Math.min(((userProgressData?.streakDays || 0) / 7) * 100, 100),
		isUnlocked: (userProgressData?.streakDays || 0) >= 7,
	};

	progress.FOCUS_CHAMPION = {
		achievementId: 'FOCUS_CHAMPION',
		current: userProgressData?.totalMarksEarned || 0,
		target: 600,
		percentage: Math.min(((userProgressData?.totalMarksEarned || 0) / 600) * 100, 100),
		isUnlocked: (userProgressData?.totalMarksEarned || 0) >= 600,
	};

	progress.QUIZ_MASTER = {
		achievementId: 'QUIZ_MASTER',
		current: quizzes.length,
		target: 100,
		percentage: Math.min((quizzes.length / 100) * 100, 100),
		isUnlocked: quizzes.length >= 100,
	};

	const perfectQuiz = quizzes.find((q) => Number.parseFloat(String(q.percentage)) === 100);
	progress.PERFECT_QUIZ = {
		achievementId: 'PERFECT_QUIZ',
		current: perfectQuiz ? 1 : 0,
		target: 1,
		percentage: perfectQuiz ? 100 : 0,
		isUnlocked: !!perfectQuiz,
		unlockedAt: perfectQuiz ? new Date(perfectQuiz.completedAt) : undefined,
	};

	const midnightSession = sessions.find((s) => {
		if (!s.startedAt) return false;
		const hour = new Date(s.startedAt).getHours();
		return hour >= 0 && hour < 4;
	});
	progress.SPIRITED_STUDY = {
		achievementId: 'SPIRITED_STUDY',
		current: midnightSession ? 1 : 0,
		target: 1,
		percentage: midnightSession ? 100 : 0,
		isUnlocked: !!midnightSession,
		unlockedAt: midnightSession?.startedAt ? new Date(midnightSession.startedAt) : undefined,
	};

	const earlySession = sessions.find((s) => {
		if (!s.startedAt) return false;
		const hour = new Date(s.startedAt).getHours();
		return hour >= 4 && hour < 6;
	});
	progress.EARLY_BIRD = {
		achievementId: 'EARLY_BIRD',
		current: earlySession ? 1 : 0,
		target: 1,
		percentage: earlySession ? 100 : 0,
		isUnlocked: !!earlySession,
		unlockedAt: earlySession?.startedAt ? new Date(earlySession.startedAt) : undefined,
	};

	const now = new Date();
	const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const uniqueDays = new Set(
		sessions
			.filter((s) => s.startedAt && new Date(s.startedAt) >= weekAgo)
			.map((s) => new Date(s.startedAt!).toDateString())
	);
	progress.CONSISTENT_WEEK = {
		achievementId: 'CONSISTENT_WEEK',
		current: uniqueDays.size,
		target: 7,
		percentage: Math.min((uniqueDays.size / 7) * 100, 100),
		isUnlocked: uniqueDays.size >= 7,
	};

	progress.TOP_10 = {
		achievementId: 'TOP_10',
		current:
			leaderboard?.rank !== null && leaderboard?.rank !== undefined && leaderboard.rank <= 10
				? 1
				: 0,
		target: 1,
		percentage:
			leaderboard?.rank !== null && leaderboard?.rank !== undefined && leaderboard.rank <= 10
				? 100
				: 0,
		isUnlocked:
			leaderboard?.rank !== null && leaderboard?.rank !== undefined && leaderboard.rank <= 10,
	};

	progress.HELPER = {
		achievementId: 'HELPER',
		current: buddies.length,
		target: 5,
		percentage: Math.min((buddies.length / 5) * 100, 100),
		isUnlocked: buddies.length >= 5,
	};

	const groupSessions = sessions.filter((s) => s.sessionType === 'group');
	progress.FOCUS_TEAM = {
		achievementId: 'FOCUS_TEAM',
		current: groupSessions.length,
		target: 1,
		percentage: groupSessions.length >= 1 ? 100 : 0,
		isUnlocked: groupSessions.length >= 1,
	};

	progress.FIRST_QUIZ = {
		achievementId: 'FIRST_QUIZ',
		current: quizzes.length > 0 ? 1 : 0,
		target: 1,
		percentage: quizzes.length > 0 ? 100 : 0,
		isUnlocked: quizzes.length > 0,
	};

	return progress;
}

export async function getAchievementProgress(
	userId: string,
	achievementId: string
): Promise<AchievementProgress | null> {
	const allProgress = await getAllAchievementProgress(userId);
	return allProgress[achievementId] || null;
}

export async function getUserAchievements(userId: string): Promise<AchievementWithProgress[]> {
	const db = await getDb();

	const achievements = await db.query.userAchievements.findMany({
		where: eq(userAchievements.userId, userId),
	});

	const allProgress = await getAllAchievementProgress(userId);

	return achievements.map((a) => ({
		...ACHIEVEMENTS[a.achievementId as AchievementId],
		progress: allProgress[a.achievementId] || {
			achievementId: a.achievementId,
			current: 0,
			target: 1,
			percentage: 0,
			isUnlocked: true,
			unlockedAt: a.unlockedAt || undefined,
		},
	}));
}

export async function getAchievementsByCategory(
	userId: string,
	category: AchievementCategory
): Promise<AchievementWithProgress[]> {
	const allAchievements = await getUserAchievements(userId);
	return allAchievements.filter((a) => a.category === category);
}

export async function trackStudyTime(userId: string, minutes: number): Promise<string[]> {
	const db = await getDb();

	await db
		.update(userProgress)
		.set({
			totalMarksEarned: sql`${userProgress.totalMarksEarned} + ${minutes}`,
			lastActivityAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(userProgress.userId, userId));

	return checkAndAwardAchievements(userId);
}

export async function trackQuizCompletion(
	userId: string,
	score: number,
	totalQuestions: number,
	timeTaken: number
): Promise<string[]> {
	const db = await getDb();

	const percentage = (score / totalQuestions) * 100;

	await db.insert(quizResults).values({
		userId,
		quizId: `quiz_${Date.now()}`,
		score,
		totalQuestions,
		percentage: String(percentage.toFixed(2)),
		timeTaken,
		completedAt: new Date(),
	});

	const achievements: string[] = [];

	if (percentage === 100) {
		achievements.push('PERFECT_QUIZ');
	}

	if (timeTaken < 300 && percentage >= 90) {
		achievements.push('SPEED_DEMON');
	}

	return checkAndAwardAchievements(userId);
}

export async function trackStudyBuddyConnection(userId: string): Promise<string[]> {
	return checkAndAwardAchievements(userId);
}

export async function getNextAchievements(
	userId: string,
	limit = 3
): Promise<{ achievement: Achievement; progress: AchievementProgress }[]> {
	const allProgress = await getAllAchievementProgress(userId);

	const locked = Object.entries(allProgress)
		.filter(([, p]) => !p.isUnlocked)
		.sort((a, b) => b[1].percentage - a[1].percentage)
		.slice(0, limit);

	return locked.map(([id, progress]) => ({
		achievement: ACHIEVEMENTS[id as AchievementId],
		progress,
	}));
}

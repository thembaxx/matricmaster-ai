'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	apsMilestones,
	leaderboardEntries,
	studySessions,
	topicMastery,
	userAchievements,
	userProgress,
} from '@/lib/db/schema';

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

export interface GamificationEvent {
	type:
		| 'quiz_complete'
		| 'flashcard_review'
		| 'milestone_complete'
		| 'study_session'
		| 'streak_milestone';
	xpEarned: number;
	achievementsUnlocked?: string[];
	streakUpdated?: number;
	message: string;
}

export interface StackedReward {
	xp: number;
	achievement?: {
		id: string;
		title: string;
		icon: string;
	};
	bonusMultiplier: number;
	reason: string;
}

const XP_VALUES = {
	quiz_correct_answer: 10,
	quiz_perfect_score_bonus: 50,
	flashcard_review: 5,
	flashcard_streak_10: 25,
	milestone_complete: 100,
	study_session_30min: 20,
	study_session_60min: 40,
	study_session_90min: 60,
	streak_7_days: 100,
	streak_30_days: 500,
	streak_100_days: 2000,
};

const ACHIEVEMENT_THRESHOLDS = {
	first_quiz: { xp: 0, title: 'First Steps', icon: 'trophy', id: 'first_quiz' },
	perfect_score: { xp: 0, title: 'Perfectionist', icon: 'star', id: 'perfect_score' },
	week_streak: { xp: 100, title: 'Week Warrior', icon: 'flame', id: 'week_streak' },
	month_streak: { xp: 500, title: 'Month Master', icon: 'crown', id: 'month_streak' },
	hundred_topics: { xp: 0, title: 'Topic Explorer', icon: 'compass', id: 'hundred_topics' },
	aps_30: { xp: 0, title: 'University Ready', icon: 'graduation', id: 'aps_30' },
	aps_40: { xp: 0, title: 'Top Achiever', icon: 'medal', id: 'aps_40' },
	all_subjects: { xp: 0, title: 'Well Rounded', icon: 'books', id: 'all_subjects' },
};

export async function processGamificationEvent(
	eventType: GamificationEvent['type'],
	context: {
		correctAnswers?: number;
		totalQuestions?: number;
		flashcardsReviewed?: number;
		durationMinutes?: number;
		streakDays?: number;
		topicMasteryLevel?: number;
		subjectsStudied?: string[];
	}
): Promise<GamificationEvent> {
	const user = await ensureAuthenticated();

	let xpEarned = 0;
	const achievementsUnlocked: string[] = [];
	let streakUpdated: number | undefined;
	let message = '';

	switch (eventType) {
		case 'quiz_complete': {
			const { correctAnswers = 0, totalQuestions = 1 } = context;
			xpEarned = correctAnswers * XP_VALUES.quiz_correct_answer;

			if (correctAnswers === totalQuestions && totalQuestions >= 5) {
				xpEarned += XP_VALUES.quiz_perfect_score_bonus;
				achievementsUnlocked.push('perfect_score');
			}

			if (!achievementsUnlocked.includes('first_quiz')) {
				achievementsUnlocked.push('first_quiz');
			}

			message = `Completed quiz: +${xpEarned} XP`;
			break;
		}

		case 'flashcard_review': {
			const { flashcardsReviewed = 0 } = context;
			xpEarned = flashcardsReviewed * XP_VALUES.flashcard_review;

			if (flashcardsReviewed >= 10) {
				xpEarned += XP_VALUES.flashcard_streak_10;
			}

			message = `Reviewed ${flashcardsReviewed} flashcards: +${xpEarned} XP`;
			break;
		}

		case 'milestone_complete': {
			xpEarned = XP_VALUES.milestone_complete;
			achievementsUnlocked.push('aps_30');
			message = 'Completed APS milestone: +100 XP';
			break;
		}

		case 'study_session': {
			const { durationMinutes = 0 } = context;
			if (durationMinutes >= 90) {
				xpEarned = XP_VALUES.study_session_90min;
			} else if (durationMinutes >= 60) {
				xpEarned = XP_VALUES.study_session_60min;
			} else if (durationMinutes >= 30) {
				xpEarned = XP_VALUES.study_session_30min;
			}

			message = `Study session (${durationMinutes} min): +${xpEarned} XP`;
			break;
		}

		case 'streak_milestone': {
			const { streakDays = 0 } = context;
			streakUpdated = streakDays;

			if (streakDays >= 100) {
				xpEarned = XP_VALUES.study_session_90min;
				achievementsUnlocked.push('month_streak');
			} else if (streakDays >= 30) {
				xpEarned = XP_VALUES.study_session_60min;
				achievementsUnlocked.push('month_streak');
			} else if (streakDays >= 7) {
				xpEarned = XP_VALUES.study_session_30min;
				achievementsUnlocked.push('week_streak');
			}

			message = `${streakDays} day streak: +${xpEarned} XP`;
			break;
		}
	}

	await addXpToUser(user.id, xpEarned);

	for (const achievementId of achievementsUnlocked) {
		await unlockAchievement(user.id, achievementId);
	}

	await updateLeaderboard(user.id);

	return {
		type: eventType,
		xpEarned,
		achievementsUnlocked,
		streakUpdated,
		message,
	};
}

async function addXpToUser(userId: string, xp: number): Promise<void> {
	const db = await getDb();

	const existing = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	if (existing) {
		const currentXp = existing.totalCorrect || 0;
		await db
			.update(userProgress)
			.set({ totalCorrect: currentXp + xp })
			.where(eq(userProgress.id, existing.id));
	}
}

async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
	const db = await getDb();

	const existing = await db.query.userAchievements.findFirst({
		where: and(
			eq(userAchievements.userId, userId),
			eq(userAchievements.achievementId, achievementId)
		),
	});

	if (existing) return;

	const achievement = ACHIEVEMENT_THRESHOLDS[achievementId as keyof typeof ACHIEVEMENT_THRESHOLDS];
	if (!achievement) return;

	await db.insert(userAchievements).values({
		userId,
		achievementId: achievement.id,
		title: achievement.title,
		icon: achievement.icon,
	});
}

async function updateLeaderboard(userId: string): Promise<void> {
	const db = await getDb();

	const userProgressData = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	if (!userProgressData) return;

	const totalPoints = userProgressData.totalCorrect || 0;
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(weekStart.getDate() - 7);

	const weeklySessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), eq(studySessions.completedAt, sql`IS NOT NULL`)),
	});

	const questionsCompleted = weeklySessions.reduce(
		(sum, s) => sum + (s.questionsAttempted || 0),
		0
	);

	const existing = await db.query.leaderboardEntries.findFirst({
		where: and(
			eq(leaderboardEntries.userId, userId),
			eq(leaderboardEntries.periodType, 'weekly'),
			gte(leaderboardEntries.periodStart, weekStart)
		),
	});

	if (existing) {
		await db
			.update(leaderboardEntries)
			.set({ totalPoints, questionsCompleted })
			.where(eq(leaderboardEntries.id, existing.id));
	} else {
		await db.insert(leaderboardEntries).values({
			userId,
			periodType: 'weekly',
			periodStart: weekStart,
			totalPoints,
			questionsCompleted,
		});
	}
}

export async function getStackedRewards(userId: string): Promise<StackedReward[]> {
	const rewards: StackedReward[] = [];
	const db = await getDb();

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	const achievements = await db.query.userAchievements.findMany({
		where: eq(userAchievements.userId, userId),
	});

	const milestones = await db.query.apsMilestones.findMany({
		where: and(eq(apsMilestones.userId, userId), eq(apsMilestones.status, 'completed')),
	});

	const masteredTopics = await db.query.topicMastery.findMany({
		where: and(eq(topicMastery.userId, userId), sql`${topicMastery.masteryLevel} >= 0.7`),
	});

	let bonusMultiplier = 1;

	if (achievements.length >= 5) {
		bonusMultiplier += 0.1;
		rewards.push({
			xp: 0,
			achievement: {
				id: 'multiplier_10',
				title: 'Achievement Hunter',
				icon: 'badge',
			},
			bonusMultiplier,
			reason: '10% XP bonus from 5+ achievements',
		});
	}

	if (milestones.length >= 10) {
		bonusMultiplier += 0.15;
		rewards.push({
			xp: 0,
			achievement: {
				id: 'milestone_master',
				title: 'Milestone Master',
				icon: 'flag',
			},
			bonusMultiplier,
			reason: '15% XP bonus from 10+ completed milestones',
		});
	}

	if (masteredTopics.length >= 20) {
		bonusMultiplier += 0.2;
		rewards.push({
			xp: 0,
			achievement: {
				id: 'topic_master',
				title: 'Topic Master',
				icon: 'brain',
			},
			bonusMultiplier,
			reason: '20% XP bonus from 20+ mastered topics',
		});
	}

	if (progress && progress.streakDays >= 7) {
		const streakBonus = Math.min(progress.streakDays / 100, 0.3);
		bonusMultiplier += streakBonus;
		rewards.push({
			xp: 0,
			bonusMultiplier,
			reason: `${progress.streakDays} day streak bonus (+${Math.round(streakBonus * 100)}%)`,
		});
	}

	return rewards;
}

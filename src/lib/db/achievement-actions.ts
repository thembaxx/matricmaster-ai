'use server';

import { auth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { userAchievements, userProgress, studySessions, bookmarks } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ACHIEVEMENTS, getAchievementById } from '@/constants/achievements';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface UserAchievement {
	id: string;
	achievementId: string;
	title: string;
	description: string | null;
	icon: string | null;
	unlockedAt: Date;
}

export interface AchievementCheckResult {
	unlocked: string[];
	existing: string[];
}

export async function getUserAchievements(): Promise<{
	unlocked: UserAchievement[];
	available: typeof ACHIEVEMENTS;
}> {
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { unlocked: [], available: ACHIEVEMENTS };
	}

	try {
		const db = await getDb();
		const unlockedRecords = await db
			.select()
			.from(userAchievements)
			.where(eq(userAchievements.userId, session.user.id));

		const unlocked: UserAchievement[] = unlockedRecords.map((record) => ({
			id: record.id,
			achievementId: record.achievementId,
			title: record.title,
			description: record.description,
			icon: record.icon,
			unlockedAt: record.unlockedAt || new Date(),
		}));

		const unlockedIds = new Set(unlockedRecords.map((r) => r.achievementId));
		const available = ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id));

		return { unlocked, available };
	} catch (error) {
		console.error('[Achievements] Error fetching achievements:', error);
		return { unlocked: [], available: ACHIEVEMENTS };
	}
}

export async function checkAndUnlockAchievements(): Promise<AchievementCheckResult> {
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { unlocked: [], existing: [] };
	}

	try {
		const db = await getDb();
		const userId = session.user.id;
		
		const existingRecords = await db
			.select({ achievementId: userAchievements.achievementId })
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId));
		
		const existingIds = new Set(existingRecords.map((r) => r.achievementId));
		const progressStats = await getUserStats(userId);
		
		const newlyUnlocked: string[] = [];
		
		for (const achievement of ACHIEVEMENTS) {
			if (existingIds.has(achievement.id)) continue;
			
			const shouldUnlock = checkAchievementRequirement(achievement, progressStats);
			
			if (shouldUnlock) {
				await db.insert(userAchievements).values({
					userId,
					achievementId: achievement.id,
					title: achievement.name,
					description: achievement.description,
					icon: achievement.icon,
				});
				
				newlyUnlocked.push(achievement.id);
			}
		}
		
		if (newlyUnlocked.length > 0) {
			revalidatePath('/achievements');
			revalidatePath('/profile');
		}
		
		return {
			unlocked: newlyUnlocked,
			existing: Array.from(existingIds),
		};
	} catch (error) {
		console.error('[Achievements] Error checking achievements:', error);
		return { unlocked: [], existing: [] };
	}
}

export async function getAchievementStatus(achievementId: string): Promise<{
	unlocked: boolean;
	unlockedAt?: Date;
}> {
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { unlocked: false };
	}

	try {
		const db = await getDb();
		const record = await db
			.select()
			.from(userAchievements)
			.where(
				and(
					eq(userAchievements.userId, session.user.id),
					eq(userAchievements.achievementId, achievementId)
				)
			)
			.limit(1);

		if (record.length > 0) {
			return { unlocked: true, unlockedAt: record[0].unlockedAt || undefined };
		}

		return { unlocked: false };
	} catch (error) {
		console.error('[Achievements] Error getting status:', error);
		return { unlocked: false };
	}
}

export async function unlockAchievement(achievementId: string): Promise<boolean> {
	const session = await auth.api.getSession();
	if (!session?.user) {
		return false;
	}

	const achievement = getAchievementById(achievementId);
	if (!achievement) {
		return false;
	}

	try {
		const db = await getDb();
		const existing = await db
			.select()
			.from(userAchievements)
			.where(
				and(
					eq(userAchievements.userId, session.user.id),
					eq(userAchievements.achievementId, achievementId)
				)
			)
			.limit(1);

		if (existing.length > 0) {
			return true;
		}

		await db.insert(userAchievements).values({
			userId: session.user.id,
			achievementId: achievement.id,
			title: achievement.name,
			description: achievement.description,
			icon: achievement.icon,
		});

		revalidatePath('/achievements');
		revalidatePath('/profile');

		return true;
	} catch (error) {
		console.error('[Achievements] Error unlocking achievement:', error);
		return false;
	}
}

interface UserStats {
	quizzesCompleted: number;
	totalQuestionsAnswered: number;
	correctAnswers: number;
	perfectScores: number;
	currentStreak: number;
	bookmarkCount: number;
	totalStudyMinutes: number;
	subjectCorrectAnswers: Record<number, number>;
}

async function getUserStats(userId: string): Promise<UserStats> {
	const db = await getDb();
	
	const sessionCount = await db
		.select({ count: count() })
		.from(studySessions)
		.where(eq(studySessions.userId, userId));
	
	const progressRecords = await db
		.select()
		.from(userProgress)
		.where(eq(userProgress.userId, userId));
	
	const totalQuestionsAnswered = progressRecords.reduce(
		(acc, r) => acc + r.totalQuestionsAttempted,
		0
	);
	
	const correctAnswers = progressRecords.reduce(
		(acc, r) => acc + r.totalCorrect,
		0
	);
	
	const currentStreak = progressRecords.reduce(
		(acc, r) => Math.max(acc, r.streakDays),
		0
	);
	
	const bookmarkCountResult = await db
		.select({ count: count() })
		.from(bookmarks)
		.where(eq(bookmarks.userId, userId));
	
	const sessions = await db
		.select({ durationMinutes: studySessions.durationMinutes })
		.from(studySessions)
		.where(eq(studySessions.userId, userId));
	
	const totalStudyMinutes = sessions.reduce(
		(acc, s) => acc + (s.durationMinutes || 0),
		0
	);
	
	const subjectCorrectAnswers: Record<number, number> = {};
	for (const record of progressRecords) {
		if (record.subjectId) {
			subjectCorrectAnswers[record.subjectId] = 
				(subjectCorrectAnswers[record.subjectId] || 0) + record.totalCorrect;
		}
	}
	
	return {
		quizzesCompleted: sessionCount[0]?.count || 0,
		totalQuestionsAnswered,
		correctAnswers,
		perfectScores: 0,
		currentStreak,
		bookmarkCount: bookmarkCountResult[0]?.count || 0,
		totalStudyMinutes,
		subjectCorrectAnswers,
	};
}

function checkAchievementRequirement(
	achievement: typeof ACHIEVEMENTS[number],
	stats: UserStats
): boolean {
	const { requirement } = achievement;
	
	switch (requirement.type) {
		case 'quizzes_completed':
			return stats.quizzesCompleted >= requirement.value;
		case 'streak_days':
			return stats.currentStreak >= requirement.value;
		case 'questions_answered':
			return stats.totalQuestionsAnswered >= requirement.value;
		case 'perfect_score':
			return stats.perfectScores >= requirement.value;
		case 'subject_mastery':
			if (requirement.subjectId) {
				const correctForSubject = stats.subjectCorrectAnswers[requirement.subjectId] || 0;
				return correctForSubject >= requirement.value;
			}
			return false;
		case 'bookmarks':
			return stats.bookmarkCount >= requirement.value;
		case 'time_spent':
			return stats.totalStudyMinutes >= requirement.value;
		case 'sessions_count':
			return stats.quizzesCompleted >= requirement.value;
		default:
			return false;
	}
}

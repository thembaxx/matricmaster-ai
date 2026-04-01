import { eq } from 'drizzle-orm';
import { getStreakMultiplier } from '@/content';
import { ACHIEVEMENTS } from '@/content/achievements';

// Helper to get achievements (required for 'use server' exports)
function getAllAchievements() {
	return ACHIEVEMENTS;
}

import { type DbType, dbManager } from '@/lib/db';
import { userAchievements, userProgress } from '@/lib/db/schema';
import { getXPLevel } from './xpSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface GamificationEvent {
	userId: string;
	type:
		| 'quiz_complete'
		| 'flashcard_review'
		| 'study_session'
		| 'streak_milestone'
		| 'perfect_score'
		| 'buddy_session'
		| 'past_paper_complete'
		| 'ai_tutor_session'
		| 'focus_room'
		| 'mistake_resolution';
	metadata: Record<string, unknown>;
}

export interface GamificationResult {
	xpEarned: number;
	newLevel: number;
	unlockedAchievements: string[];
	newStreak: number;
}

export interface AchievementDef {
	id: string;
	name: string;
	description: string;
	icon: string;
	iconBg: string;
	category: string;
	requirementType: string;
	requirementValue: number;
	requirementSubjectId: number | null;
	points: number;
	displayOrder: number;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH: XP VALUES
// ============================================================================

const XP_BASE: Record<string, number> = {
	quiz_complete: 10,
	flashcard_review: 5,
	study_session: 10,
	streak_milestone: 50,
	perfect_score: 0,
	buddy_session: 15,
	past_paper_complete: 20,
	ai_tutor_session: 5,
	focus_room: 10,
	mistake_resolution: 3,
};

// ============================================================================
// SINGLE SOURCE OF TRUTH: ACHIEVEMENTS
// ============================================================================

// ============================================================================
// DATABASE HELPERS
// ============================================================================

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

async function getUserProgress(userId: string) {
	const db = await getDb();
	return db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});
}

async function getUserAchievements(userId: string) {
	const db = await getDb();
	return db.query.userAchievements.findMany({
		where: eq(userAchievements.userId, userId),
	});
}

// ============================================================================
// XP CALCULATION WITH MULTIPLIERS
// ============================================================================

function calculateXp(event: GamificationEvent, streakMultiplier: number): number {
	const { type, metadata } = event;
	let baseXp = 0;

	switch (type) {
		case 'quiz_complete': {
			const score = (metadata.score as number) || 0;
			const totalQuestions = (metadata.totalQuestions as number) || 1;
			const difficulty = (metadata.difficulty as string) || 'medium';

			const difficultyMult = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.75 : 1.0;
			const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;
			baseXp = Math.round(XP_BASE.quiz_complete * accuracy * totalQuestions * difficultyMult);
			break;
		}

		case 'flashcard_review': {
			const count = (metadata.count as number) || 1;
			baseXp = XP_BASE.flashcard_review * count;
			if (count >= 10) baseXp += 25;
			break;
		}

		case 'study_session': {
			const durationMinutes = (metadata.durationMinutes as number) || 0;
			const blocks = Math.floor(durationMinutes / 30);
			baseXp = XP_BASE.study_session * Math.max(blocks, 1);
			break;
		}

		case 'streak_milestone': {
			const streakDays = (metadata.streakDays as number) || 0;
			if (streakDays >= 100) baseXp = 200;
			else if (streakDays >= 30) baseXp = 100;
			else if (streakDays >= 7) baseXp = 50;
			else if (streakDays >= 3) baseXp = 30;
			else baseXp = XP_BASE.streak_milestone;
			break;
		}

		case 'perfect_score': {
			baseXp = 0;
			break;
		}

		case 'buddy_session': {
			baseXp = XP_BASE.buddy_session;
			break;
		}

		case 'past_paper_complete': {
			baseXp = XP_BASE.past_paper_complete;
			break;
		}

		case 'ai_tutor_session': {
			baseXp = XP_BASE.ai_tutor_session;
			break;
		}

		case 'focus_room': {
			const durationMinutes = (metadata.durationMinutes as number) || 0;
			const hours = Math.max(durationMinutes / 60, 0.25);
			baseXp = Math.round(XP_BASE.focus_room * hours);
			break;
		}

		case 'mistake_resolution': {
			const count = (metadata.count as number) || 1;
			baseXp = XP_BASE.mistake_resolution * count;
			break;
		}
	}

	return Math.round(baseXp * streakMultiplier);
}

function getStreakMultiplierFromDays(streakDays: number): number {
	const sm = getStreakMultiplier(streakDays);
	return sm?.multiplier ?? 1;
}

// ============================================================================
// ACHIEVEMENT CHECKING
// ============================================================================

async function checkAchievements(
	userId: string,
	event: GamificationEvent,
	existingAchievementIds: Set<string>
): Promise<string[]> {
	const db = await getDb();
	const unlocked: string[] = [];

	const progress = await getUserProgress(userId);
	const streakDays = progress?.streakDays ?? 0;

	for (const achievement of getAllAchievements()) {
		if (existingAchievementIds.has(achievement.id)) continue;

		let shouldUnlock = false;
		const { type, threshold, metadata } = achievement.condition;

		switch (type) {
			case 'quiz_complete':
				if (event.type === 'quiz_complete') {
					const quizCount = Math.floor((progress?.totalQuestionsAttempted ?? 0) / 10);
					shouldUnlock = quizCount >= threshold;
					if (metadata?.timeBefore && new Date().getHours() >= (metadata.timeBefore as number)) {
						shouldUnlock = false;
					}
					if (metadata?.timeAfter && new Date().getHours() < (metadata.timeAfter as number)) {
						shouldUnlock = false;
					}
				}
				break;

			case 'streak':
				if (streakDays >= threshold) {
					shouldUnlock = true;
				}
				break;

			case 'perfect_score':
				if (
					event.type === 'quiz_complete' &&
					(event.metadata.score as number) === (event.metadata.totalQuestions as number)
				) {
					shouldUnlock = threshold === 1;
				}
				break;

			case 'flashcard_review':
				if (event.type === 'flashcard_review') {
					const flashcardCount = (progress?.totalMarksEarned ?? 0) > 0 ? 50 : 0;
					shouldUnlock = flashcardCount + ((event.metadata.count as number) || 0) >= threshold;
				}
				break;

			case 'topic_mastery':
				shouldUnlock = (progress?.bestStreak ?? 0) >= threshold;
				break;

			case 'all_subjects':
				shouldUnlock = (progress?.totalQuestionsAttempted ?? 0) >= threshold;
				break;

			case 'aps_milestone':
				shouldUnlock = (progress?.totalMarksEarned ?? 0) >= threshold * 10;
				break;
		}

		if (shouldUnlock) {
			await db.insert(userAchievements).values({
				userId,
				achievementId: achievement.id,
				title: achievement.name,
				description: achievement.description,
				icon: achievement.icon,
			});
			unlocked.push(achievement.id);
		}
	}

	return unlocked;
}

// ============================================================================
// XP AWARDING
// ============================================================================

async function awardXp(userId: string, xp: number): Promise<number> {
	const db = await getDb();
	const progress = await getUserProgress(userId);
	const currentXp = progress?.totalMarksEarned ?? 0;
	const newXp = currentXp + xp;

	await db
		.insert(userProgress)
		.values({
			userId,
			totalMarksEarned: newXp,
			lastActivityAt: new Date(),
		})
		.onConflictDoUpdate({
			target: [userProgress.userId],
			set: {
				totalMarksEarned: newXp,
				lastActivityAt: new Date(),
				updatedAt: new Date(),
			},
		});

	return newXp;
}

// ============================================================================
// STREAK UPDATE
// ============================================================================

async function updateStreak(userId: string): Promise<number> {
	const db = await getDb();
	const progress = await getUserProgress(userId);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const lastActivity = progress?.lastActivityAt ? new Date(progress.lastActivityAt) : null;
	let streakDays = progress?.streakDays ?? 0;

	if (lastActivity) {
		const lastDay = new Date(
			lastActivity.getFullYear(),
			lastActivity.getMonth(),
			lastActivity.getDate()
		);
		const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

		if (daysDiff === 0) {
			return streakDays;
		}
		if (daysDiff === 1) {
			streakDays++;
		} else {
			streakDays = 1;
		}
	} else {
		streakDays = 1;
	}

	const bestStreak = Math.max(streakDays, progress?.bestStreak ?? 0);

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

	return streakDays;
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export async function processGamificationEvent(
	event: GamificationEvent
): Promise<GamificationResult> {
	const { userId } = event;

	const progress = await getUserProgress(userId);
	const streakDays = progress?.streakDays ?? 0;
	const streakMult = getStreakMultiplierFromDays(streakDays);

	const hour = new Date().getHours();
	const isEarlyBird = hour < 7;
	const isNightOwl = hour >= 22;
	const timeOfDayBonus = isEarlyBird || isNightOwl ? 1.1 : 1;

	const xpEarned = Math.round(calculateXp(event, streakMult) * timeOfDayBonus);

	const existingAchievements = await getUserAchievements(userId);
	const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

	const unlockedAchievements = await checkAchievements(userId, event, existingIds);

	await awardXp(userId, xpEarned);
	const newStreak = await updateStreak(userId);

	const totalXp = (await getUserProgress(userId))?.totalMarksEarned ?? 0;
	const levelInfo = await getXPLevel(totalXp);

	return {
		xpEarned,
		newLevel: levelInfo.level,
		unlockedAchievements,
		newStreak,
	};
}

// ============================================================================
// SERVER-ACTION WRAPPER (for client-side calls)
// ============================================================================

export async function processGamificationAction(
	type: GamificationEvent['type'],
	metadata: Record<string, unknown>
): Promise<GamificationResult> {
	const { getAuth } = await import('@/lib/auth');
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	return processGamificationEvent({
		userId: session.user.id,
		type,
		metadata,
	});
}

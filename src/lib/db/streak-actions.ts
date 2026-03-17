'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import {
	getStreakMultiplier,
	MAX_STREAK_FREEZES,
	STREAK_FREEZE_COST_XP,
} from '@/constants/rewards';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { userProgress } from '@/lib/db/schema';
import { getNextMultiplierThreshold } from '@/lib/streak-utils';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface StreakInfo {
	currentStreak: number;
	bestStreak: number;
	streakFreezes: number;
	multiplier: number;
	multiplierLabel: string;
	canUseFreeze: boolean;
	daysUntilNextMultiplier: number;
}

export async function getStreakInfo(): Promise<StreakInfo | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return null;
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		if (progressRecords.length === 0) {
			return {
				currentStreak: 0,
				bestStreak: 0,
				streakFreezes: 0,
				multiplier: 1,
				multiplierLabel: 'Base',
				canUseFreeze: false,
				daysUntilNextMultiplier: 3,
			};
		}

		const currentStreak = Math.max(...progressRecords.map((r) => r.streakDays));
		const bestStreak = Math.max(...progressRecords.map((r) => r.bestStreak || 0));
		const streakFreezes = progressRecords[0]?.streakFreezes || 0;

		const multiplierInfo = getStreakMultiplier(currentStreak);
		const nextThreshold = getNextMultiplierThreshold(currentStreak);
		const daysUntilNext = nextThreshold - currentStreak;

		return {
			currentStreak,
			bestStreak,
			streakFreezes,
			multiplier: multiplierInfo.multiplier,
			multiplierLabel: multiplierInfo.label,
			canUseFreeze: streakFreezes > 0,
			daysUntilNextMultiplier: daysUntilNext,
		};
	} catch (error) {
		console.debug('[StreakActions] Error getting streak info:', error);
		return null;
	}
}

export async function useStreakFreeze(): Promise<{ success: boolean; message: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { success: false, message: 'Not authenticated' };
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		if (progressRecords.length === 0) {
			return { success: false, message: 'No progress record found' };
		}

		const currentFreezes = progressRecords[0].streakFreezes || 0;

		if (currentFreezes <= 0) {
			return { success: false, message: 'No streak freezes available' };
		}

		await db
			.update(userProgress)
			.set({
				streakFreezes: currentFreezes - 1,
				updatedAt: new Date(),
			})
			.where(eq(userProgress.userId, userId));

		return { success: true, message: 'Streak freeze used successfully' };
	} catch (error) {
		console.debug('[StreakActions] Error using streak freeze:', error);
		return { success: false, message: 'Failed to use streak freeze' };
	}
}

export async function addStreakFreeze(userId: string, count = 1): Promise<boolean> {
	try {
		const db = await getDb();

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		if (progressRecords.length === 0) {
			return false;
		}

		const currentFreezes = progressRecords[0].streakFreezes || 0;
		const newFreezeCount = Math.min(currentFreezes + count, MAX_STREAK_FREEZES);

		await db
			.update(userProgress)
			.set({
				streakFreezes: newFreezeCount,
				updatedAt: new Date(),
			})
			.where(eq(userProgress.userId, userId));

		return true;
	} catch (error) {
		console.debug('[StreakActions] Error adding streak freeze:', error);
		return false;
	}
}

export async function purchaseStreakFreeze(): Promise<{ success: boolean; message: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { success: false, message: 'Not authenticated' };
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		if (progressRecords.length === 0) {
			return { success: false, message: 'No progress record found' };
		}

		const currentFreezes = progressRecords[0].streakFreezes || 0;

		if (currentFreezes >= MAX_STREAK_FREEZES) {
			return { success: false, message: 'Maximum streak freezes reached' };
		}

		const totalMarks = progressRecords.reduce((sum, r) => sum + r.totalMarksEarned, 0);
		const currentXp = totalMarks * 10;

		if (currentXp < STREAK_FREEZE_COST_XP) {
			return { success: false, message: 'Not enough XP' };
		}

		await db
			.update(userProgress)
			.set({
				streakFreezes: currentFreezes + 1,
				totalMarksEarned: Math.floor((currentXp - STREAK_FREEZE_COST_XP) / 10),
				updatedAt: new Date(),
			})
			.where(eq(userProgress.userId, userId));

		return { success: true, message: 'Streak freeze purchased successfully' };
	} catch (error) {
		console.debug('[StreakActions] Error purchasing streak freeze:', error);
		return { success: false, message: 'Failed to purchase streak freeze' };
	}
}

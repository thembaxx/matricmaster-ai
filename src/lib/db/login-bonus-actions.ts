'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDailyLoginReward } from '@/constants/rewards';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { userProgress } from '@/lib/db/schema';
import { addStreakFreeze } from './streak-actions';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface LoginBonusStatus {
	canClaim: boolean;
	consecutiveDays: number;
	nextReward: {
		xpBonus: number;
		streakFreeze: boolean;
		specialReward: string | undefined;
	} | null;
	lastClaimedAt: Date | null;
	timeUntilNextClaim: number;
}

export interface ClaimLoginBonusResult {
	success: boolean;
	xpEarned: number;
	streakFreezeAwarded: boolean;
	specialReward: string | undefined;
	consecutiveDays: number;
	message: string;
}

function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

function isYesterday(date1: Date, date2: Date): boolean {
	const yesterday = new Date(date2);
	yesterday.setDate(yesterday.getDate() - 1);
	return isSameDay(date1, yesterday);
}

function getMillisecondsUntilMidnight(): number {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setHours(0, 0, 0, 0);
	return midnight.getTime() - now.getTime();
}

export async function getLoginBonusStatus(): Promise<LoginBonusStatus> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return {
			canClaim: false,
			consecutiveDays: 0,
			nextReward: null,
			lastClaimedAt: null,
			timeUntilNextClaim: 0,
		};
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId))
			.limit(1);

		if (progressRecords.length === 0) {
			const reward = getDailyLoginReward(1);
			return {
				canClaim: true,
				consecutiveDays: 0,
				nextReward: reward
					? {
							xpBonus: reward.xpBonus,
							streakFreeze: reward.streakFreeze || false,
							specialReward: reward.specialReward,
						}
					: null,
				lastClaimedAt: null,
				timeUntilNextClaim: 0,
			};
		}

		const progress = progressRecords[0];
		const lastClaimedAt = progress.lastLoginBonusAt;
		const consecutiveDays = progress.consecutiveLoginDays || 0;
		const now = new Date();

		let canClaim = true;
		if (lastClaimedAt && isSameDay(lastClaimedAt, now)) {
			canClaim = false;
		}

		const nextDay = canClaim ? consecutiveDays + 1 : consecutiveDays;
		const reward = getDailyLoginReward(nextDay);

		return {
			canClaim,
			consecutiveDays,
			nextReward: reward
				? {
						xpBonus: reward.xpBonus,
						streakFreeze: reward.streakFreeze || false,
						specialReward: reward.specialReward,
					}
				: null,
			lastClaimedAt: lastClaimedAt || null,
			timeUntilNextClaim: canClaim ? 0 : getMillisecondsUntilMidnight(),
		};
	} catch (error) {
		console.error('[LoginBonus] Error getting status:', error);
		return {
			canClaim: false,
			consecutiveDays: 0,
			nextReward: null,
			lastClaimedAt: null,
			timeUntilNextClaim: 0,
		};
	}
}

export async function claimLoginBonus(): Promise<ClaimLoginBonusResult> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return {
			success: false,
			xpEarned: 0,
			streakFreezeAwarded: false,
			specialReward: undefined,
			consecutiveDays: 0,
			message: 'Not authenticated',
		};
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId))
			.limit(1);

		if (progressRecords.length === 0) {
			return {
				success: false,
				xpEarned: 0,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: 0,
				message: 'No progress record found',
			};
		}

		const progress = progressRecords[0];
		const lastClaimedAt = progress.lastLoginBonusAt;
		const now = new Date();

		if (lastClaimedAt && isSameDay(lastClaimedAt, now)) {
			return {
				success: false,
				xpEarned: 0,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: progress.consecutiveLoginDays || 0,
				message: 'Already claimed today',
			};
		}

		let newConsecutiveDays = 1;
		if (lastClaimedAt && isYesterday(lastClaimedAt, now)) {
			newConsecutiveDays = (progress.consecutiveLoginDays || 0) + 1;
		}

		const reward = getDailyLoginReward(newConsecutiveDays);
		if (!reward) {
			return {
				success: false,
				xpEarned: 0,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: newConsecutiveDays,
				message: 'No reward available',
			};
		}

		const xpToAdd = Math.floor(reward.xpBonus / 10);
		await db
			.update(userProgress)
			.set({
				lastLoginBonusAt: now,
				consecutiveLoginDays: newConsecutiveDays,
				totalLoginBonusesClaimed: (progress.totalLoginBonusesClaimed || 0) + 1,
				totalMarksEarned: progress.totalMarksEarned + xpToAdd,
				updatedAt: now,
			})
			.where(eq(userProgress.userId, userId));

		let streakFreezeAwarded = false;
		if (reward.streakFreeze) {
			const added = await addStreakFreeze(userId, 1);
			streakFreezeAwarded = added;
		}

		return {
			success: true,
			xpEarned: reward.xpBonus,
			streakFreezeAwarded,
			specialReward: reward.specialReward,
			consecutiveDays: newConsecutiveDays,
			message: reward.specialReward || `Day ${newConsecutiveDays} bonus claimed!`,
		};
	} catch (error) {
		console.error('[LoginBonus] Error claiming bonus:', error);
		return {
			success: false,
			xpEarned: 0,
			streakFreezeAwarded: false,
			specialReward: undefined,
			consecutiveDays: 0,
			message: 'Failed to claim bonus',
		};
	}
}

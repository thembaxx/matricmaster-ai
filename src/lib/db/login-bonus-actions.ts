'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDailyLoginReward } from '@/content';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { userProgress } from '@/lib/db/schema';
import { addStreakFreeze } from './streak-actions';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return (await dbManager.getDb()) as unknown as DbType;
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
	totalXp: number;
	streakFreezeAwarded: boolean;
	specialReward: string | undefined;
	consecutiveDays: number;
	message: string;
}

function getDateInTimezone(date: Date, timezone: string): Date {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const parts = formatter.formatToParts(date);
	const year = Number.parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
	const month = Number.parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
	const day = Number.parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
	return new Date(year, month, day);
}

function isSameDay(date1: Date, date2: Date, timezone = 'Africa/Johannesburg'): boolean {
	const d1 = getDateInTimezone(date1, timezone);
	const d2 = getDateInTimezone(date2, timezone);
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
}

function isYesterday(date1: Date, date2: Date, timezone = 'Africa/Johannesburg'): boolean {
	const d1 = getDateInTimezone(date1, timezone);
	const d2 = getDateInTimezone(date2, timezone);
	const yesterday = new Date(d2);
	yesterday.setDate(yesterday.getDate() - 1);
	return (
		d1.getFullYear() === yesterday.getFullYear() &&
		d1.getMonth() === yesterday.getMonth() &&
		d1.getDate() === yesterday.getDate()
	);
}

function getMillisecondsUntilMidnight(timezone = 'Africa/Johannesburg'): number {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});
	const parts = formatter.formatToParts(now);
	const getPart = (type: string) =>
		Number.parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

	const year = getPart('year');
	const month = getPart('month') - 1;
	const day = getPart('day');

	// Create midnight in user's timezone by setting to next day at 00:00:00
	const userNow = new Date(year, month, day, getPart('hour'), getPart('minute'), getPart('second'));
	const midnight = new Date(year, month, day + 1, 0, 0, 0);

	return midnight.getTime() - userNow.getTime();
}

export async function getLoginBonusStatus(
	timezone = 'Africa/Johannesburg'
): Promise<LoginBonusStatus> {
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
		if (lastClaimedAt && isSameDay(lastClaimedAt, now, timezone)) {
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
			timeUntilNextClaim: canClaim ? 0 : getMillisecondsUntilMidnight(timezone),
		};
	} catch (error) {
		console.debug('[LoginBonus] Error getting status:', error);
		return {
			canClaim: false,
			consecutiveDays: 0,
			nextReward: null,
			lastClaimedAt: null,
			timeUntilNextClaim: 0,
		};
	}
}

export async function claimLoginBonus(
	timezone = 'Africa/Johannesburg'
): Promise<ClaimLoginBonusResult> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return {
			success: false,
			xpEarned: 0,
			totalXp: 0,
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
				totalXp: 0,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: 0,
				message: 'No progress record found',
			};
		}

		const progress = progressRecords[0];
		const lastClaimedAt = progress.lastLoginBonusAt;
		const now = new Date();

		if (lastClaimedAt && isSameDay(lastClaimedAt, now, timezone)) {
			return {
				success: false,
				xpEarned: 0,
				totalXp: progress.totalMarksEarned,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: progress.consecutiveLoginDays || 0,
				message: 'Already claimed today',
			};
		}

		let newConsecutiveDays = 1;
		if (lastClaimedAt && isYesterday(lastClaimedAt, now, timezone)) {
			newConsecutiveDays = (progress.consecutiveLoginDays || 0) + 1;
		}

		const reward = getDailyLoginReward(newConsecutiveDays);
		if (!reward) {
			return {
				success: false,
				xpEarned: 0,
				totalXp: progress.totalMarksEarned,
				streakFreezeAwarded: false,
				specialReward: undefined,
				consecutiveDays: newConsecutiveDays,
				message: 'No reward available',
			};
		}

		const xpToAdd = reward.xpBonus;
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
			xpEarned: xpToAdd,
			totalXp: progress.totalMarksEarned + xpToAdd,
			streakFreezeAwarded,
			specialReward: reward.specialReward,
			consecutiveDays: newConsecutiveDays,
			message: reward.specialReward || `Day ${newConsecutiveDays} bonus claimed!`,
		};
	} catch (error) {
		console.debug('[LoginBonus] Error claiming bonus:', error);
		return {
			success: false,
			xpEarned: 0,
			totalXp: 0,
			streakFreezeAwarded: false,
			specialReward: undefined,
			consecutiveDays: 0,
			message: 'Failed to claim bonus',
		};
	}
}

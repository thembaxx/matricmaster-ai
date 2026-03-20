'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { userProgress } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface LevelInfo {
	level: number;
	xpToNext: number;
	title: string;
	totalXpForCurrentLevel: number;
	xpProgress: number;
	progressPercent: number;
}

const LEVEL_TIERS = [
	{ level: 1, xp: 0, title: 'Novice' },
	{ level: 2, xp: 100, title: 'Learner' },
	{ level: 3, xp: 250, title: 'Apprentice' },
	{ level: 5, xp: 500, title: 'Scholar' },
	{ level: 8, xp: 1200, title: 'Adept' },
	{ level: 10, xp: 2000, title: 'Expert' },
	{ level: 15, xp: 5000, title: 'Specialist' },
	{ level: 20, xp: 10000, title: 'Master' },
	{ level: 25, xp: 17500, title: 'Grandmaster' },
	{ level: 30, xp: 25000, title: 'Champion' },
	{ level: 40, xp: 50000, title: 'Elite' },
	{ level: 50, xp: 100000, title: 'Legend' },
];

function xpForLevel(level: number): number {
	if (level <= 1) return 0;
	if (level <= 2) return 100;
	const base = 100;
	let xp = base;
	for (let i = 2; i < level; i++) {
		xp = Math.floor(xp * 1.35 + 25);
	}
	return xp;
}

export async function getXPLevel(totalXp: number): Promise<LevelInfo> {
	if (totalXp <= 0) {
		return {
			level: 1,
			xpToNext: 100,
			title: 'Novice',
			totalXpForCurrentLevel: 0,
			xpProgress: 0,
			progressPercent: 0,
		};
	}

	let level = 1;
	let cumulativeXp = 0;
	const maxLevel = 50;

	for (let i = 1; i <= maxLevel; i++) {
		const needed = xpForLevel(i);
		if (cumulativeXp + needed > totalXp) {
			level = i;
			break;
		}
		cumulativeXp += needed;
		level = i + 1;
	}

	level = Math.min(level, maxLevel);
	const xpProgress = totalXp - cumulativeXp;
	const xpForNext = level < maxLevel ? xpForLevel(level + 1) : 0;
	const progressPercent =
		xpForNext > 0 ? Math.min(100, Math.round((xpProgress / xpForNext) * 100)) : 100;

	let title = 'Novice';
	for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
		if (level >= LEVEL_TIERS[i].level) {
			title = LEVEL_TIERS[i].title;
			break;
		}
	}

	return {
		level,
		xpToNext: xpForNext,
		title,
		totalXpForCurrentLevel: cumulativeXp,
		xpProgress,
		progressPercent,
	};
}

export async function getUserTotalXP(userId?: string): Promise<number> {
	const db = await getDb();

	let targetUserId = userId;
	if (!targetUserId) {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) return 0;
		targetUserId = session.user.id;
	}

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, targetUserId),
	});

	return progress?.totalMarksEarned || 0;
}

export async function awardXP(userId: string, amount: number, _reason: string): Promise<number> {
	const db = await getDb();

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	const currentXp = progress?.totalMarksEarned || 0;
	const newXp = currentXp + amount;

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

export async function getUserXPAndLevel(): Promise<{
	totalXp: number;
	level: LevelInfo;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return {
			totalXp: 0,
			level: await getXPLevel(0),
		};
	}

	const totalXp = await getUserTotalXP(session.user.id);
	const level = await getXPLevel(totalXp);

	return { totalXp, level };
}

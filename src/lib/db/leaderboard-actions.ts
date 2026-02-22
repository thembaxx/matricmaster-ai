'use server';

import { and, count, desc, eq, gte, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import type { LeaderboardEntry } from '@/lib/db/schema';
import { leaderboardEntries, user, userProgress } from '@/lib/db/schema';
import {
	calculateAccuracy,
	calculateQuizPoints,
	getCurrentPeriodStart,
} from '@/lib/leaderboard-utils';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface LeaderboardEntryData {
	rank: number;
	userId: string;
	userName: string;
	userImage: string | null;
	totalPoints: number;
	questionsCompleted: number;
	accuracyPercentage: number;
}

export interface UserRankData {
	rank: number;
	totalPoints: number;
	questionsCompleted: number;
	accuracyPercentage: number;
	percentile: number;
}

export async function getLeaderboard(
	periodType: 'weekly' | 'monthly' | 'all_time',
	limit = 50
): Promise<LeaderboardEntryData[]> {
	try {
		const db = await getDb();
		let entries: LeaderboardEntry[] = [];

		if (periodType !== 'all_time') {
			const periodStart = getCurrentPeriodStart(periodType);
			entries = await db
				.select()
				.from(leaderboardEntries)
				.where(
					and(
						eq(leaderboardEntries.periodType, periodType),
						gte(leaderboardEntries.periodStart, periodStart)
					)
				)
				.orderBy(desc(leaderboardEntries.totalPoints))
				.limit(limit);
		} else {
			entries = await db
				.select()
				.from(leaderboardEntries)
				.where(eq(leaderboardEntries.periodType, periodType))
				.orderBy(desc(leaderboardEntries.totalPoints))
				.limit(limit);
		}

		// Batch fetch all users in one query to avoid N+1 problem
		const userIds = [...new Set(entries.map((e) => e.userId))];
		const usersBatch =
			userIds.length > 0 ? await db.select().from(user).where(inArray(user.id, userIds)) : [];

		// Build lookup map
		const userMap = new Map(usersBatch.map((u) => [u.id, u]));

		const entriesWithUsers: LeaderboardEntryData[] = entries.map((entry, index) => {
			const userRecord = userMap.get(entry.userId);
			return {
				rank: entry.rank || index + 1,
				userId: entry.userId,
				userName: userRecord?.name || 'Unknown User',
				userImage: userRecord?.image || null,
				totalPoints: entry.totalPoints,
				questionsCompleted: entry.questionsCompleted,
				accuracyPercentage: entry.accuracyPercentage || 0,
			};
		});

		return entriesWithUsers;
	} catch (error) {
		console.error('[Leaderboard] Error fetching leaderboard:', error);
		return [];
	}
}

export async function getUserRank(
	periodType: 'weekly' | 'monthly' | 'all_time'
): Promise<UserRankData | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return null;
	}

	try {
		const db = await getDb();
		const periodStart = getCurrentPeriodStart(periodType);

		let userEntry: LeaderboardEntry[] = [];

		if (periodType !== 'all_time') {
			userEntry = await db
				.select()
				.from(leaderboardEntries)
				.where(
					and(
						eq(leaderboardEntries.userId, session.user.id),
						eq(leaderboardEntries.periodType, periodType),
						gte(leaderboardEntries.periodStart, periodStart)
					)
				)
				.orderBy(desc(leaderboardEntries.totalPoints))
				.limit(1);
		} else {
			userEntry = await db
				.select()
				.from(leaderboardEntries)
				.where(
					and(
						eq(leaderboardEntries.userId, session.user.id),
						eq(leaderboardEntries.periodType, periodType)
					)
				)
				.orderBy(desc(leaderboardEntries.totalPoints))
				.limit(1);
		}

		if (userEntry.length === 0) {
			return {
				rank: 0,
				totalPoints: 0,
				questionsCompleted: 0,
				accuracyPercentage: 0,
				percentile: 0,
			};
		}

		const totalUsers = await db
			.select({ count: count() })
			.from(leaderboardEntries)
			.where(eq(leaderboardEntries.periodType, periodType));

		const userRank = userEntry[0].rank || 0;
		const totalCount = totalUsers[0]?.count || 0;
		const percentile =
			totalCount > 0 ? Math.round(((totalCount - userRank) / totalCount) * 100) : 0;

		return {
			rank: userRank,
			totalPoints: userEntry[0].totalPoints,
			questionsCompleted: userEntry[0].questionsCompleted,
			accuracyPercentage: userEntry[0].accuracyPercentage || 0,
			percentile,
		};
	} catch (error) {
		console.error('[Leaderboard] Error fetching user rank:', error);
		return null;
	}
}

export async function updateUserScore(params: {
	correctAnswers: number;
	totalQuestions: number;
	durationMinutes: number;
	difficulty: 'easy' | 'medium' | 'hard';
	subjectId?: number;
}): Promise<{
	pointsEarned: number;
	newTotal: number;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { pointsEarned: 0, newTotal: 0 };
	}

	try {
		const db = await getDb();
		const userId = session.user.id;

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId))
			.limit(1);

		const streakDays = progressRecords[0]?.streakDays || 0;

		const pointsEarned = calculateQuizPoints({
			correctAnswers: params.correctAnswers,
			totalQuestions: params.totalQuestions,
			durationMinutes: params.durationMinutes,
			expectedDuration: params.totalQuestions * 1.5,
			difficulty: params.difficulty,
			hasStreak: streakDays > 0,
			streakDays,
		});

		const accuracy = calculateAccuracy(params.correctAnswers, params.totalQuestions);

		const periodTypes: Array<'weekly' | 'monthly' | 'all_time'> = ['weekly', 'monthly', 'all_time'];

		for (const periodType of periodTypes) {
			const periodStart = getCurrentPeriodStart(periodType);

			let existing: LeaderboardEntry[] = [];

			if (periodType !== 'all_time') {
				existing = await db
					.select()
					.from(leaderboardEntries)
					.where(
						and(
							eq(leaderboardEntries.userId, userId),
							eq(leaderboardEntries.periodType, periodType),
							gte(leaderboardEntries.periodStart, periodStart)
						)
					)
					.limit(1);
			} else {
				existing = await db
					.select()
					.from(leaderboardEntries)
					.where(
						and(
							eq(leaderboardEntries.userId, userId),
							eq(leaderboardEntries.periodType, periodType)
						)
					)
					.limit(1);
			}

			if (existing && existing.length > 0) {
				const current = existing[0];
				const newQuestions = (current.questionsCompleted || 0) + params.totalQuestions;
				const newAccuracy =
					newQuestions > 0
						? Math.round(
								((current.accuracyPercentage || 0) * (current.questionsCompleted || 0) + accuracy) /
									newQuestions
							)
						: accuracy;

				await db
					.update(leaderboardEntries)
					.set({
						totalPoints: (current.totalPoints || 0) + pointsEarned,
						questionsCompleted: newQuestions,
						accuracyPercentage: newAccuracy,
						updatedAt: new Date(),
					})
					.where(eq(leaderboardEntries.id, current.id));
			} else {
				await db.insert(leaderboardEntries).values({
					userId,
					periodType,
					periodStart,
					totalPoints: pointsEarned,
					questionsCompleted: params.totalQuestions,
					accuracyPercentage: accuracy,
				});
			}
		}

		await recalculateRanks(db);

		revalidatePath('/leaderboard');
		revalidatePath('/profile');

		const newEntry = await db
			.select()
			.from(leaderboardEntries)
			.where(
				and(eq(leaderboardEntries.userId, userId), eq(leaderboardEntries.periodType, 'all_time'))
			)
			.limit(1);

		return {
			pointsEarned,
			newTotal: newEntry[0]?.totalPoints || 0,
		};
	} catch (error) {
		console.error('[Leaderboard] Error updating score:', error);
		return { pointsEarned: 0, newTotal: 0 };
	}
}

async function recalculateRanks(db: DbType): Promise<void> {
	const periodTypes: Array<'weekly' | 'monthly' | 'all_time'> = ['weekly', 'monthly', 'all_time'];

	for (const periodType of periodTypes) {
		const periodStart = getCurrentPeriodStart(periodType);

		let entries: LeaderboardEntry[] = [];

		if (periodType !== 'all_time') {
			entries = await db
				.select()
				.from(leaderboardEntries)
				.where(
					and(
						eq(leaderboardEntries.periodType, periodType),
						gte(leaderboardEntries.periodStart, periodStart)
					)
				)
				.orderBy(desc(leaderboardEntries.totalPoints));
		} else {
			entries = await db
				.select()
				.from(leaderboardEntries)
				.where(eq(leaderboardEntries.periodType, periodType))
				.orderBy(desc(leaderboardEntries.totalPoints));
		}

		for (let i = 0; i < entries.length; i++) {
			await db
				.update(leaderboardEntries)
				.set({ rank: i + 1 })
				.where(eq(leaderboardEntries.id, entries[i].id));
		}
	}
}

export async function getSubjectLeaderboard(
	subjectId: number,
	limit = 20
): Promise<LeaderboardEntryData[]> {
	try {
		const db = await getDb();
		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.subjectId, subjectId))
			.orderBy(desc(userProgress.totalCorrect))
			.limit(limit);

		// Batch fetch users to avoid N+1 queries
		const userIds = [...new Set(progressRecords.map((r) => r.userId))];
		const usersBatch =
			userIds.length > 0 ? await db.select().from(user).where(inArray(user.id, userIds)) : [];
		const userMap = new Map(usersBatch.map((u) => [u.id, u]));

		const entries: LeaderboardEntryData[] = progressRecords.map((record, index) => {
			const userRecord = userMap.get(record.userId);
			return {
				rank: index + 1,
				userId: record.userId,
				userName: userRecord?.name || 'Unknown',
				userImage: userRecord?.image || null,
				totalPoints: record.totalCorrect * 10,
				questionsCompleted: record.totalQuestionsAttempted,
				accuracyPercentage:
					record.totalQuestionsAttempted > 0
						? Math.round((record.totalCorrect / record.totalQuestionsAttempted) * 100)
						: 0,
			};
		});

		return entries;
	} catch (error) {
		console.error('[Leaderboard] Error fetching subject leaderboard:', error);
		return [];
	}
}

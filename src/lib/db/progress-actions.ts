'use server';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { studySessions, userProgress } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface ProgressUpdateData {
	subjectId?: number;
	topic?: string;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	durationMinutes?: number;
	sessionType?: 'practice' | 'test' | 'past_paper';
}

export interface UserProgressSummary {
	totalQuestionsAttempted: number;
	totalCorrect: number;
	totalMarksEarned: number;
	streakDays: number;
	accuracy: number;
	recentSessions: SessionData[];
}

export interface SessionData {
	id: string;
	sessionType: string;
	subjectId: number | null;
	durationMinutes: number | null;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	startedAt: Date;
	completedAt: Date | null;
}

export async function getUserProgressSummary(): Promise<UserProgressSummary | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return null;
	}

	try {
		const db = await getDb();
		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, session.user.id));

		if (progressRecords.length === 0) {
			return {
				totalQuestionsAttempted: 0,
				totalCorrect: 0,
				totalMarksEarned: 0,
				streakDays: 0,
				accuracy: 0,
				recentSessions: [],
			};
		}

		const totals = progressRecords.reduce(
			(acc, record) => ({
				questions: acc.questions + record.totalQuestionsAttempted,
				correct: acc.correct + record.totalCorrect,
				marks: acc.marks + record.totalMarksEarned,
				streak: Math.max(acc.streak, record.streakDays),
			}),
			{ questions: 0, correct: 0, marks: 0, streak: 0 }
		);

		const recentSessionsData = await db
			.select()
			.from(studySessions)
			.where(eq(studySessions.userId, session.user.id))
			.orderBy(desc(studySessions.startedAt))
			.limit(10);

		const recentSessions: SessionData[] = recentSessionsData.map((s) => ({
			id: s.id,
			sessionType: s.sessionType,
			subjectId: s.subjectId,
			durationMinutes: s.durationMinutes,
			questionsAttempted: s.questionsAttempted,
			correctAnswers: s.correctAnswers,
			marksEarned: s.marksEarned,
			// Use completedAt as fallback if startedAt is null, not new Date()
			startedAt: s.startedAt ?? s.completedAt ?? new Date(),
			completedAt: s.completedAt,
		}));

		const accuracy =
			totals.questions > 0 ? Math.round((totals.correct / totals.questions) * 100) : 0;

		return {
			totalQuestionsAttempted: totals.questions,
			totalCorrect: totals.correct,
			totalMarksEarned: totals.marks,
			streakDays: totals.streak,
			accuracy,
			recentSessions,
		};
	} catch (error) {
		console.error('[Progress] Error fetching summary:', error);
		return null;
	}
}

export async function getSubjectProgress(subjectId: number): Promise<{
	questionsAttempted: number;
	correctAnswers: number;
	accuracy: number;
	streakDays: number;
} | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return null;
	}

	try {
		const db = await getDb();
		const records = await db
			.select()
			.from(userProgress)
			.where(and(eq(userProgress.userId, session.user.id), eq(userProgress.subjectId, subjectId)));

		if (records.length === 0) {
			return {
				questionsAttempted: 0,
				correctAnswers: 0,
				accuracy: 0,
				streakDays: 0,
			};
		}

		const totals = records.reduce(
			(acc, r) => ({
				questions: acc.questions + r.totalQuestionsAttempted,
				correct: acc.correct + r.totalCorrect,
				streak: Math.max(acc.streak, r.streakDays),
			}),
			{ questions: 0, correct: 0, streak: 0 }
		);

		return {
			questionsAttempted: totals.questions,
			correctAnswers: totals.correct,
			accuracy: totals.questions > 0 ? Math.round((totals.correct / totals.questions) * 100) : 0,
			streakDays: totals.streak,
		};
	} catch (error) {
		console.error('[Progress] Error fetching subject progress:', error);
		return null;
	}
}

export async function recordStudySession(data: ProgressUpdateData): Promise<{
	success: boolean;
	newAchievements?: string[];
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { success: false };
	}

	try {
		const db = await getDb();
		const now = new Date();

		await db.insert(studySessions).values({
			userId: session.user.id,
			subjectId: data.subjectId,
			sessionType: data.sessionType || 'practice',
			durationMinutes: data.durationMinutes,
			questionsAttempted: data.questionsAttempted,
			correctAnswers: data.correctAnswers,
			marksEarned: data.marksEarned,
			startedAt: new Date(now.getTime() - (data.durationMinutes || 0) * 60 * 1000),
			completedAt: now,
		});

		if (data.subjectId) {
			const existingProgress = await db
				.select()
				.from(userProgress)
				.where(
					and(
						eq(userProgress.userId, session.user.id),
						eq(userProgress.subjectId, data.subjectId),
						data.topic ? eq(userProgress.topic, data.topic) : undefined
					)
				)
				.limit(1);

			if (existingProgress.length > 0) {
				await db
					.update(userProgress)
					.set({
						totalQuestionsAttempted:
							existingProgress[0].totalQuestionsAttempted + data.questionsAttempted,
						totalCorrect: existingProgress[0].totalCorrect + data.correctAnswers,
						totalMarksEarned: existingProgress[0].totalMarksEarned + data.marksEarned,
						lastActivityAt: now,
						updatedAt: now,
					})
					.where(eq(userProgress.id, existingProgress[0].id));
			} else {
				await db.insert(userProgress).values({
					userId: session.user.id,
					subjectId: data.subjectId,
					topic: data.topic,
					totalQuestionsAttempted: data.questionsAttempted,
					totalCorrect: data.correctAnswers,
					totalMarksEarned: data.marksEarned,
					streakDays: 1,
					lastActivityAt: now,
				});
			}
		}

		revalidatePath('/dashboard');
		revalidatePath('/profile');

		return { success: true };
	} catch (error) {
		console.error('[Progress] Error recording session:', error);
		return { success: false };
	}
}

export async function updateUserStreak(): Promise<{
	streakDays: number;
	streakIncreased: boolean;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { streakDays: 0, streakIncreased: false };
	}

	try {
		const db = await getDb();
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, session.user.id));

		if (progressRecords.length === 0) {
			return { streakDays: 0, streakIncreased: false };
		}

		let streakIncreased = false;
		let maxStreak = 0;

		for (const record of progressRecords) {
			// If no lastActivityAt, treat as no prior activity - reset streak to 1
			if (!record.lastActivityAt) {
				await db
					.update(userProgress)
					.set({ streakDays: 1, lastActivityAt: now, updatedAt: now })
					.where(eq(userProgress.id, record.id));

				streakIncreased = true;
				maxStreak = Math.max(maxStreak, 1);
				continue;
			}

			const lastActivity = new Date(record.lastActivityAt);
			const lastActivityDate = new Date(
				lastActivity.getFullYear(),
				lastActivity.getMonth(),
				lastActivity.getDate()
			);

			const daysDiff = Math.floor(
				(today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (daysDiff === 1) {
				// Consecutive day - increment streak
				const newStreak = record.streakDays + 1;
				await db
					.update(userProgress)
					.set({ streakDays: newStreak, lastActivityAt: now, updatedAt: now })
					.where(eq(userProgress.id, record.id));

				streakIncreased = true;
				maxStreak = Math.max(maxStreak, newStreak);
			} else if (daysDiff === 0) {
				// Same day - no change to streak
				maxStreak = Math.max(maxStreak, record.streakDays);
			} else {
				// Gap > 1 day - reset streak to 1
				await db
					.update(userProgress)
					.set({ streakDays: 1, lastActivityAt: now, updatedAt: now })
					.where(eq(userProgress.id, record.id));

				maxStreak = Math.max(maxStreak, 1);
			}
		}

		return { streakDays: maxStreak, streakIncreased };
	} catch (error) {
		console.error('[Progress] Error updating streak:', error);
		return { streakDays: 0, streakIncreased: false };
	}
}

export async function getUserStreak(): Promise<{
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user) {
		return { currentStreak: 0, bestStreak: 0, lastActivityDate: null };
	}

	try {
		const db = await getDb();
		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, session.user.id));

		if (progressRecords.length === 0) {
			return { currentStreak: 0, bestStreak: 0, lastActivityDate: null };
		}

		const bestStreak = Math.max(...progressRecords.map((r) => r.streakDays));
		const mostRecent = progressRecords.reduce((latest, record) => {
			const recordDate = record.lastActivityAt ? new Date(record.lastActivityAt) : new Date(0);
			return recordDate > latest ? recordDate : latest;
		}, new Date(0));

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const lastActivityDate = new Date(
			mostRecent.getFullYear(),
			mostRecent.getMonth(),
			mostRecent.getDate()
		);
		const daysDiff = Math.floor(
			(today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		const currentStreak = daysDiff <= 1 ? bestStreak : 0;

		return {
			currentStreak,
			bestStreak,
			lastActivityDate: mostRecent.toISOString(),
		};
	} catch (error) {
		console.error('[Progress] Error getting streak:', error);
		return { currentStreak: 0, bestStreak: 0, lastActivityDate: null };
	}
}

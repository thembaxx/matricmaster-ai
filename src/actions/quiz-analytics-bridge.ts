'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import type {
	DailyActivity,
	StudyStats,
	SubjectPerformance,
} from '@/components/Analytics/constants';
import { getAuth } from '@/lib/auth';
import { dbManager, getDb } from '@/lib/db';
import { quizResults, topicConfidence } from '@/lib/db/schema';

/**
 * Bridge: Pulls real quiz results and feeds them into the analytics screen's data shapes.
 * Converts quizResults table data into StudyStats, SubjectPerformance[], and DailyActivity[].
 */

export async function getAnalyticsStudyStats(): Promise<StudyStats> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return getDefaultStudyStats();
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return getDefaultStudyStats();

	const db = await getDb();

	try {
		const results = await db
			.select()
			.from(quizResults)
			.where(eq(quizResults.userId, session.user.id));

		if (results.length === 0) return getDefaultStudyStats();

		const totalCorrect = results.reduce(
			(sum: number, r: (typeof results)[number]) => sum + r.score,
			0
		);
		const totalTimeSpent = results.reduce(
			(sum: number, r: (typeof results)[number]) => sum + r.timeTaken,
			0
		);

		// Calculate level from XP (1 level per 200 XP, 1 XP per correct answer)
		const xp = totalCorrect * 10;
		const level = Math.floor(xp / 200) + 1;
		const xpToNextLevel = level * 200 - (xp % (level * 200));

		// Calculate streak from recent results
		const sortedResults = [...results].sort(
			(a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
		);
		let streakDays = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (const result of sortedResults) {
			const resultDate = new Date(result.completedAt);
			resultDate.setHours(0, 0, 0, 0);
			const daysDiff = Math.floor((today.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24));
			if (daysDiff <= streakDays + 1) {
				if (daysDiff === streakDays || daysDiff === streakDays + 1) {
					streakDays = Math.max(streakDays, daysDiff + 1);
				}
			} else {
				break;
			}
		}

		return {
			totalStudyTime: totalTimeSpent,
			quizzesCompleted: results.length,
			correctAnswers: totalCorrect,
			flashcardsReviewed: 0,
			streakDays: Math.min(streakDays, 30),
			level,
			xp,
			xpToNextLevel,
		};
	} catch (error) {
		console.debug('[Quiz Analytics Bridge] Error getting study stats:', error);
		return getDefaultStudyStats();
	}
}

export async function getAnalyticsSubjectPerformance(): Promise<SubjectPerformance[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = await getDb();

	try {
		const confidences = await db
			.select()
			.from(topicConfidence)
			.where(eq(topicConfidence.userId, session.user.id));

		if (confidences.length === 0) return [];

		// Group by subject
		const subjectMap = new Map<
			string,
			{ topics: { topic: string; confidence: number; attempts: number }[] }
		>();

		for (const c of confidences) {
			const subject = c.subject || 'General';
			if (!subjectMap.has(subject)) {
				subjectMap.set(subject, { topics: [] });
			}
			subjectMap.get(subject)!.topics.push({
				topic: c.topic,
				confidence: Number(c.confidenceScore),
				attempts: c.timesAttempted || 0,
			});
		}

		const subjectNames: Record<string, string> = {
			'1': 'Mathematics',
			'2': 'Physical Sciences',
			'3': 'Life Sciences',
			'4': 'Geography',
			'5': 'History',
		};

		const performances: SubjectPerformance[] = [];

		for (const [subjectId, data] of subjectMap) {
			const totalAttempts = data.topics.reduce((s, t) => s + t.attempts, 0);
			const avgConfidence = data.topics.reduce((s, t) => s + t.confidence, 0) / data.topics.length;
			const averageScore = Math.round(avgConfidence * 100);

			const weakAreas = data.topics
				.filter((t) => t.confidence < 0.6)
				.sort((a, b) => a.confidence - b.confidence)
				.slice(0, 3)
				.map((t) => t.topic);

			const strengthAreas = data.topics
				.filter((t) => t.confidence >= 0.7)
				.sort((a, b) => b.confidence - a.confidence)
				.slice(0, 3)
				.map((t) => t.topic);

			// Determine trend based on recent performance
			const trend: 'up' | 'down' | 'stable' =
				averageScore >= 70 ? 'up' : averageScore >= 50 ? 'stable' : 'down';

			performances.push({
				subject: subjectNames[subjectId] || `Subject ${subjectId}`,
				averageScore,
				questionsAnswered: totalAttempts,
				weakAreas,
				strengthAreas,
				trend,
			});
		}

		return performances;
	} catch (error) {
		console.debug('[Quiz Analytics Bridge] Error getting subject performance:', error);
		return [];
	}
}

export async function getAnalyticsDailyActivity(): Promise<DailyActivity[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = await getDb();

	try {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const results = await db
			.select()
			.from(quizResults)
			.where(
				and(eq(quizResults.userId, session.user.id), gte(quizResults.completedAt, sevenDaysAgo))
			)
			.orderBy(desc(quizResults.completedAt));

		// Group by day
		const dayMap = new Map<string, DailyActivity>();

		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const key = date.toLocaleDateString('en-US', { weekday: 'short' });
			dayMap.set(key, {
				date: key,
				studyMinutes: 0,
				quizzesTaken: 0,
				flashcardsReviewed: 0,
				xpEarned: 0,
			});
		}

		for (const result of results) {
			const date = new Date(result.completedAt);
			const key = date.toLocaleDateString('en-US', { weekday: 'short' });
			const existing = dayMap.get(key);
			if (existing) {
				existing.studyMinutes += Math.ceil(result.timeTaken / 60);
				existing.quizzesTaken += 1;
				existing.xpEarned += result.score * 10;
			}
		}

		return Array.from(dayMap.values());
	} catch (error) {
		console.debug('[Quiz Analytics Bridge] Error getting daily activity:', error);
		return [];
	}
}

function getDefaultStudyStats(): StudyStats {
	return {
		totalStudyTime: 0,
		quizzesCompleted: 0,
		correctAnswers: 0,
		flashcardsReviewed: 0,
		streakDays: 0,
		level: 1,
		xp: 0,
		xpToNextLevel: 200,
	};
}

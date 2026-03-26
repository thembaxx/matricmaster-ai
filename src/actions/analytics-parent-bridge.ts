'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	notifications,
	rewardContracts,
	studySessions,
	topicMastery,
} from '@/lib/db/schema';

interface ParentAnalyticsReport {
	studentName: string;
	reportPeriod: {
		startDate: Date;
		endDate: Date;
	};
	summary: {
		totalStudyHours: number;
		averageScore: number;
		sessionsCompleted: number;
		streakDays: number;
	};
	subjectBreakdown: Array<{
		subject: string;
		hoursSpent: number;
		averageScore: number;
		topTopics: string[];
		strugglingTopics: string[];
	}>;
	weeklyProgress: Array<{
		week: string;
		studyHours: number;
		quizScore: number;
		improvement: number;
	}>;
	alerts: Array<{
		type: 'concern' | 'warning' | 'info';
		message: string;
		recommendation: string;
	}>;
	recommendations: string[];
}

/**
 * Generate a weekly analytics report for parents
 */
export async function generateParentReport(
	studentId: string,
	weeksBack = 1
): Promise<ParentAnalyticsReport | null> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) return null;

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return null;

	const db = await dbManager.getDb();

	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - weeksBack * 7);

	// Get study sessions
	const sessions = await db.query.studySessions.findMany({
		where: and(
			eq(studySessions.userId, studentId),
			sql`${studySessions.startedAt} >= ${startDate.toISOString()}`,
			sql`${studySessions.startedAt} <= ${endDate.toISOString()}`
		),
		orderBy: [desc(studySessions.startedAt)],
	});

	// Calculate summary
	const totalStudyHours = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0) / 60, 0);
	const sessionsWithScores = sessions.filter((s) => s.questionsAttempted > 0);
	const averageScore =
		sessionsWithScores.length > 0
			? sessionsWithScores.reduce(
					(sum, s) => sum + (s.correctAnswers / Math.max(s.questionsAttempted, 1)) * 100,
					0
				) / sessionsWithScores.length
			: 0;

	// Get struggling topics
	const struggles = await db.query.conceptStruggles.findMany({
		where: and(eq(conceptStruggles.userId, studentId), eq(conceptStruggles.isResolved, false)),
		orderBy: [desc(conceptStruggles.struggleCount)],
		limit: 5,
	});

	// Get topic mastery by subject
	const mastery = await db.query.topicMastery.findMany({
		where: eq(topicMastery.userId, studentId),
		orderBy: [desc(topicMastery.lastPracticed)],
	});

	// Group by subject using mastery data
	const subjectMap = new Map<
		string,
		{
			hours: number;
			scores: number[];
			topics: Set<string>;
			struggling: string[];
		}
	>();

	// Add mastery data to subject map
	for (const m of mastery) {
		const subjectId = String(m.subjectId);
		if (!subjectMap.has(subjectId)) {
			subjectMap.set(subjectId, {
				hours: 0,
				scores: [],
				topics: new Set(),
				struggling: [],
			});
		}
		const data = subjectMap.get(subjectId)!;
		data.topics.add(m.topic);
		if (Number(m.masteryLevel) < 0.5) {
			data.struggling.push(m.topic);
		}
	}

	// Add session hours to subject map
	for (const session of sessions) {
		const subjectId = String(session.subjectId || 'general');
		if (!subjectMap.has(subjectId)) {
			subjectMap.set(subjectId, {
				hours: 0,
				scores: [],
				topics: new Set(),
				struggling: [],
			});
		}
		const data = subjectMap.get(subjectId)!;
		data.hours += (session.durationMinutes || 0) / 60;
		if (session.questionsAttempted > 0) {
			data.scores.push((session.correctAnswers / session.questionsAttempted) * 100);
		}
	}

	const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
		subject,
		hoursSpent: Math.round(data.hours * 10) / 10,
		averageScore:
			data.scores.length > 0
				? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
				: 0,
		topTopics: Array.from(data.topics).slice(0, 3),
		strugglingTopics: data.struggling.slice(0, 3),
	}));

	// Generate alerts
	const alerts: ParentAnalyticsReport['alerts'] = [];

	if (averageScore < 50) {
		alerts.push({
			type: 'concern',
			message: 'Average quiz scores are below 50%',
			recommendation: 'Consider additional support or tutoring',
		});
	}

	if (struggles.length > 3) {
		alerts.push({
			type: 'warning',
			message: `Student is struggling with ${struggles.length} concepts`,
			recommendation: 'Focus on foundational concepts with AI tutor',
		});
	}

	if (totalStudyHours < 5 && weeksBack >= 1) {
		alerts.push({
			type: 'warning',
			message: 'Study hours are below expected levels',
			recommendation: 'Encourage consistent daily study habits',
		});
	}

	// Generate recommendations
	const recommendations: string[] = [];

	if (averageScore < 60) {
		recommendations.push('Increase practice with past papers');
	}
	if (struggles.length > 0) {
		recommendations.push(
			`Focus on: ${struggles
				.slice(0, 2)
				.map((s) => s.concept)
				.join(', ')}`
		);
	}
	if (totalStudyHours > 20) {
		recommendations.push('Great study effort! Ensure adequate rest');
	}

	return {
		studentName: session.user.name || 'Student',
		reportPeriod: { startDate, endDate },
		summary: {
			totalStudyHours: Math.round(totalStudyHours * 10) / 10,
			averageScore: Math.round(averageScore),
			sessionsCompleted: sessions.length,
			streakDays: 0,
		},
		subjectBreakdown,
		weeklyProgress: [],
		alerts,
		recommendations,
	};
}

/**
 * Send report to parent via notification
 */
export async function sendParentReport(
	studentId: string
): Promise<{ success: boolean; message: string }> {
	const report = await generateParentReport(studentId, 1);
	if (!report) {
		return { success: false, message: 'Could not generate report' };
	}

	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return { success: false, message: 'Unauthorized' };

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return { success: false, message: 'Database unavailable' };

	const db = await dbManager.getDb();

	try {
		await db.insert(notifications).values({
			id: crypto.randomUUID(),
			userId: studentId,
			type: 'weekly_report',
			title: 'Weekly Progress Report',
			message: `Study hours: ${report.summary.totalStudyHours}h, Average score: ${report.summary.averageScore}%`,
			isRead: false,
			createdAt: new Date(),
		});

		return { success: true, message: 'Report sent successfully' };
	} catch (error) {
		console.error('Failed to send parent report:', error);
		return { success: false, message: 'Failed to send report' };
	}
}

/**
 * Get active reward contracts for a student (parent-student connection)
 */
export async function getParentRewardContracts(studentId: string): Promise<
	Array<{
		id: string;
		title: string;
		reward: string;
		targetStreakDays: number;
		currentStreakDays: number;
		targetQuizCount: number;
		currentQuizCount: number;
		status: string;
	}>
> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = await dbManager.getDb();

	const contracts = await db.query.rewardContracts.findMany({
		where: and(eq(rewardContracts.studentId, studentId), eq(rewardContracts.status, 'active')),
		orderBy: [desc(rewardContracts.createdAt)],
	});

	return contracts.map((c) => ({
		id: c.id,
		title: c.title,
		reward: c.reward,
		targetStreakDays: c.targetStreakDays,
		currentStreakDays: c.currentStreakDays,
		targetQuizCount: c.targetQuizCount,
		currentQuizCount: c.currentQuizCount,
		status: c.status,
	}));
}

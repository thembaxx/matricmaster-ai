'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { studySessions, userProgress } from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');
	return session.user;
}

export interface BurnoutRiskLevel {
	level: 'low' | 'moderate' | 'high' | 'severe';
	score: number;
	indicators: string[];
	recommendations: string[];
}

export interface StudySessionStats {
	totalMinutesToday: number;
	totalMinutesThisWeek: number;
	averageSessionLength: number;
	sessionsToday: number;
	sessionsThisWeek: number;
	consecutiveDaysStudied: number;
	daysWithoutBreak: number;
}

const BURNOUT_THRESHOLDS = {
	DAILY_LIMIT_MINUTES: 180,
	WEEKLY_LIMIT_MINUTES: 900,
	SESSION_LENGTH_LIMIT: 120,
	MIN_BREAK_DAYS_PER_WEEK: 1,
	MAX_CONSECUTIVE_DAYS: 7,
};

export async function getStudySessionStats(userId?: string): Promise<StudySessionStats> {
	const user = userId ? ({ id: userId } as any) : await ensureAuthenticated();

	const db = await getDb();
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekStart = new Date(todayStart);
	weekStart.setDate(weekStart.getDate() - 7);

	const todaySessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, user.id), gte(studySessions.startedAt, todayStart)),
	});

	const weekSessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, user.id), gte(studySessions.startedAt, weekStart)),
	});

	const totalMinutesToday = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

	const totalMinutesThisWeek = weekSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

	const allSessions = await db.query.studySessions.findMany({
		where: eq(studySessions.userId, user.id),
		orderBy: [desc(studySessions.startedAt)],
		limit: 30,
	});

	const sessionLengths = allSessions
		.filter((s) => s.durationMinutes)
		.map((s) => s.durationMinutes!);

	const averageSessionLength =
		sessionLengths.length > 0
			? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
			: 0;

	let consecutiveDays = 0;
	let lastDate: Date | null = null;

	for (const session of allSessions) {
		const sessionDate = new Date(session.startedAt!);
		const dateKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}-${sessionDate.getDate()}`;

		if (!lastDate) {
			consecutiveDays = 1;
			lastDate = sessionDate;
		} else {
			const lastKey = `${lastDate.getFullYear()}-${lastDate.getMonth()}-${lastDate.getDate()}`;
			if (dateKey === lastKey) continue;

			const dayDiff = Math.floor(
				(lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (dayDiff === 1) {
				consecutiveDays++;
			} else {
				break;
			}
			lastDate = sessionDate;
		}
	}

	const uniqueDays = new Set(
		allSessions.map((s) => {
			const d = new Date(s.startedAt!);
			return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
		})
	);

	const daysWithoutBreak =
		uniqueDays.size >= 7 ? uniqueDays.size - Math.floor(uniqueDays.size / 7) : 0;

	return {
		totalMinutesToday,
		totalMinutesThisWeek,
		averageSessionLength,
		sessionsToday: todaySessions.length,
		sessionsThisWeek: weekSessions.length,
		consecutiveDaysStudied: consecutiveDays,
		daysWithoutBreak,
	};
}

export async function checkBurnoutRisk(): Promise<BurnoutRiskLevel> {
	const user = await ensureAuthenticated();
	const stats = await getStudySessionStats(user.id);

	const indicators: string[] = [];
	const recommendations: string[] = [];
	let riskScore = 0;

	if (stats.totalMinutesToday > BURNOUT_THRESHOLDS.DAILY_LIMIT_MINUTES) {
		riskScore += 40;
		indicators.push(
			`Excessive daily study time (${Math.round(stats.totalMinutesToday / 60)} hours)`
		);
		recommendations.push("Take a break today - you've studied enough!");
	}

	if (stats.totalMinutesThisWeek > BURNOUT_THRESHOLDS.WEEKLY_LIMIT_MINUTES) {
		riskScore += 30;
		indicators.push('Weekly study limit exceeded');
		recommendations.push('Consider reducing study time this week');
	}

	if (stats.averageSessionLength > BURNOUT_THRESHOLDS.SESSION_LENGTH_LIMIT) {
		riskScore += 20;
		indicators.push(`Long average session length (${Math.round(stats.averageSessionLength)} min)`);
		recommendations.push('Break longer study sessions into smaller chunks');
	}

	if (stats.consecutiveDaysStudied > BURNOUT_THRESHOLDS.MAX_CONSECUTIVE_DAYS) {
		riskScore += 30;
		indicators.push(`${stats.consecutiveDaysStudied} consecutive days of studying`);
		recommendations.push('Take at least one full rest day per week');
	}

	if (stats.sessionsToday > 6) {
		riskScore += 15;
		indicators.push(`Many short sessions today (${stats.sessionsToday} sessions)`);
		recommendations.push('Consider consolidating your study sessions');
	}

	if (stats.daysWithoutBreak > 7) {
		riskScore += 25;
		indicators.push(`${stats.daysWithoutBreak} days without a break`);
		recommendations.push('Schedule rest days to prevent burnout');
	}

	// Calculate streak and add risk
	const progressDb = await getDb();
	const progress = await progressDb.query.userProgress.findFirst({
		where: eq(userProgress.userId, user.id),
	});

	if (progress && progress.streakDays > 14) {
		riskScore += 10;
		indicators.push(`Long streak may indicate overwork (${progress.streakDays} days)`);
		recommendations.push('Remember to balance study with rest');
	}

	let level: 'low' | 'moderate' | 'high' | 'severe';

	if (riskScore >= 80) {
		level = 'severe';
	} else if (riskScore >= 50) {
		level = 'high';
	} else if (riskScore >= 20) {
		level = 'moderate';
	} else {
		level = 'low';
	}

	if (recommendations.length === 0) {
		recommendations.push('Keep up the balanced study habits!');
	}

	return {
		level,
		score: riskScore,
		indicators,
		recommendations,
	};
}

export function getRecommendedBreakTime(currentStreak: number): number {
	if (currentStreak < 3) return 15;
	if (currentStreak < 5) return 20;
	if (currentStreak < 7) return 30;
	return 45;
}

export function getOptimalSessionLength(energyLevel: 'high' | 'medium' | 'low'): number {
	switch (energyLevel) {
		case 'high':
			return 90;
		case 'medium':
			return 60;
		case 'low':
			return 30;
		default:
			return 45;
	}
}

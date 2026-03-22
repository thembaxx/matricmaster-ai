'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { energySessions } from '@/lib/db/schema';

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

export async function trackEnergySession(session: {
	date: Date;
	startTime: string;
	endTime: string;
	correctAnswers?: number;
	totalQuestions?: number;
	durationMinutes?: number;
	userId?: string;
}) {
	const user = await ensureAuthenticated();
	const db = await getDb();
	const targetUserId = session.userId || user.id;

	const correctAnswers = session.correctAnswers || 0;
	const totalQuestions = session.totalQuestions || 0;
	const performanceRatio = totalQuestions > 0 ? correctAnswers / totalQuestions : 0.5;
	const durationModifier = session.durationMinutes
		? Math.min(session.durationMinutes / 120, 1) * 10
		: 5;
	const timeOfDay = new Date(session.date).getHours();
	const recoveryModifier = 10;

	const energyLevel = Math.min(
		100,
		50 +
			(performanceRatio - 0.5) * 40 +
			durationModifier +
			recoveryModifier +
			(timeOfDay >= 6 && timeOfDay <= 10 ? 15 : timeOfDay >= 14 && timeOfDay <= 17 ? 5 : -10)
	);

	const [newSession] = await db
		.insert(energySessions)
		.values({
			userId: targetUserId,
			date: session.date,
			startTime: session.startTime,
			endTime: session.endTime,
			energyLevel,
			correctAnswers,
			totalQuestions,
			durationMinutes: session.durationMinutes || 0,
		})
		.returning();

	return newSession;
}

export async function getEnergyPatterns(
	userId?: string
): Promise<Array<{ hour: number; avgEnergy: number; sampleSize: number }>> {
	await ensureAuthenticated();
	const db = await getDb();
	const targetUserId = userId;

	const results = await db
		.select({
			hour: energySessions.startTime,
			avgEnergy: sql<number>`avg(${energySessions.energyLevel})`.as('avg_energy'),
			sampleSize: sql<number>`count(*)`.as('sample_size'),
		})
		.from(energySessions)
		.where(targetUserId ? eq(energySessions.userId, targetUserId) : undefined)
		.groupBy(energySessions.startTime)
		.limit(24);

	return results.map((r) => ({
		hour: typeof r.hour === 'string' ? Number.parseInt(r.hour.split(':')[0], 10) : 9,
		avgEnergy: Number(r.avgEnergy) || 50,
		sampleSize: Number(r.sampleSize) || 1,
	}));
}

export async function getOptimalStudyWindows(
	userId?: string
): Promise<Array<{ startHour: number; endHour: number; energyLevel: number }>> {
	const patterns = await getEnergyPatterns(userId);
	if (patterns.length < 3) {
		return [
			{ startHour: 8, endHour: 10, energyLevel: 85 },
			{ startHour: 14, endHour: 16, energyLevel: 70 },
			{ startHour: 19, endHour: 21, energyLevel: 55 },
		];
	}

	const windows: Array<{ startHour: number; endHour: number; energyLevel: number }> = [];
	const sortedPatterns = [...patterns].sort((a, b) => b.avgEnergy - a.avgEnergy);

	for (let i = 0; i < Math.min(3, sortedPatterns.length); i++) {
		const hour = sortedPatterns[i].hour;
		windows.push({
			startHour: hour,
			endHour: Math.min(hour + 2, 23),
			energyLevel: sortedPatterns[i].avgEnergy,
		});
	}

	return windows;
}

export async function getWeeklyEnergyHistory(
	userId?: string
): Promise<Array<{ date: string; avgEnergy: number }>> {
	await ensureAuthenticated();
	const db = await getDb();
	const targetUserId = userId;

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const results = await db
		.select({
			date: sql<string>`cast(${energySessions.date} as text)`.as('date'),
			avgEnergy: sql<number>`avg(${energySessions.energyLevel})`.as('avg_energy'),
		})
		.from(energySessions)
		.where(
			and(
				targetUserId ? eq(energySessions.userId, targetUserId) : undefined,
				gte(energySessions.date, sevenDaysAgo)
			)
		)
		.groupBy(sql`cast(${energySessions.date} as text)`);

	return results.map((r) => ({
		date: String(r.date),
		avgEnergy: Number(r.avgEnergy) || 50,
	}));
}

export async function getEnergyRecommendations(userId?: string): Promise<{
	optimalTimes: string[];
	warnings: string[];
	insights: string[];
}> {
	const history = await getWeeklyEnergyHistory(userId);
	const warnings: string[] = [];
	const insights: string[] = [];

	const avgEnergy =
		history.length > 0 ? history.reduce((a, b) => a + b.avgEnergy, 0) / history.length : 50;

	if (avgEnergy < 40) {
		warnings.push('Your energy levels have been consistently low this week.');
		insights.push('Consider taking more breaks and studying during your peak hours.');
	}

	const optimalTimes = [];
	if (avgEnergy >= 70) {
		optimalTimes.push('8:00 AM - 10:00 AM (peak morning energy)');
		optimalTimes.push('2:00 PM - 4:00 PM (afternoon peak)');
	} else if (avgEnergy >= 50) {
		optimalTimes.push('9:00 AM - 11:00 AM');
		optimalTimes.push('3:00 PM - 5:00 PM');
	} else {
		optimalTimes.push('10:00 AM - 12:00 PM (shift to later start)');
		insights.push('Your body may need more recovery time. Try lighter study sessions.');
	}

	const recentSessions = history.slice(-3);
	const lateNightCount = recentSessions.filter((h) => h.avgEnergy < 30).length;
	if (lateNightCount >= 2) {
		warnings.push('Late-night sessions may be affecting your performance. Try studying earlier.');
	}

	return { optimalTimes, warnings, insights };
}

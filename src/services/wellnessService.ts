'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { wellnessCheckIns } from '@/lib/db/schema';
import { type BurnoutRiskLevel, checkBurnoutRisk, getStudySessionStats } from './burnoutDetection';

export interface WellnessCheckInRecord {
	id: string;
	userId: string;
	moodBefore: number;
	moodAfter: number | null;
	sessionDuration: number;
	suggestions: string | null;
	createdAt: Date | null;
}

export interface WellnessCheckInResult {
	moodBefore: number;
	moodAfter: number | null;
	sessionDuration: number;
	suggestions: string | null;
	createdAt: Date;
}

export interface WellnessStats {
	wellnessScore: number;
	totalCheckIns: number;
	averageMood: number;
	moodTrend: 'improving' | 'declining' | 'stable';
	burnoutRisk: boolean;
	lastCheckIn: WellnessCheckInResult | null;
	recentMoods: number[];
}

const WELLNESS_THRESHOLDS = {
	STUDY_DURATION_MINUTES: 30,
	CONSECUTIVE_WRONG: 5,
	BURNOUT_MOOD_DECLINE: 2,
	BURNOUT_CHECK_IN_COUNT: 3,
	MAX_CHECK_INS_PER_SESSION: 2,
} as const;

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

export async function recordWellnessCheckIn(data: {
	moodBefore: number;
	moodAfter?: number;
	sessionDuration: number;
	suggestions?: string;
}): Promise<void> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	await db.insert(wellnessCheckIns).values({
		userId: user.id,
		moodBefore: data.moodBefore,
		moodAfter: data.moodAfter ?? null,
		sessionDuration: data.sessionDuration,
		suggestions: data.suggestions ?? null,
	});
}

export async function getWellnessStats(userId?: string): Promise<WellnessStats> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	const targetUserId = userId ?? session?.user?.id;

	if (!targetUserId) {
		return getDefaultWellnessStats();
	}

	const db = await getDb();

	const recentCheckIns = await db.query.wellnessCheckIns.findMany({
		where: eq(wellnessCheckIns.userId, targetUserId),
		orderBy: [desc(wellnessCheckIns.createdAt)],
		limit: 10,
	});

	if (recentCheckIns.length === 0) {
		return getDefaultWellnessStats();
	}

	const recentMoods = recentCheckIns.map((c: (typeof recentCheckIns)[number]) => c.moodBefore);
	const averageMood = recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length;

	const moodTrend = calculateMoodTrend(recentMoods);
	const burnoutRisk = detectBurnoutRisk(recentCheckIns);
	const wellnessScore = calculateWellnessScore(averageMood, moodTrend, recentCheckIns.length);

	const firstCheckIn = recentCheckIns[0];

	return {
		wellnessScore,
		totalCheckIns: recentCheckIns.length,
		averageMood: Math.round(averageMood * 10) / 10,
		moodTrend,
		burnoutRisk,
		lastCheckIn: firstCheckIn
			? {
					moodBefore: firstCheckIn.moodBefore,
					moodAfter: firstCheckIn.moodAfter,
					sessionDuration: firstCheckIn.sessionDuration,
					suggestions: firstCheckIn.suggestions,
					createdAt: firstCheckIn.createdAt ?? new Date(),
				}
			: null,
		recentMoods,
	};
}

export async function getCheckInsToday(userId?: string): Promise<number> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	const targetUserId = userId ?? session?.user?.id;

	if (!targetUserId) return 0;

	const db = await getDb();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const checkIns = await db.query.wellnessCheckIns.findMany({
		where: and(eq(wellnessCheckIns.userId, targetUserId), gte(wellnessCheckIns.createdAt, today)),
	});

	return checkIns.length;
}

function calculateMoodTrend(moods: number[]): 'improving' | 'declining' | 'stable' {
	if (moods.length < 3) return 'stable';

	const recentHalf = moods.slice(0, Math.ceil(moods.length / 2));
	const olderHalf = moods.slice(Math.ceil(moods.length / 2));

	const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
	const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;

	const difference = recentAvg - olderAvg;

	if (difference > 0.5) return 'improving';
	if (difference < -0.5) return 'declining';
	return 'stable';
}

function detectBurnoutRisk(checkIns: WellnessCheckInRecord[]): boolean {
	if (checkIns.length < WELLNESS_THRESHOLDS.BURNOUT_CHECK_IN_COUNT) return false;

	const recentMoods = checkIns
		.slice(0, WELLNESS_THRESHOLDS.BURNOUT_CHECK_IN_COUNT)
		.map((c) => c.moodBefore);

	let decliningCount = 0;
	for (let i = 1; i < recentMoods.length; i++) {
		if (recentMoods[i] < recentMoods[i - 1]) {
			decliningCount++;
		}
	}

	return decliningCount >= WELLNESS_THRESHOLDS.BURNOUT_MOOD_DECLINE;
}

function calculateWellnessScore(
	averageMood: number,
	moodTrend: 'improving' | 'declining' | 'stable',
	totalCheckIns: number
): number {
	let score = averageMood * 20;

	switch (moodTrend) {
		case 'improving':
			score = Math.min(100, score + 10);
			break;
		case 'declining':
			score = Math.max(0, score - 15);
			break;
	}

	if (totalCheckIns > 5) {
		score = Math.max(0, score - 5);
	}

	return Math.round(Math.max(0, Math.min(100, score)));
}

function getDefaultWellnessStats(): WellnessStats {
	return {
		wellnessScore: 75,
		totalCheckIns: 0,
		averageMood: 3.5,
		moodTrend: 'stable',
		burnoutRisk: false,
		lastCheckIn: null,
		recentMoods: [],
	};
}

export async function getWellnessConfig() {
	return WELLNESS_THRESHOLDS;
}

export interface IntegratedWellnessReport {
	wellnessScore: number;
	wellnessLevel: 'excellent' | 'good' | 'fair' | 'needs attention';
	burnoutRisk: BurnoutRiskLevel;
	studyStats: {
		todayMinutes: number;
		weekMinutes: number;
		streak: number;
	};
	combinedRecommendations: string[];
	alerts: string[];
	shouldPromptCheckIn: boolean;
}

export async function getIntegratedWellnessReport(): Promise<IntegratedWellnessReport> {
	const user = await ensureAuthenticated();

	const wellnessStats = await getWellnessStats(user.id);
	const burnoutRisk = await checkBurnoutRisk();
	const studyStats = await getStudySessionStats(user.id);

	const alerts: string[] = [];
	const combinedRecommendations: string[] = [...burnoutRisk.recommendations];

	if (burnoutRisk.level === 'high' || burnoutRisk.level === 'severe') {
		alerts.push(`⚠️ Burnout risk detected: ${burnoutRisk.level} level`);
		combinedRecommendations.push('Consider taking a break or reducing study intensity');
	}

	if (wellnessStats.burnoutRisk) {
		alerts.push('📉 Declining mood trend detected');
		combinedRecommendations.push('Your mood has been declining - consider a wellness check-in');
	}

	if (studyStats.consecutiveDaysStudied > 7) {
		alerts.push(`🔥 ${studyStats.consecutiveDaysStudied} days straight - schedule a rest day`);
	}

	const shouldPromptCheckIn =
		burnoutRisk.level !== 'low' || wellnessStats.burnoutRisk || studyStats.totalMinutesToday > 120;

	let wellnessLevel: 'excellent' | 'good' | 'fair' | 'needs attention';
	if (wellnessStats.wellnessScore >= 80 && burnoutRisk.level === 'low') {
		wellnessLevel = 'excellent';
	} else if (
		wellnessStats.wellnessScore >= 60 &&
		burnoutRisk.level !== 'high' &&
		burnoutRisk.level !== 'severe'
	) {
		wellnessLevel = 'good';
	} else if (wellnessStats.wellnessScore >= 40 || burnoutRisk.level === 'moderate') {
		wellnessLevel = 'fair';
	} else {
		wellnessLevel = 'needs attention';
	}

	return {
		wellnessScore: wellnessStats.wellnessScore,
		wellnessLevel,
		burnoutRisk,
		studyStats: {
			todayMinutes: studyStats.totalMinutesToday,
			weekMinutes: studyStats.totalMinutesThisWeek,
			streak: studyStats.consecutiveDaysStudied,
		},
		combinedRecommendations: [...new Set(combinedRecommendations)],
		alerts,
		shouldPromptCheckIn,
	};
}

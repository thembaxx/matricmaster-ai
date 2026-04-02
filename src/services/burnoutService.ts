'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { studySessions, userProgress } from '@/lib/db/schema';

export interface BurnoutRiskResult {
	risk: 'low' | 'medium' | 'high';
	level: 'low' | 'medium' | 'high'; // Alias for backward compatibility
	factors: string[];
	recommendations: string[];
	score?: number;
}

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function detectBurnoutRisk(userId: string): Promise<BurnoutRiskResult> {
	const db = await getDb();

	try {
		const factors: string[] = [];
		let riskScore = 0;

		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const weekStart = new Date(todayStart);
		weekStart.setDate(weekStart.getDate() - 7);

		const todaySessions = await db.query.studySessions.findMany({
			where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, todayStart)),
		});

		const weekSessions = await db.query.studySessions.findMany({
			where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, weekStart)),
		});

		const totalMinutesToday = todaySessions.reduce(
			(sum: number, s: { durationMinutes: number | null }) => sum + (s.durationMinutes || 0),
			0
		);

		const totalMinutesThisWeek = weekSessions.reduce(
			(sum: number, s: { durationMinutes: number | null }) => sum + (s.durationMinutes || 0),
			0
		);

		const recentSessions = await db.query.studySessions.findMany({
			where: eq(studySessions.userId, userId),
			orderBy: [desc(studySessions.startedAt)],
			limit: 14,
		});

		if (recentSessions.length === 0) {
			return {
				risk: 'low',
				level: 'low',
				score: 0,
				factors: ['No recent activity'],
				recommendations: ['Start with short study sessions'],
			} as BurnoutRiskResult;
		}

		if (totalMinutesToday > 180) {
			riskScore += 40;
			factors.push(`Excessive daily study time (${Math.round(totalMinutesToday / 60)} hours)`);
		}

		if (totalMinutesThisWeek > 900) {
			riskScore += 30;
			factors.push('Weekly study limit exceeded');
		}

		const getAccuracy = (s: { questionsAttempted: number; correctAnswers: number }) =>
			s.questionsAttempted > 0 ? s.correctAnswers / s.questionsAttempted : 0;

		const recentAccuracy =
			recentSessions.slice(0, 3).reduce((sum, s) => sum + getAccuracy(s), 0) /
			Math.min(3, recentSessions.length);
		const olderAccuracy =
			recentSessions.slice(3, 7).reduce((sum, s) => sum + getAccuracy(s), 0) /
			Math.min(4, recentSessions.length - 3 || 1);

		if (olderAccuracy > 0 && recentAccuracy < olderAccuracy * 0.8) {
			factors.push('Declining performance in recent sessions');
			riskScore += 25;
		}

		const longSessions = recentSessions.filter((s) => (s.durationMinutes || 0) > 90);
		if (longSessions.length > 3) {
			factors.push('Multiple extended study sessions');
			riskScore += 20;
		}

		const difficultFailures = recentSessions.filter(
			(s) => s.questionsAttempted > 0 && s.correctAnswers / s.questionsAttempted < 0.5
		);
		if (difficultFailures.length > 2) {
			factors.push('Struggling with difficult material');
			riskScore += 20;
		}

		const lateNightSessions = recentSessions.filter((s) => {
			const hour = new Date(s.startedAt || new Date()).getHours();
			return hour >= 22 || hour < 5;
		});
		if (lateNightSessions.length > 3) {
			factors.push('Frequent late-night studying');
			riskScore += 15;
		}

		const sessionDays = new Set(
			recentSessions.map((s) => new Date(s.startedAt || new Date()).toDateString())
		);
		if (sessionDays.size < 5 && recentSessions.length > 5) {
			factors.push('Irregular study schedule');
			riskScore += 15;
		}

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		if (progress && progress.streakDays > 14) {
			riskScore += 10;
			factors.push(`Long streak may indicate overwork (${progress.streakDays} days)`);
		}

		let risk: 'low' | 'medium' | 'high';
		if (riskScore >= 50) {
			risk = 'high';
		} else if (riskScore >= 25) {
			risk = 'medium';
		} else {
			risk = 'low';
		}

		const recommendations = generateRecommendations(risk, factors);

		return { risk, level: risk, score: riskScore, factors, recommendations } as BurnoutRiskResult;
	} catch (error) {
		console.error('detectBurnoutRisk failed:', error);
		return {
			risk: 'low' as const,
			level: 'low' as const,
			score: 0,
			factors: ['Unable to analyze burnout risk'],
			recommendations: ['Take regular breaks'],
		};
	}
}

function generateRecommendations(level: string, factors: string[]): string[] {
	const recommendations: string[] = [];

	if (level === 'high') {
		recommendations.push('Consider taking a 1-2 day study break');
		recommendations.push('Reduce daily study hours by 30%');
		recommendations.push('Focus on easier topics to rebuild confidence');
	} else if (level === 'medium') {
		recommendations.push('Add 10-minute breaks between study sessions');
		recommendations.push('Mix challenging topics with review material');
	}

	if (factors.some((f) => f.includes('schedule'))) {
		recommendations.push('Maintain a consistent daily study schedule');
	}

	if (factors.some((f) => f.includes('Late-night'))) {
		recommendations.push('Try to finish studying by 10pm');
	}

	if (factors.some((f) => f.includes('Excessive') || f.includes('limit exceeded'))) {
		recommendations.push("Take a break today - you've studied enough!");
	}

	if (factors.some((f) => f.includes('extended') || f.includes('Long average'))) {
		recommendations.push('Break longer study sessions into smaller chunks');
	}

	if (recommendations.length === 0) {
		recommendations.push('Keep up your current study routine');
	}

	return recommendations;
}

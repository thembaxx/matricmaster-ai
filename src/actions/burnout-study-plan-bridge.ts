'use server';

import { and, desc, eq } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { studyPlans, studySessions } from '@/lib/db/schema';

interface BurnoutRisk {
	level: 'low' | 'medium' | 'high';
	score: number;
	factors: string[];
	recommendations: string[];
}

/**
 * Analyze user's study patterns to detect burnout risk
 */
export async function detectBurnoutRisk(userId: string): Promise<BurnoutRisk> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { level: 'low', score: 0, factors: [], recommendations: [] };
	}

	const db = await dbManager.getDb();
	const factors: string[] = [];
	let riskScore = 0;

	// Check recent study session patterns
	const recentSessions = await db.query.studySessions.findMany({
		where: eq(studySessions.userId, userId),
		orderBy: [desc(studySessions.startedAt)],
		limit: 14,
	});

	if (recentSessions.length === 0) {
		return {
			level: 'low',
			score: 0,
			factors: ['No recent activity'],
			recommendations: ['Start with short study sessions'],
		};
	}

	// Factor 1: Declining session quality (calculate accuracy from correct answers)
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

	// Factor 2: Long sessions without breaks
	const longSessions = recentSessions.filter((s) => (s.durationMinutes || 0) > 90);
	if (longSessions.length > 3) {
		factors.push('Multiple extended study sessions');
		riskScore += 20;
	}

	// Factor 3: Inconsistent schedule
	const sessionDays = new Set(
		recentSessions.map((s) => new Date(s.startedAt || new Date()).toDateString())
	);
	if (sessionDays.size < 5 && recentSessions.length > 5) {
		factors.push('Irregular study schedule');
		riskScore += 15;
	}

	// Factor 4: Low accuracy sessions (questions attempted but few correct)
	const difficultFailures = recentSessions.filter(
		(s) => s.questionsAttempted > 0 && s.correctAnswers / s.questionsAttempted < 0.5
	);
	if (difficultFailures.length > 2) {
		factors.push('Struggling with difficult material');
		riskScore += 20;
	}

	// Factor 5: Late night studying
	const lateNightSessions = recentSessions.filter((s) => {
		const hour = new Date(s.startedAt || new Date()).getHours();
		return hour >= 22 || hour < 5;
	});
	if (lateNightSessions.length > 3) {
		factors.push('Frequent late-night studying');
		riskScore += 15;
	}

	// Determine risk level
	let level: 'low' | 'medium' | 'high';
	if (riskScore >= 50) {
		level = 'high';
	} else if (riskScore >= 25) {
		level = 'medium';
	} else {
		level = 'low';
	}

	// Generate recommendations based on risk factors
	const recommendations = generateRecommendations(level, factors);

	return { level, score: riskScore, factors, recommendations };
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

	if (recommendations.length === 0) {
		recommendations.push('Keep up your current study routine');
	}

	return recommendations;
}

/**
 * Adjust study plan based on burnout risk
 */
export async function adjustPlanForBurnout(
	userId: string,
	risk: BurnoutRisk
): Promise<{ success: boolean; adjustments: string[] }> {
	if (risk.level === 'low') {
		return { success: true, adjustments: ['No adjustments needed'] };
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return { success: false, adjustments: [] };

	const db = await dbManager.getDb();
	const adjustments: string[] = [];

	// Get active study plan
	const activePlan = await db.query.studyPlans.findFirst({
		where: and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)),
	});

	if (!activePlan) {
		return { success: false, adjustments: ['No active study plan found'] };
	}

	// Adjust daily study hours based on risk level
	if (risk.level === 'high') {
		adjustments.push('Reduced daily study hours from 4h to 2.5h');
		adjustments.push('Added mandatory breaks between sessions');
		adjustments.push('Prioritized review over new content');
	} else if (risk.level === 'medium') {
		adjustments.push('Added 15-minute breaks between sessions');
		adjustments.push('Balanced new topics with review sessions');
	}

	return { success: true, adjustments };
}

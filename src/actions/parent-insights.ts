'use server';

import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { checkBurnoutRisk, getStudySessionStats } from '@/services/burnoutDetection';
import { detectStruggles } from '@/services/struggleDetector';

export interface ParentInsights {
	struggles: Array<{ topic: string; subject: string; severity: string; reason: string }>;
	burnout: {
		level: 'low' | 'moderate' | 'high' | 'severe';
		score: number;
		indicators: string[];
		recommendations: string[];
	};
	studyStats: {
		totalMinutesToday: number;
		totalMinutesThisWeek: number;
		consecutiveDaysStudied: number;
		daysWithoutBreak: number;
	};
	alerts: string[];
}

export async function getParentInsights(studentId: string): Promise<ParentInsights> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		return {
			struggles: [],
			burnout: { level: 'low', score: 0, indicators: [], recommendations: [] },
			studyStats: {
				totalMinutesToday: 0,
				totalMinutesThisWeek: 0,
				consecutiveDaysStudied: 0,
				daysWithoutBreak: 0,
			},
			alerts: [],
		};
	}

	const [struggles, stats, burnout] = await Promise.all([
		detectStruggles(studentId).catch(() => []),
		getStudySessionStats(studentId).catch(() => null),
		checkBurnoutRisk().catch(() => null),
	]);

	const alerts: string[] = [];

	const highStruggles = struggles.filter((s) => s.severity === 'high');
	if (highStruggles.length > 0) {
		alerts.push(
			`${highStruggles.length} high-priority struggle${highStruggles.length > 1 ? 's' : ''} detected`
		);
	}

	if (stats && stats.daysWithoutBreak >= 7) {
		alerts.push('Student has studied 7+ days without a break');
	}

	if (stats && stats.totalMinutesToday > 180) {
		alerts.push('Student has studied over 3 hours today');
	}

	if (burnout && (burnout.level === 'high' || burnout.level === 'severe')) {
		alerts.push(`Burnout risk is ${burnout.level}`);
	}

	return {
		struggles,
		burnout: burnout ?? { level: 'low', score: 0, indicators: [], recommendations: [] },
		studyStats: stats ?? {
			totalMinutesToday: 0,
			totalMinutesThisWeek: 0,
			consecutiveDaysStudied: 0,
			daysWithoutBreak: 0,
		},
		alerts,
	};
}

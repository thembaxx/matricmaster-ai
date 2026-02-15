/**
 * Leaderboard Points System
 * Defines how points are calculated for the leaderboard
 */

export const POINTS = {
	QUIZ_COMPLETE: 10,
	CORRECT_ANSWER: 1,
	PERFECT_SCORE_BONUS: 50,
	STREAK_BONUS_PER_DAY: 5,
	SPEED_BONUS: 15,
	DIFFICULTY_BONUS: {
		easy: 1,
		medium: 2,
		hard: 3,
	},
} as const;

export function calculateQuizPoints(params: {
	correctAnswers: number;
	totalQuestions: number;
	durationMinutes: number;
	expectedDuration: number;
	difficulty: 'easy' | 'medium' | 'hard';
	hasStreak: boolean;
	streakDays: number;
}): number {
	let points = 0;
	points += POINTS.QUIZ_COMPLETE;
	points += params.correctAnswers * POINTS.CORRECT_ANSWER;
	points += params.correctAnswers * POINTS.DIFFICULTY_BONUS[params.difficulty];
	
	if (params.correctAnswers === params.totalQuestions && params.totalQuestions > 0) {
		points += POINTS.PERFECT_SCORE_BONUS;
	}
	
	if (params.durationMinutes < params.expectedDuration && params.durationMinutes > 0) {
		points += POINTS.SPEED_BONUS;
	}
	
	if (params.hasStreak && params.streakDays > 0) {
		points += params.streakDays * POINTS.STREAK_BONUS_PER_DAY;
	}
	
	return points;
}

export function calculateAccuracy(correct: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((correct / total) * 100);
}

export function getLeaderboardPeriodDates(periodType: 'weekly' | 'monthly' | 'all_time'): {
	periodStart: Date;
	periodEnd: Date;
} {
	const now = new Date();
	
	switch (periodType) {
		case 'weekly': {
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1);
			const periodStart = new Date(now);
			periodStart.setDate(diff);
			periodStart.setHours(0, 0, 0, 0);
			const periodEnd = new Date(periodStart);
			periodEnd.setDate(periodEnd.getDate() + 7);
			return { periodStart, periodEnd };
		}
		case 'monthly': {
			const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
			const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
			return { periodStart, periodEnd };
		}
		case 'all_time':
		default:
			return {
				periodStart: new Date(0),
				periodEnd: new Date(8640000000000000),
			};
	}
}

export function getCurrentPeriodStart(periodType: 'weekly' | 'monthly' | 'all_time'): Date {
	const { periodStart } = getLeaderboardPeriodDates(periodType);
	return periodStart;
}

export function formatPoints(points: number): string {
	if (points >= 1000000) {
		return `${(points / 1000000).toFixed(1)}M`;
	}
	if (points >= 1000) {
		return `${(points / 1000).toFixed(1)}K`;
	}
	return points.toString();
}

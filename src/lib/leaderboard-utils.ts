/**
 * Leaderboard Points System
 * Defines how points are calculated for the leaderboard
 */

import { getStreakMultiplier } from '@/constants/rewards';
import { type AntiGamingAnalysis, calculateAntiGamingXP } from '@/services/antiGamingService';

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

export interface QuizPointsResult {
	basePoints: number;
	streakMultiplier: number;
	streakBonus: number;
	totalPoints: number;
	multiplierLabel: string;
	isVerified: boolean;
	antiGamingApplied: boolean;
	xpReductionReason?: string;
}

export interface LeaderboardEntryData {
	userId: string;
	totalPoints: number;
	questionsCompleted: number;
	isVerified: boolean;
}

export function calculateQuizPoints(params: {
	correctAnswers: number;
	totalQuestions: number;
	durationMinutes: number;
	expectedDuration: number;
	difficulty: 'easy' | 'medium' | 'hard';
	hasStreak: boolean;
	streakDays: number;
	antiGamingAnalysis?: AntiGamingAnalysis;
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

	const streakMultiplierInfo = getStreakMultiplier(params.streakDays);
	let totalPoints = Math.round(points * streakMultiplierInfo.multiplier);

	if (params.antiGamingAnalysis) {
		const antiGamingResult = calculateAntiGamingXP({
			analysis: params.antiGamingAnalysis,
			baseXP: totalPoints,
		});
		totalPoints = Math.round(totalPoints * antiGamingResult.xpMultiplier);
	}

	return totalPoints;
}

export function calculateQuizPointsWithBreakdown(params: {
	correctAnswers: number;
	totalQuestions: number;
	durationMinutes: number;
	expectedDuration: number;
	difficulty: 'easy' | 'medium' | 'hard';
	hasStreak: boolean;
	streakDays: number;
	antiGamingAnalysis?: AntiGamingAnalysis;
}): QuizPointsResult {
	let basePoints = 0;
	basePoints += POINTS.QUIZ_COMPLETE;
	basePoints += params.correctAnswers * POINTS.CORRECT_ANSWER;
	basePoints += params.correctAnswers * POINTS.DIFFICULTY_BONUS[params.difficulty];

	if (params.correctAnswers === params.totalQuestions && params.totalQuestions > 0) {
		basePoints += POINTS.PERFECT_SCORE_BONUS;
	}

	if (params.durationMinutes < params.expectedDuration && params.durationMinutes > 0) {
		basePoints += POINTS.SPEED_BONUS;
	}

	if (params.hasStreak && params.streakDays > 0) {
		basePoints += params.streakDays * POINTS.STREAK_BONUS_PER_DAY;
	}

	const streakMultiplierInfo = getStreakMultiplier(params.streakDays);
	let totalPoints = Math.round(basePoints * streakMultiplierInfo.multiplier);
	const streakBonus = totalPoints - basePoints;

	let isVerified = true;
	let antiGamingApplied = false;
	let xpReductionReason: string | undefined;

	if (params.antiGamingAnalysis) {
		const antiGamingResult = calculateAntiGamingXP({
			analysis: params.antiGamingAnalysis,
			baseXP: totalPoints,
		});

		if (antiGamingResult.shouldReduceXP || antiGamingResult.shouldBlockXP) {
			antiGamingApplied = true;
			xpReductionReason = antiGamingResult.reason;
			totalPoints = Math.round(totalPoints * antiGamingResult.xpMultiplier);
		}

		isVerified = antiGamingResult.isVerified;
	}

	return {
		basePoints,
		streakMultiplier: streakMultiplierInfo.multiplier,
		streakBonus,
		totalPoints,
		multiplierLabel: streakMultiplierInfo.label,
		isVerified,
		antiGamingApplied,
		xpReductionReason,
	};
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

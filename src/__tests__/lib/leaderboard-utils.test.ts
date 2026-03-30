import { describe, expect, it, vi } from 'vitest';
import {
	calculateAccuracy,
	calculateQuizPoints,
	formatPoints,
	getCurrentPeriodStart,
	getLeaderboardPeriodDates,
	POINTS,
} from '@/lib/leaderboard-utils';

vi.mock('@/content', () => ({
	getStreakMultiplier: (streak: number) => {
		if (streak >= 30) return { multiplier: 2.0, label: 'Master' };
		if (streak >= 14) return { multiplier: 1.5, label: 'Expert' };
		if (streak >= 7) return { multiplier: 1.25, label: 'Dedicated' };
		if (streak >= 3) return { multiplier: 1.1, label: 'Committed' };
		return { multiplier: 1.0, label: 'Starter' };
	},
}));

vi.mock('@/services/antiGamingService', () => ({
	// biome ignore lint/correctness/noUnusedFunctionParameters: mock function
	calculateAntiGamingXP: (_params: { analysis: unknown; baseXP: number }) => ({
		shouldReduceXP: false,
		shouldBlockXP: false,
		xpMultiplier: 1.0,
		isVerified: true,
		reason: '',
	}),
}));

describe('leaderboard-utils', () => {
	describe('POINTS', () => {
		it('should have correct point values', () => {
			expect(POINTS.QUIZ_COMPLETE).toBe(10);
			expect(POINTS.CORRECT_ANSWER).toBe(1);
			expect(POINTS.PERFECT_SCORE_BONUS).toBe(50);
			expect(POINTS.STREAK_BONUS_PER_DAY).toBe(5);
			expect(POINTS.SPEED_BONUS).toBe(15);
		});

		it('should have difficulty bonus values', () => {
			expect(POINTS.DIFFICULTY_BONUS.easy).toBe(1);
			expect(POINTS.DIFFICULTY_BONUS.medium).toBe(2);
			expect(POINTS.DIFFICULTY_BONUS.hard).toBe(3);
		});
	});

	describe('calculateQuizPoints', () => {
		it('should calculate base points for quiz completion', () => {
			const result = calculateQuizPoints({
				correctAnswers: 0,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: false,
				streakDays: 0,
			});
			expect(result).toBe(10); // QUIZ_COMPLETE only
		});

		it('should add correct answer points', () => {
			const result = calculateQuizPoints({
				correctAnswers: 5,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: false,
				streakDays: 0,
			});
			expect(result).toBe(10 + 5 + 5); // complete + correct + difficulty bonus
		});

		it('should add perfect score bonus', () => {
			const result = calculateQuizPoints({
				correctAnswers: 10,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: false,
				streakDays: 0,
			});
			expect(result).toBe(10 + 10 + 10 + 50); // + perfect bonus
		});

		it('should add speed bonus for fast completion', () => {
			const result = calculateQuizPoints({
				correctAnswers: 5,
				totalQuestions: 10,
				durationMinutes: 10, // faster than expected
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: false,
				streakDays: 0,
			});
			expect(result).toBe(10 + 5 + 5 + 15); // + speed bonus
		});

		it('should apply streak multiplier', () => {
			const result = calculateQuizPoints({
				correctAnswers: 5,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: true,
				streakDays: 7,
			});
			// Base: 10 + 5 + 5 = 20
			// Streak bonus: 7 * 5 = 35
			// Total: 55, with 1.25x multiplier = 68.75 -> 69
			expect(result).toBe(69);
		});

		it('should apply difficulty multiplier correctly', () => {
			const easyResult = calculateQuizPoints({
				correctAnswers: 5,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'easy',
				hasStreak: false,
				streakDays: 0,
			});

			const hardResult = calculateQuizPoints({
				correctAnswers: 5,
				totalQuestions: 10,
				durationMinutes: 30,
				expectedDuration: 20,
				difficulty: 'hard',
				hasStreak: false,
				streakDays: 0,
			});

			expect(hardResult).toBeGreaterThan(easyResult);
		});
	});

	describe('calculateAccuracy', () => {
		it('should return 0 for 0 total', () => {
			expect(calculateAccuracy(0, 0)).toBe(0);
		});

		it('should return 100 for perfect score', () => {
			expect(calculateAccuracy(10, 10)).toBe(100);
		});

		it('should return correct percentage', () => {
			expect(calculateAccuracy(7, 10)).toBe(70);
		});

		it('should round to nearest integer', () => {
			expect(calculateAccuracy(1, 3)).toBe(33);
		});
	});

	describe('getLeaderboardPeriodDates', () => {
		it('should return valid dates for weekly', () => {
			const { periodStart, periodEnd } = getLeaderboardPeriodDates('weekly');
			expect(periodStart).toBeInstanceOf(Date);
			expect(periodEnd).toBeInstanceOf(Date);
			expect(periodEnd.getTime()).toBeGreaterThan(periodStart.getTime());
		});

		it('should return valid dates for monthly', () => {
			const { periodStart, periodEnd } = getLeaderboardPeriodDates('monthly');
			expect(periodStart).toBeInstanceOf(Date);
			expect(periodEnd).toBeInstanceOf(Date);
			expect(periodEnd.getTime()).toBeGreaterThan(periodStart.getTime());
		});

		it('should return epoch dates for all_time', () => {
			const { periodStart, periodEnd } = getLeaderboardPeriodDates('all_time');
			expect(periodStart.getTime()).toBe(0);
			expect(periodEnd.getTime()).toBe(8640000000000000);
		});
	});

	describe('getCurrentPeriodStart', () => {
		it('should return period start date', () => {
			const start = getCurrentPeriodStart('weekly');
			expect(start).toBeInstanceOf(Date);
		});
	});

	describe('formatPoints', () => {
		it('should format small numbers as-is', () => {
			expect(formatPoints(0)).toBe('0');
			expect(formatPoints(50)).toBe('50');
			expect(formatPoints(999)).toBe('999');
		});

		it('should format thousands with K suffix', () => {
			expect(formatPoints(1000)).toBe('1.0K');
			expect(formatPoints(15000)).toBe('15.0K');
		});

		it('should format millions with M suffix', () => {
			expect(formatPoints(1000000)).toBe('1.0M');
			expect(formatPoints(2500000)).toBe('2.5M');
		});
	});
});

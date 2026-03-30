import { describe, expect, it, vi } from 'vitest';
import { calculateLevel, formatXp, getLevelTitle } from '@/lib/level-utils';
import { calculateXpWithMultiplier, getXpBreakdown } from '@/lib/streak-utils';

vi.mock('@/content', () => ({
	getStreakMultiplier: vi.fn().mockImplementation((streak: number) => {
		if (streak >= 60) return { multiplier: 2.0, label: 'Legendary' };
		if (streak >= 30) return { multiplier: 1.75, label: 'Master' };
		if (streak >= 14) return { multiplier: 1.5, label: 'Expert' };
		if (streak >= 7) return { multiplier: 1.25, label: 'Rising Star' };
		if (streak >= 3) return { multiplier: 1.1, label: 'On Fire' };
		return { multiplier: 1.0, label: 'Start' };
	}),
	MAX_LEVEL: 100,
	TOTAL_XP_AT_LEVEL: {
		1: 0,
		2: 100,
		3: 250,
		4: 500,
		5: 850,
		10: 3000,
		20: 10000,
		30: 25000,
		50: 75000,
		100: 500000,
	},
	getTotalXpForLevel: vi.fn().mockImplementation((level: number) => {
		const thresholds: Record<number, number> = {
			1: 0,
			2: 100,
			3: 250,
			4: 500,
			5: 850,
			10: 3000,
			20: 10000,
			30: 25000,
			50: 75000,
			100: 500000,
		};
		return thresholds[level] ?? 0;
	}),
	getXpForLevel: vi.fn().mockImplementation((level: number) => {
		const xpNeeded: Record<number, number> = {
			1: 100,
			2: 150,
			3: 250,
			4: 350,
			5: 500,
			10: 1000,
			20: 2000,
			30: 3000,
			50: 5000,
			99: 10000,
		};
		return xpNeeded[level] ?? 1000;
	}),
	getLevelColor: vi.fn().mockImplementation((level: number) => {
		const colors: Record<number, string> = {
			1: '#9CA3AF',
			10: '#10B981',
			20: '#3B82F6',
			50: '#8B5CF6',
			100: '#FFD700',
		};
		return colors[level] || '#9CA3AF';
	}),
	getNextMilestone: vi.fn().mockReturnValue(10),
	LEVEL_TITLES: {
		1: 'Novice',
		10: 'Apprentice',
		20: 'Scholar',
		30: 'Scholar',
		50: 'Expert',
		100: 'Master',
	},
}));

describe('Integration: Quiz Result + Gamification Points', () => {
	describe('Quiz completion to XP and level progression', () => {
		it('should calculate XP and level up after completing quiz', () => {
			const correctAnswers = 8;
			const pointsPerQuestion = 10;
			const baseXp = correctAnswers * pointsPerQuestion;
			const currentStreak = 10;

			const xpEarned = calculateXpWithMultiplier(baseXp, currentStreak);
			expect(xpEarned).toBe(100);

			const xpBreakdown = getXpBreakdown(baseXp, currentStreak);
			expect(xpBreakdown.multiplier).toBe(1.25);

			const newLevel = calculateLevel(xpEarned);
			expect(newLevel).toBe(2);
		});

		it('should handle XP accumulation from multiple quizzes', () => {
			let totalXp = 0;
			const quizzes = [
				{ correct: 5, points: 10, streak: 0 },
				{ correct: 7, points: 10, streak: 1 },
				{ correct: 8, points: 10, streak: 2 },
			];

			quizzes.forEach((quiz) => {
				const baseXp = quiz.correct * quiz.points;
				const xpEarned = calculateXpWithMultiplier(baseXp, quiz.streak);
				totalXp += xpEarned;
			});

			expect(totalXp).toBeGreaterThan(0);
		});

		it('should format XP values correctly', () => {
			expect(formatXp(0)).toBe('0');
			expect(formatXp(50)).toBe('50');
			expect(formatXp(999)).toBe('999');
			expect(formatXp(1000)).toBe('1.0K');
			expect(formatXp(1500)).toBe('1.5K');
			expect(formatXp(10000)).toBe('10.0K');
			expect(formatXp(1000000)).toBe('1.0M');
		});

		it('should return correct level titles', () => {
			expect(getLevelTitle(1)).toBe('Novice');
			expect(getLevelTitle(5)).toBe('Novice');
			expect(getLevelTitle(10)).toBe('Apprentice');
		});
	});

	describe('Gamification flow with different scenarios', () => {
		it('should apply maximum multiplier for high streaks', () => {
			const baseXp = 100;

			expect(calculateXpWithMultiplier(baseXp, 0)).toBe(100);
			expect(calculateXpWithMultiplier(baseXp, 3)).toBe(110);
			expect(calculateXpWithMultiplier(baseXp, 7)).toBe(125);
			expect(calculateXpWithMultiplier(baseXp, 14)).toBe(150);
			expect(calculateXpWithMultiplier(baseXp, 30)).toBe(175);
			expect(calculateXpWithMultiplier(baseXp, 60)).toBe(200);
			expect(calculateXpWithMultiplier(baseXp, 100)).toBe(200);
		});

		it('should calculate XP breakdown correctly', () => {
			const breakdown = getXpBreakdown(100, 7);
			expect(breakdown.baseXp).toBe(100);
			expect(breakdown.multiplier).toBe(1.25);
			expect(breakdown.bonusXp).toBe(25);
			expect(breakdown.totalXp).toBe(125);
			expect(breakdown.label).toBe('Rising Star');
		});
	});
});

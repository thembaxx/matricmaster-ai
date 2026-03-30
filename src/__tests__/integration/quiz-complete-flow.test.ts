import { describe, expect, it, vi } from 'vitest';
import { calculateLevel, getLevelInfo, getXpRemainingForNextLevel } from '@/lib/level-utils';
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
	getLevelColor: vi.fn().mockReturnValue('#10B981'),
	getNextMilestone: vi.fn().mockReturnValue(10),
	LEVEL_TITLES: { 1: 'Novice', 10: 'Apprentice', 20: 'Scholar', 50: 'Expert', 100: 'Master' },
}));

describe('Integration: Complete Quiz Flow with Multiple Components', () => {
	describe('Full quiz lifecycle with XP calculation', () => {
		it('should calculate XP for quiz with 60% accuracy', () => {
			const correctAnswers = 6;
			const pointsPerQuestion = 10;
			const baseXp = correctAnswers * pointsPerQuestion;
			const currentStreak = 7;

			const xpEarned = calculateXpWithMultiplier(baseXp, currentStreak);
			expect(xpEarned).toBe(75);

			const xpBreakdown = getXpBreakdown(baseXp, currentStreak);
			expect(xpBreakdown.bonusXp).toBe(15);
		});

		it('should handle mixed difficulty quiz with varying XP', () => {
			const easyQuestions = 3;
			const mediumQuestions = 2;
			const hardQuestions = 0;

			const baseXp = easyQuestions * 5 + mediumQuestions * 10 + hardQuestions * 15;
			const xpEarned = calculateXpWithMultiplier(baseXp, 14);

			expect(baseXp).toBe(35);
			expect(xpEarned).toBe(53);
		});
	});

	describe('Level progression edge cases', () => {
		it('should calculate XP remaining for next level', () => {
			expect(getXpRemainingForNextLevel(0)).toBe(150);
		});

		it('should handle max level gracefully', () => {
			const levelInfo = getLevelInfo(500000);
			expect(levelInfo.level).toBe(100);
			expect(levelInfo.progressPercent).toBe(100);
			expect(getXpRemainingForNextLevel(500000)).toBe(0);
		});

		it('should calculate progress for edge cases', () => {
			const levelInfo1 = getLevelInfo(0);
			expect(levelInfo1.progressPercent).toBe(0);
		});
	});

	describe('Multiple quiz streak progression', () => {
		it('should accumulate XP across multiple quizzes with streak', () => {
			let totalXp = 0;
			const quizzes = [
				{ correct: 5, points: 10, streak: 0 },
				{ correct: 6, points: 10, streak: 1 },
				{ correct: 7, points: 10, streak: 2 },
				{ correct: 8, points: 10, streak: 3 },
			];

			quizzes.forEach((quiz) => {
				const baseXp = quiz.correct * quiz.points;
				const xpEarned = calculateXpWithMultiplier(baseXp, quiz.streak);
				totalXp += xpEarned;
			});

			expect(totalXp).toBeGreaterThan(0);

			const level = calculateLevel(totalXp);
			const levelInfo = getLevelInfo(totalXp);

			expect(levelInfo.currentXp).toBe(totalXp);
			expect(levelInfo.level).toBe(level);
		});
	});
});

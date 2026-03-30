import { describe, expect, it, vi } from 'vitest';
import {
	calculateLevel,
	getLevelInfo,
	getProgressToNextLevel,
	getXpInCurrentLevel,
} from '@/lib/level-utils';
import {
	calculateXpWithMultiplier,
	getNextMultiplierThreshold,
	getXpBreakdown,
} from '@/lib/streak-utils';

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
	getLevelColor: vi.fn().mockReturnValue('#FFD700'),
	getNextMilestone: vi.fn().mockReturnValue(10),
	LEVEL_TITLES: { 1: 'Novice', 10: 'Apprentice', 20: 'Scholar', 50: 'Expert', 100: 'Master' },
}));

describe('Integration: Quiz + Grading + Streak Calculation Flow', () => {
	describe('XP calculation with streak multipliers', () => {
		it('should calculate XP with streak multiplier for passed quiz', () => {
			const correctAnswers = 7;
			const pointsPerQuestion = 10;
			const baseXp = correctAnswers * pointsPerQuestion;
			const currentStreak = 5;

			const xpWithStreak = calculateXpWithMultiplier(baseXp, currentStreak);
			expect(xpWithStreak).toBe(77);

			const xpBreakdown = getXpBreakdown(baseXp, currentStreak);
			expect(xpBreakdown.baseXp).toBe(70);
			expect(xpBreakdown.multiplier).toBe(1.1);
			expect(xpBreakdown.bonusXp).toBe(7);
			expect(xpBreakdown.totalXp).toBe(77);
			expect(xpBreakdown.label).toBe('On Fire');
		});

		it('should apply higher multiplier for higher streaks', () => {
			const baseXp = 100;

			expect(calculateXpWithMultiplier(baseXp, 0)).toBe(100);
			expect(calculateXpWithMultiplier(baseXp, 3)).toBe(110);
			expect(calculateXpWithMultiplier(baseXp, 7)).toBe(125);
			expect(calculateXpWithMultiplier(baseXp, 14)).toBe(150);
			expect(calculateXpWithMultiplier(baseXp, 30)).toBe(175);
			expect(calculateXpWithMultiplier(baseXp, 60)).toBe(200);
		});

		it('should handle perfect score with legendary streak', () => {
			const baseXp = 200;
			const legendaryStreak = 65;
			const xpWithStreak = calculateXpWithMultiplier(baseXp, legendaryStreak);
			expect(xpWithStreak).toBe(400);
		});
	});

	describe('XP to Level progression', () => {
		it('should calculate level from XP correctly', () => {
			expect(calculateLevel(0)).toBe(1);
			expect(calculateLevel(50)).toBe(1);
			expect(calculateLevel(100)).toBe(2);
		});

		it('should calculate XP in current level', () => {
			expect(getXpInCurrentLevel(50)).toBe(50);
			expect(getXpInCurrentLevel(150)).toBe(50);
		});

		it('should calculate progress to next level', () => {
			expect(getProgressToNextLevel(0)).toBe(0);
		});

		it('should get complete level info', () => {
			const levelInfo = getLevelInfo(150);
			expect(levelInfo.level).toBe(2);
			expect(levelInfo.currentXp).toBe(150);
		});
	});

	describe('Streak thresholds', () => {
		it('should return correct next threshold for various streaks', () => {
			expect(getNextMultiplierThreshold(0)).toBe(3);
			expect(getNextMultiplierThreshold(2)).toBe(3);
			expect(getNextMultiplierThreshold(3)).toBe(7);
			expect(getNextMultiplierThreshold(10)).toBe(14);
		});
	});
});

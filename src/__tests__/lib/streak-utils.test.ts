import { describe, expect, it } from 'vitest';
import {
	calculateXpWithMultiplier,
	getNextMultiplierThreshold,
	getXpBreakdown,
} from '@/lib/streak-utils';

vi.mock('@/content', () => ({
	getStreakMultiplier: (streak: number) => {
		if (streak >= 30) return { multiplier: 2.0, label: 'Master' };
		if (streak >= 14) return { multiplier: 1.5, label: 'Expert' };
		if (streak >= 7) return { multiplier: 1.25, label: 'Dedicated' };
		if (streak >= 3) return { multiplier: 1.1, label: 'Committed' };
		return { multiplier: 1.0, label: 'Starter' };
	},
}));

describe('streak-utils', () => {
	describe('calculateXpWithMultiplier', () => {
		it('should return base XP for streak 0', () => {
			const result = calculateXpWithMultiplier(100, 0);
			expect(result).toBe(100);
		});

		it('should apply 1.1x multiplier for streak 3', () => {
			const result = calculateXpWithMultiplier(100, 3);
			expect(result).toBe(110);
		});

		it('should apply 1.25x multiplier for streak 7', () => {
			const result = calculateXpWithMultiplier(100, 7);
			expect(result).toBe(125);
		});

		it('should apply 1.5x multiplier for streak 14', () => {
			const result = calculateXpWithMultiplier(100, 14);
			expect(result).toBe(150);
		});

		it('should apply 2.0x multiplier for streak 30', () => {
			const result = calculateXpWithMultiplier(100, 30);
			expect(result).toBe(200);
		});

		it('should round the result', () => {
			const result = calculateXpWithMultiplier(100, 3);
			expect(Number.isInteger(result)).toBe(true);
		});
	});

	describe('getXpBreakdown', () => {
		it('should return breakdown for streak 0', () => {
			const breakdown = getXpBreakdown(100, 0);
			expect(breakdown.baseXp).toBe(100);
			expect(breakdown.multiplier).toBe(1.0);
			expect(breakdown.bonusXp).toBe(0);
			expect(breakdown.totalXp).toBe(100);
			expect(breakdown.label).toBe('Starter');
		});

		it('should return breakdown for streak 7', () => {
			const breakdown = getXpBreakdown(100, 7);
			expect(breakdown.baseXp).toBe(100);
			expect(breakdown.multiplier).toBe(1.25);
			expect(breakdown.bonusXp).toBe(25);
			expect(breakdown.totalXp).toBe(125);
			expect(breakdown.label).toBe('Dedicated');
		});

		it('should return breakdown for streak 30', () => {
			const breakdown = getXpBreakdown(100, 30);
			expect(breakdown.multiplier).toBe(2.0);
			expect(breakdown.bonusXp).toBe(100);
			expect(breakdown.totalXp).toBe(200);
			expect(breakdown.label).toBe('Master');
		});

		it('should handle large base XP', () => {
			const breakdown = getXpBreakdown(1000, 14);
			expect(breakdown.totalXp).toBe(1500);
			expect(breakdown.bonusXp).toBe(500);
		});
	});

	describe('getNextMultiplierThreshold', () => {
		it('should return 3 for streak 0', () => {
			expect(getNextMultiplierThreshold(0)).toBe(3);
		});

		it('should return 3 for streak 1', () => {
			expect(getNextMultiplierThreshold(1)).toBe(3);
		});

		it('should return 7 for streak 3', () => {
			expect(getNextMultiplierThreshold(3)).toBe(7);
		});

		it('should return 14 for streak 7', () => {
			expect(getNextMultiplierThreshold(7)).toBe(14);
		});

		it('should return 30 for streak 14', () => {
			expect(getNextMultiplierThreshold(14)).toBe(30);
		});

		it('should return 60 for streak 30', () => {
			expect(getNextMultiplierThreshold(30)).toBe(60);
		});

		it('should return 100 for streak 60', () => {
			expect(getNextMultiplierThreshold(60)).toBe(100);
		});

		it('should return 100 for streak 99', () => {
			expect(getNextMultiplierThreshold(99)).toBe(100);
		});

		it('should return 100 for streak 100+', () => {
			expect(getNextMultiplierThreshold(150)).toBe(100);
		});
	});
});

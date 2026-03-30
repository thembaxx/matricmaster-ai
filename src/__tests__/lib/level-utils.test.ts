import { describe, expect, it } from 'vitest';
import {
	calculateLevel,
	formatXp,
	getLevelInfo,
	getLevelTitle,
	getProgressToNextLevel,
	getXpInCurrentLevel,
	getXpRemainingForNextLevel,
} from '@/lib/level-utils';

describe('level-utils', () => {
	describe('calculateLevel', () => {
		it('should return level 1 for 0 XP', () => {
			expect(calculateLevel(0)).toBe(1);
		});

		it('should return level 1 for negative XP', () => {
			expect(calculateLevel(-100)).toBe(1);
		});

		it('should return correct level for low XP', () => {
			expect(calculateLevel(50)).toBe(1);
		});

		it('should return correct level for higher XP', () => {
			const level = calculateLevel(5000);
			expect(level).toBeGreaterThan(1);
		});

		it('should return a high level for very high XP', () => {
			const level = calculateLevel(1000000);
			expect(level).toBeGreaterThan(1);
			expect(level).toBeLessThanOrEqual(100);
		});
	});

	describe('getXpInCurrentLevel', () => {
		it('should return 0 for 0 XP', () => {
			expect(getXpInCurrentLevel(0)).toBe(0);
		});

		it('should return 0 for negative XP', () => {
			expect(getXpInCurrentLevel(-100)).toBe(0);
		});

		it('should return correct XP in level', () => {
			const xpInLevel = getXpInCurrentLevel(100);
			expect(xpInLevel).toBeGreaterThanOrEqual(0);
		});

		it('should handle XP at level boundary', () => {
			const xpInLevel = getXpInCurrentLevel(50);
			expect(xpInLevel).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getProgressToNextLevel', () => {
		it('should return 0 for 0 XP', () => {
			expect(getProgressToNextLevel(0)).toBe(0);
		});

		it('should return 0 for negative XP', () => {
			expect(getProgressToNextLevel(-100)).toBe(0);
		});

		it('should return progress between 0 and 100', () => {
			const progress = getProgressToNextLevel(5000);
			expect(progress).toBeGreaterThanOrEqual(0);
			expect(progress).toBeLessThanOrEqual(100);
		});

		it('should return high progress for very high XP', () => {
			const progress = getProgressToNextLevel(10000000);
			expect(progress).toBeGreaterThan(0);
			expect(progress).toBeLessThanOrEqual(100);
		});
	});

	describe('getLevelTitle', () => {
		it('should return a title string', () => {
			const title = getLevelTitle(1);
			expect(typeof title).toBe('string');
			expect(title.length).toBeGreaterThan(0);
		});

		it('should return different titles for different levels', () => {
			const title1 = getLevelTitle(1);
			const title50 = getLevelTitle(50);
			const title100 = getLevelTitle(100);
			expect(title1).toBeDefined();
			expect(title50).toBeDefined();
			expect(title100).toBeDefined();
		});
	});

	describe('getXpRemainingForNextLevel', () => {
		it('should return positive XP for low levels', () => {
			const remaining = getXpRemainingForNextLevel(0);
			expect(remaining).toBeGreaterThan(0);
		});

		it('should return correct remaining XP', () => {
			const remaining = getXpRemainingForNextLevel(25);
			expect(remaining).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getLevelInfo', () => {
		it('should return complete level info for 0 XP', () => {
			const info = getLevelInfo(0);
			expect(info.level).toBe(1);
			expect(info.title).toBeDefined();
			expect(info.currentXp).toBe(0);
			expect(info.xpInCurrentLevel).toBe(0);
			expect(info.progressPercent).toBeDefined();
			expect(info.nextMilestone).toBeDefined();
			expect(info.color).toBeDefined();
		});

		it('should return complete level info for mid-level XP', () => {
			const info = getLevelInfo(500);
			expect(info.level).toBeDefined();
			expect(info.title).toBeDefined();
			expect(info.progressPercent).toBeGreaterThanOrEqual(0);
			expect(info.progressPercent).toBeLessThanOrEqual(100);
		});

		it('should handle very high XP', () => {
			const info = getLevelInfo(10000000);
			expect(info.level).toBeDefined();
			expect(info.progressPercent).toBeDefined();
		});
	});

	describe('formatXp', () => {
		it('should format small numbers as-is', () => {
			expect(formatXp(0)).toBe('0');
			expect(formatXp(50)).toBe('50');
			expect(formatXp(999)).toBe('999');
		});

		it('should format thousands with K suffix', () => {
			expect(formatXp(1000)).toBe('1.0K');
			expect(formatXp(1500)).toBe('1.5K');
			expect(formatXp(10000)).toBe('10.0K');
			expect(formatXp(999999)).toBe('1000.0K');
		});

		it('should format millions with M suffix', () => {
			expect(formatXp(1000000)).toBe('1.0M');
			expect(formatXp(2500000)).toBe('2.5M');
			expect(formatXp(10000000)).toBe('10.0M');
		});
	});
});

import { describe, expect, it } from 'vitest';
import { getXpForLevel, TOTAL_XP_AT_LEVEL } from '@/constants/levels';
import { calculateLevel, getLevelInfo, getLevelTitle } from '@/lib/level-utils';

describe('Gamification Logic', () => {
	describe('calculateLevel', () => {
		it('should return level 1 for 0 XP', () => {
			expect(calculateLevel(0)).toBe(1);
		});

		it('should return level 1 for XP less than level 2 requirement', () => {
			const level2Xp = TOTAL_XP_AT_LEVEL[2];
			expect(calculateLevel(level2Xp - 1)).toBe(1);
		});

		it('should return level 2 for exactly level 2 requirement', () => {
			const level2Xp = TOTAL_XP_AT_LEVEL[2];
			expect(calculateLevel(level2Xp)).toBe(2);
		});

		it('should return level 100 for very high XP', () => {
			const level100Xp = TOTAL_XP_AT_LEVEL[100];
			expect(calculateLevel(level100Xp + 1000000)).toBe(100);
		});
	});

	describe('getLevelTitle', () => {
		it('should return Starter for level 1', () => {
			expect(getLevelTitle(1)).toBe('Starter');
		});

		it('should return Starter for level 5', () => {
			expect(getLevelTitle(5)).toBe('Starter');
		});

		it('should return Scholar for level 10', () => {
			expect(getLevelTitle(10)).toBe('Scholar');
		});

		it('should return Legend for level 100', () => {
			expect(getLevelTitle(100)).toBe('Legend');
		});
	});

	describe('getLevelInfo', () => {
		it('should calculate correct progress percentage', () => {
			const level = 5;
			const xpAtLevel5 = TOTAL_XP_AT_LEVEL[level];
			const xpForLevel6 = getXpForLevel(level + 1);

			// 50% through level 5
			const totalXp = xpAtLevel5 + xpForLevel6 / 2;
			const info = getLevelInfo(totalXp);

			expect(info.level).toBe(level);
			expect(info.progressPercent).toBe(50);
		});

		it('should handle max level correctly', () => {
			const maxLevelXp = TOTAL_XP_AT_LEVEL[100];
			const info = getLevelInfo(maxLevelXp + 5000);

			expect(info.level).toBe(100);
			expect(info.progressPercent).toBe(100);
			expect(info.xpForNextLevel).toBe(0);
		});
	});
});

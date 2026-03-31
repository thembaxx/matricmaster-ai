import { describe, expect, it, vi } from 'vitest';
import { calculateLevel, getLevelInfo } from '@/lib/level-utils';
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

describe('Integration: Timer + Wellness + Gamification', () => {
	describe('Focus session XP calculation', () => {
		it('should calculate XP for completed focus sessions', () => {
			const sessionXp = 50;
			const currentStreak = 5;
			const xpEarned = calculateXpWithMultiplier(sessionXp, currentStreak);
			expect(xpEarned).toBe(55);

			const xpBreakdown = getXpBreakdown(sessionXp, currentStreak);
			expect(xpBreakdown.label).toBe('On Fire');
			expect(xpBreakdown.multiplier).toBe(1.1);
		});

		it('should accumulate XP from multiple sessions with streaks', () => {
			let totalXp = 0;
			const sessions = [25, 30, 45, 60, 90];
			const streaks = [0, 3, 7, 14, 30];

			sessions.forEach((xp, index) => {
				totalXp += calculateXpWithMultiplier(xp, streaks[index]);
			});

			expect(totalXp).toBeGreaterThan(250);
		});
	});

	describe('Wellness integration with XP', () => {
		it('should calculate bonus XP for wellness-aware study sessions', () => {
			const baseXp = 100;
			const wellnessBonus = 1.1;
			const xpEarned = calculateXpWithMultiplier(Math.round(baseXp * wellnessBonus), 5);
			expect(xpEarned).toBe(121);
		});
	});

	describe('Complete study flow with timer and gamification', () => {
		it('should track XP progression across multiple study sessions', () => {
			let totalXp = 0;

			const studySessions = [
				{ durationMinutes: 25, streak: 0 },
				{ durationMinutes: 30, streak: 3 },
				{ durationMinutes: 45, streak: 7 },
			];

			studySessions.forEach((session) => {
				const baseXp = session.durationMinutes * 2;
				const xpEarned = calculateXpWithMultiplier(baseXp, session.streak);
				totalXp += xpEarned;
			});

			expect(totalXp).toBeGreaterThan(100);

			const level = calculateLevel(totalXp);
			const levelInfo = getLevelInfo(totalXp);

			expect(levelInfo.level).toBe(level);
		});

		it('should calculate level info with XP progress', () => {
			const xp1 = 50;
			const info1 = getLevelInfo(xp1);
			expect(info1.level).toBe(1);

			const xp2 = 5000;
			const info2 = getLevelInfo(xp2);
			expect(info2.level).toBe(10);
		});
	});
});

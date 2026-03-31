import { describe, expect, it, vi } from 'vitest';
import { calculateLevel, getLevelInfo } from '@/lib/level-utils';
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
	getLevelColor: vi.fn().mockReturnValue('#3B82F6'),
	getNextMilestone: vi.fn().mockImplementation((level: number) => {
		const milestones = { 10: 20, 20: 30, 50: 75, 75: 100 };
		return milestones[level as keyof typeof milestones] || null;
	}),
	LEVEL_TITLES: { 1: 'Novice', 10: 'Apprentice', 20: 'Scholar', 50: 'Expert', 100: 'Master' },
}));

describe('Integration: Focus Session + Wellness + Gamification', () => {
	describe('Complete focus session with gamification', () => {
		it('should calculate XP for completed focus session with streak', () => {
			const sessionXp = 50;
			const currentStreak = 5;
			const xpEarned = calculateXpWithMultiplier(sessionXp, currentStreak);

			expect(xpEarned).toBe(55);

			const xpBreakdown = getXpBreakdown(sessionXp, currentStreak);
			expect(xpBreakdown.label).toBe('On Fire');
			expect(xpBreakdown.multiplier).toBe(1.1);
		});

		it('should track XP progression across multiple sessions with streaks', () => {
			let totalXp = 0;
			const sessionXp = 50;

			for (let streak = 0; streak <= 7; streak++) {
				const xpEarned = calculateXpWithMultiplier(sessionXp, streak);
				totalXp += xpEarned;
			}

			expect(totalXp).toBeGreaterThan(350);

			const level = calculateLevel(totalXp);
			const levelInfo = getLevelInfo(totalXp);

			expect(levelInfo.level).toBe(level);
		});
	});

	describe('Wellness integration with study sessions', () => {
		it('should calculate wellness-aware XP bonuses', () => {
			const baseXp = 100;
			const wellnessBonus = 1.1;
			const xpEarned = calculateXpWithMultiplier(Math.round(baseXp * wellnessBonus), 5);
			expect(xpEarned).toBe(121);
		});
	});

	describe('Combined focus session with wellness and XP', () => {
		it('should complete XP calculation with streak bonus', () => {
			const sessionXp = 60;
			const streak = 14;
			const xpEarned = calculateXpWithMultiplier(sessionXp, streak);

			expect(xpEarned).toBe(90);
			expect(getNextMultiplierThreshold(14)).toBe(30);

			const levelInfo = getLevelInfo(xpEarned);
			expect(levelInfo.level).toBe(1);
		});

		it('should track overall progress with streak bonuses', () => {
			let totalXp = 0;

			const studySessions = [
				{ duration: 25, streak: 0 },
				{ duration: 25, streak: 3 },
				{ duration: 25, streak: 7 },
				{ duration: 25, streak: 14 },
			];

			studySessions.forEach((session) => {
				const baseXp = session.duration;
				const xpEarned = calculateXpWithMultiplier(baseXp, session.streak);
				totalXp += xpEarned;
			});

			expect(totalXp).toBeGreaterThan(100);

			const finalLevel = calculateLevel(totalXp);
			expect(finalLevel).toBeGreaterThan(1);
		});
	});
});

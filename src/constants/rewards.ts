export interface StreakMultiplier {
	minStreak: number;
	multiplier: number;
	label: string;
	description: string;
}

export const STREAK_MULTIPLIERS: StreakMultiplier[] = [
	{
		minStreak: 0,
		multiplier: 1,
		label: 'Base',
		description: 'Standard XP earned',
	},
	{
		minStreak: 3,
		multiplier: 1.25,
		label: 'Warming Up',
		description: '+25% XP bonus',
	},
	{
		minStreak: 7,
		multiplier: 1.5,
		label: 'On Fire',
		description: '+50% XP bonus',
	},
	{
		minStreak: 14,
		multiplier: 1.75,
		label: 'Unstoppable',
		description: '+75% XP bonus',
	},
	{
		minStreak: 30,
		multiplier: 2,
		label: 'Legendary',
		description: '+100% XP bonus',
	},
	{
		minStreak: 60,
		multiplier: 2.5,
		label: 'Immortal',
		description: '+150% XP bonus',
	},
	{
		minStreak: 100,
		multiplier: 3,
		label: 'Mythic',
		description: '+200% XP bonus',
	},
];

export const MAX_STREAK_FREEZES = 5;
export const STREAK_FREEZE_COST_XP = 500;

export interface DailyLoginReward {
	day: number;
	xpBonus: number;
	streakFreeze?: boolean;
	specialReward?: string;
}

export const DAILY_LOGIN_REWARDS: DailyLoginReward[] = [
	{ day: 1, xpBonus: 10 },
	{ day: 2, xpBonus: 15 },
	{ day: 3, xpBonus: 20 },
	{ day: 4, xpBonus: 25 },
	{ day: 5, xpBonus: 30 },
	{ day: 6, xpBonus: 40 },
	{ day: 7, xpBonus: 100, streakFreeze: true, specialReward: 'Weekly Bonus!' },
	{ day: 8, xpBonus: 15 },
	{ day: 9, xpBonus: 20 },
	{ day: 10, xpBonus: 25 },
	{ day: 11, xpBonus: 30 },
	{ day: 12, xpBonus: 35 },
	{ day: 13, xpBonus: 45 },
	{ day: 14, xpBonus: 150, streakFreeze: true, specialReward: 'Two Week Champion!' },
	{ day: 21, xpBonus: 250, streakFreeze: true, specialReward: 'Three Week Legend!' },
	{ day: 30, xpBonus: 500, streakFreeze: true, specialReward: 'Monthly Master!' },
];

export function getStreakMultiplier(streak: number): StreakMultiplier {
	const sorted = [...STREAK_MULTIPLIERS].sort((a, b) => b.minStreak - a.minStreak);
	for (const mult of sorted) {
		if (streak >= mult.minStreak) {
			return mult;
		}
	}
	return STREAK_MULTIPLIERS[0];
}

export function getDailyLoginReward(consecutiveDays: number): DailyLoginReward | null {
	const normalizedDay = ((consecutiveDays - 1) % 30) + 1;

	if (normalizedDay === 21 || normalizedDay === 30) {
		return DAILY_LOGIN_REWARDS.find((r) => r.day === normalizedDay) || null;
	}

	const cycleDay = ((normalizedDay - 1) % 14) + 1;
	return DAILY_LOGIN_REWARDS.find((r) => r.day === cycleDay) || null;
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt?: Date;
}

export const ACHIEVEMENT_DEFS = {
	FIRST_QUIZ: {
		id: 'first_quiz',
		title: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
	},
	STREAK_7: {
		id: 'streak_7',
		title: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
	},
	STREAK_30: {
		id: 'streak_30',
		title: 'Monthly Master',
		description: 'Maintain a 30-day streak',
		icon: '💎',
	},
	PERFECT_QUIZ: {
		id: 'perfect_quiz',
		title: 'Perfect Score',
		description: 'Get 100% on a quiz',
		icon: '⭐',
	},
	FLASHCARD_100: {
		id: 'flashcard_100',
		title: 'Flashcard Pro',
		description: 'Review 100 flashcards',
		icon: '📚',
	},
	TOPIC_MASTER: {
		id: 'topic_master',
		title: 'Topic Master',
		description: 'Achieve 90%+ mastery on 5 topics',
		icon: '🏆',
	},
	STUDY_BUDDY: {
		id: 'study_buddy',
		title: 'Social Learner',
		description: 'Connect with a study buddy',
		icon: '🤝',
	},
	EARLY_BIRD: {
		id: 'early_bird',
		title: 'Early Bird',
		description: 'Study before 7am',
		icon: '🌅',
	},
	NIGHT_OWL: { id: 'night_owl', title: 'Night Owl', description: 'Study after 10pm', icon: '🦉' },
	CONSISTENT: {
		id: 'consistent',
		title: 'Consistent',
		description: 'Study for 7 days in a row',
		icon: '📈',
	},
};

export interface APSProgress {
	currentAps: number;
	targetAps: number;
	pointsThisMonth: number;
	universityTarget?: string;
	faculty?: string;
}

export const MAX_LEVEL = 100;

export const LEVEL_TITLES: Record<number, string> = {
	1: 'Starter',
	10: 'Scholar',
	25: 'Star',
	50: 'Expert',
	100: 'Legend',
};

export const LEVEL_MILESTONES = [10, 25, 50, 100] as const;

export const LEVEL_COLORS: Record<number, string> = {
	1: '#7C3AED',
	10: '#06B6D4',
	25: '#F97316',
	50: '#EC4899',
	100: '#84CC16',
};

export function getXpForLevel(level: number): number {
	if (level <= 1) return 0;
	return Math.floor(level * level * 50);
}

export const TOTAL_XP_AT_LEVEL: number[] = (() => {
	const totalXp = new Array(MAX_LEVEL + 1).fill(0);
	let accumulated = 0;
	for (let i = 2; i <= MAX_LEVEL; i++) {
		accumulated += getXpForLevel(i);
		totalXp[i] = accumulated;
	}
	return totalXp;
})();

export function getTotalXpForLevel(level: number): number {
	if (level <= 1) return 0;
	if (level > MAX_LEVEL) return TOTAL_XP_AT_LEVEL[MAX_LEVEL];
	return TOTAL_XP_AT_LEVEL[level];
}

const COLOR_THRESHOLDS = Object.keys(LEVEL_COLORS)
	.map(Number)
	.sort((a, b) => b - a);

export function getLevelColor(level: number): string {
	for (const threshold of COLOR_THRESHOLDS) {
		if (level >= threshold) {
			return LEVEL_COLORS[threshold];
		}
	}
	return LEVEL_COLORS[1];
}

export function getNextMilestone(level: number): number | null {
	for (const milestone of LEVEL_MILESTONES) {
		if (milestone > level) return milestone;
	}
	return null;
}

export const LEVEL_BADGE_ICONS: Record<number, string> = {
	1: '🌱',
	10: '📚',
	25: '⭐',
	50: '🏆',
	75: '👑',
	100: '💎',
};

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

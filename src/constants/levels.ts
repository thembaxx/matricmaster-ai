export const MAX_LEVEL = 100;

export const LEVEL_TITLES: Record<number, string> = {
	1: 'Beginner',
	5: 'Novice',
	10: 'Learner',
	15: 'Student',
	20: 'Apprentice',
	25: 'Scholar',
	30: 'Practitioner',
	35: 'Achiever',
	40: 'Skilled',
	45: 'Proficient',
	50: 'Expert',
	55: 'Specialist',
	60: 'Veteran',
	65: 'Authority',
	70: 'Champion',
	75: 'Master',
	80: 'Elite',
	85: 'Grandmaster',
	90: 'Legend',
	95: 'Icon',
	100: 'Mythic',
};

export const LEVEL_MILESTONES = [10, 25, 50, 75, 100] as const;

export const LEVEL_COLORS: Record<number, string> = {
	1: '#6b7280',
	5: '#3b82f6',
	10: '#8b5cf6',
	25: '#ec4899',
	50: '#f59e0b',
	75: '#ef4444',
	100: '#fbbf24',
};

export function getXpForLevel(level: number): number {
	if (level <= 1) return 0;
	return Math.floor(level * level * 50);
}

/**
 * Precomputed cumulative XP required to reach the start of each level.
 * TOTAL_XP_AT_LEVEL[level] = total XP needed to reach 'level' from level 1.
 */
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

/**
 * Precomputed sorted color thresholds for O(1) or O(log N) lookup.
 */
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

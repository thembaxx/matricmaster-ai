import {
	getLevelColor,
	getNextMilestone,
	getTotalXpForLevel,
	getXpForLevel,
	LEVEL_TITLES,
	MAX_LEVEL,
	TOTAL_XP_AT_LEVEL,
} from '@/constants/levels';

export interface LevelInfo {
	level: number;
	title: string;
	currentXp: number;
	xpInCurrentLevel: number;
	xpForNextLevel: number;
	progressPercent: number;
	nextMilestone: number | null;
	color: string;
}

/**
 * Optimized level calculation using O(N) precomputed cumulative XP search.
 * Since MAX_LEVEL is small (100), O(N) is efficient.
 */
export function calculateLevel(totalXp: number): number {
	if (totalXp <= 0) return 1;

	for (let i = MAX_LEVEL; i >= 1; i--) {
		if (totalXp >= TOTAL_XP_AT_LEVEL[i]) {
			return i;
		}
	}

	return 1;
}

export function getXpInCurrentLevel(totalXp: number): number {
	if (totalXp <= 0) return 0;

	const currentLevel = calculateLevel(totalXp);
	const xpAtLevelStart = getTotalXpForLevel(currentLevel);

	return totalXp - xpAtLevelStart;
}

export function getProgressToNextLevel(totalXp: number): number {
	if (totalXp <= 0) return 0;

	const currentLevel = calculateLevel(totalXp);

	if (currentLevel >= MAX_LEVEL) return 100;

	const xpInLevel = getXpInCurrentLevel(totalXp);
	const xpNeeded = getXpForLevel(currentLevel + 1);

	if (xpNeeded <= 0) return 100;

	return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
}

/**
 * Precomputed sorted title thresholds for O(1) or O(log N) lookup.
 */
const TITLE_THRESHOLDS = Object.keys(LEVEL_TITLES)
	.map(Number)
	.sort((a, b) => b - a);

export function getLevelTitle(level: number): string {
	for (const threshold of TITLE_THRESHOLDS) {
		if (level >= threshold) {
			return LEVEL_TITLES[threshold];
		}
	}
	return LEVEL_TITLES[1];
}

export function getXpRemainingForNextLevel(totalXp: number): number {
	const currentLevel = calculateLevel(totalXp);

	if (currentLevel >= MAX_LEVEL) return 0;

	const xpInLevel = getXpInCurrentLevel(totalXp);
	const xpNeeded = getXpForLevel(currentLevel + 1);

	return Math.max(0, xpNeeded - xpInLevel);
}

export function getLevelInfo(totalXp: number): LevelInfo {
	const level = calculateLevel(totalXp);
	const currentLevel = Math.min(level, MAX_LEVEL);
	const xpAtLevelStart = TOTAL_XP_AT_LEVEL[currentLevel];
	const xpInCurrentLevel = Math.max(0, totalXp - xpAtLevelStart);
	const xpForNextLevel = currentLevel < MAX_LEVEL ? getXpForLevel(currentLevel + 1) : 0;

	const progressPercent =
		currentLevel >= MAX_LEVEL
			? 100
			: xpForNextLevel > 0
				? Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100))
				: 100;

	return {
		level: currentLevel,
		title: getLevelTitle(currentLevel),
		currentXp: totalXp,
		xpInCurrentLevel,
		xpForNextLevel,
		progressPercent,
		nextMilestone: getNextMilestone(currentLevel),
		color: getLevelColor(currentLevel),
	};
}

export function formatXp(xp: number): string {
	if (xp >= 1000000) {
		return `${(xp / 1000000).toFixed(1)}M`;
	}
	if (xp >= 1000) {
		return `${(xp / 1000).toFixed(1)}K`;
	}
	return xp.toString();
}

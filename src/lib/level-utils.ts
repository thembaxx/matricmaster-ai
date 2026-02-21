import {
	getLevelColor,
	getNextMilestone,
	getTotalXpForLevel,
	getXpForLevel,
	LEVEL_TITLES,
	MAX_LEVEL,
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

export function calculateLevel(totalXp: number): number {
	if (totalXp <= 0) return 1;

	let level = 1;
	let accumulatedXp = 0;

	while (level < MAX_LEVEL) {
		const xpNeeded = getXpForLevel(level + 1);
		if (accumulatedXp + xpNeeded > totalXp) {
			break;
		}
		accumulatedXp += xpNeeded;
		level++;
	}

	return Math.min(level, MAX_LEVEL);
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

export function getLevelTitle(level: number): string {
	const thresholds = Object.keys(LEVEL_TITLES)
		.map(Number)
		.sort((a, b) => b - a);

	for (const threshold of thresholds) {
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

	return {
		level: currentLevel,
		title: getLevelTitle(currentLevel),
		currentXp: totalXp,
		xpInCurrentLevel: getXpInCurrentLevel(totalXp),
		xpForNextLevel: currentLevel < MAX_LEVEL ? getXpForLevel(currentLevel + 1) : 0,
		progressPercent: getProgressToNextLevel(totalXp),
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

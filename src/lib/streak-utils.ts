import { getStreakMultiplier } from '@/content';

export function calculateXpWithMultiplier(baseXp: number, streak: number): number {
	const multiplierInfo = getStreakMultiplier(streak);
	return Math.round(baseXp * multiplierInfo.multiplier);
}

export function getXpBreakdown(
	baseXp: number,
	streak: number
): {
	baseXp: number;
	multiplier: number;
	bonusXp: number;
	totalXp: number;
	label: string;
} {
	const multiplierInfo = getStreakMultiplier(streak);
	const totalXp = Math.round(baseXp * multiplierInfo.multiplier);
	const bonusXp = totalXp - baseXp;

	return {
		baseXp,
		multiplier: multiplierInfo.multiplier,
		bonusXp,
		totalXp,
		label: multiplierInfo.label,
	};
}

export function getNextMultiplierThreshold(currentStreak: number): number {
	const thresholds = [3, 7, 14, 30, 60, 100];
	for (const threshold of thresholds) {
		if (currentStreak < threshold) {
			return threshold;
		}
	}
	return 100;
}

export interface XPEvent {
	type: 'lesson_complete' | 'quiz_passed' | 'streak_day' | 'challenge_complete' | 'perfect_score';
	basePoints: number;
	multiplier?: number;
}

export const XP_VALUES = {
	lesson_complete: 50,
	quiz_passed: 100, // >80%
	streak_day: 25,
	challenge_complete: 250,
	perfect_score: 50,
};

export function calculateXP(event: XPEvent): number {
	const base = XP_VALUES[event.type as keyof typeof XP_VALUES] || event.basePoints;
	const multiplier = event.multiplier || 1;
	return Math.floor(base * multiplier);
}

export interface XPProgress {
	totalXp: number;
	level: number;
	xpInCurrentLevel: number;
	xpForNextLevel: number;
	progressPercent: number;
}

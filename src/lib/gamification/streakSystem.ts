export interface Streak {
	current: number;
	longest: number;
	lastActivity: Date | null;
	frozen?: boolean;
}

export function isStreakActive(lastActivity: Date | null): boolean {
	if (!lastActivity) return false;

	const now = new Date();
	const last = new Date(lastActivity);

	// Reset if more than 48 hours since last activity
	const diffInHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
	return diffInHours <= 48;
}

export function shouldIncrementStreak(lastActivity: Date | null): boolean {
	if (!lastActivity) return true;

	const now = new Date();
	const last = new Date(lastActivity);

	// Check if it's a new day (UTC)
	return now.getUTCDate() !== last.getUTCDate() ||
		   now.getUTCMonth() !== last.getUTCMonth() ||
		   now.getUTCFullYear() !== last.getUTCFullYear();
}

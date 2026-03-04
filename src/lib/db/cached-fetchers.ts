import 'server-only';
import { headers } from 'next/headers';
import { cache } from 'react';
import { getAuth } from '@/lib/auth';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getUserInfo } from '@/lib/db/buddy-actions';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

export const getSession = cache(async () => {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	return session;
});

export const getUserProgress = cache(async () => {
	const session = await getSession();
	if (!session?.user?.id) return null;
	return getUserProgressSummary();
});

export const getUserStreakData = cache(async () => {
	const session = await getSession();
	if (!session?.user?.id) return null;
	return getUserStreak();
});

export const getUserAchievementsData = cache(async () => {
	const session = await getSession();
	if (!session?.user?.id) return null;
	return getUserAchievements();
});

export const getUserInfoData = cache(async (userId?: string) => {
	const session = await getSession();
	const targetUserId = userId ?? session?.user?.id;
	if (!targetUserId) return null;
	return getUserInfo(targetUserId);
});

export const getDashboardData = cache(async () => {
	const [progress, streak, achievements] = await Promise.all([
		getUserProgress(),
		getUserStreakData(),
		getUserAchievementsData(),
	]);

	return {
		progress,
		streak,
		achievements,
	};
});

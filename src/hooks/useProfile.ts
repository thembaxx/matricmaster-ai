'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENT_POINTS_MAP } from '@/constants/achievements';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { authClient, useSession } from '@/lib/auth-client';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { updateUserProfileAction } from '@/lib/db/actions';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

export interface ChartDataItem {
	subject: string;
	you: number;
	average: number;
}

const defaultChartData: ChartDataItem[] = [
	{ subject: 'MATH', you: 0, average: 70 },
	{ subject: 'PHY SCI', you: 0, average: 75 },
	{ subject: 'ENG FAL', you: 0, average: 65 },
	{ subject: 'LIFE OR.', you: 0, average: 60 },
	{ subject: 'GEOG', you: 0, average: 65 },
	{ subject: 'ACC', you: 0, average: 75 },
	{ subject: 'HIST', you: 0, average: 70 },
];

export interface UserStats {
	totalQuestions: number;
	accuracy: number;
	streak: number;
	achievementsUnlocked: number;
	totalXp: number;
	unlockedAchievementIds: string[];
}

interface EditFormState {
	name: string;
	school: string;
	avatarId: string;
}

export function useProfile() {
	const { data: session } = useSession();
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');
	const [isEditing, setIsEditing] = useState(false);

	const defaultEditForm = useMemo((): EditFormState => {
		const u = session?.user as any;
		return {
			name: u?.name || '',
			school: u?.school || '',
			avatarId: u?.avatarId || '',
		};
	}, [session?.user]);

	const [editForm, setEditForm] = useState<EditFormState>(defaultEditForm);

	const { data: progressData, isLoading: isProgressLoading } = useQuery({
		queryKey: QUERY_KEYS.progress,
		queryFn: getUserProgressSummary,
		staleTime: 5 * 60 * 1000,
	});

	const { data: streakData, isLoading: isStreakLoading } = useQuery({
		queryKey: QUERY_KEYS.streak,
		queryFn: getUserStreak,
		staleTime: 10 * 60 * 1000,
	});

	const { data: achievementsData, isLoading: isAchievementsLoading } = useQuery({
		queryKey: QUERY_KEYS.achievements,
		queryFn: getUserAchievements,
		staleTime: 5 * 60 * 1000,
	});

	const userStats = useMemo(() => {
		if (!progressData || !streakData || !achievementsData) return null;

		const totalXp = achievementsData.unlocked.reduce(
			(sum: number, a: { achievementId: string }) => {
				return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
			},
			0
		);

		return {
			totalQuestions: progressData?.totalQuestionsAttempted || 0,
			accuracy: progressData?.accuracy || 0,
			streak: streakData?.currentStreak || 0,
			achievementsUnlocked: achievementsData?.unlocked?.length || 0,
			totalXp,
			unlockedAchievementIds: achievementsData.unlocked.map(
				(a: { achievementId: string }) => a.achievementId
			),
		};
	}, [progressData, streakData, achievementsData]);

	const isLoading = isProgressLoading || isStreakLoading || isAchievementsLoading;

	const handleSaveProfile = async () => {
		const result = await updateUserProfileAction(editForm);
		if (result.success) {
			toast.success('Profile updated successfully!');
			setIsEditing(false);
			await authClient.getSession();
		} else {
			toast.error('Failed to update profile');
		}
	};

	const chartData: ChartDataItem[] = useMemo(
		() =>
			defaultChartData.map((item) => ({
				...item,
				you:
					item.subject === 'MATH'
						? userStats?.accuracy || 0
						: Math.max(0, (userStats?.accuracy || 0) - 10),
			})),
		[userStats?.accuracy]
	);

	return {
		session,
		viewMode,
		setViewMode,
		isEditing,
		setIsEditing,
		editForm,
		setEditForm,
		userStats,
		isLoading,
		chartData,
		handleSaveProfile,
	};
}

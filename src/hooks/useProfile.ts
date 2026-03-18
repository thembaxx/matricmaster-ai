'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENT_POINTS_MAP } from '@/constants/achievements';
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

export function useProfile() {
	const { data: session } = useSession();
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');
	const [isEditing, setIsEditing] = useState(false);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [editForm, setEditForm] = useState({
		name: '',
		school: '',
		avatarId: '',
	});

	useEffect(() => {
		if (session?.user) {
			const u = session.user as any;
			setEditForm({
				name: u.name || '',
				school: u.school || '',
				avatarId: u.avatarId || '',
			});
		}
	}, [session]);

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

	useEffect(() => {
		async function fetchData() {
			try {
				const [progress, streak, achievements] = await Promise.all([
					getUserProgressSummary(),
					getUserStreak(),
					getUserAchievements(),
				]);

				const totalXp = achievements.unlocked.reduce(
					(sum: number, a: { achievementId: string }) => {
						return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
					},
					0
				);

				setUserStats({
					totalQuestions: progress?.totalQuestionsAttempted || 0,
					accuracy: progress?.accuracy || 0,
					streak: streak?.currentStreak || 0,
					achievementsUnlocked: achievements?.unlocked?.length || 0,
					totalXp,
					unlockedAchievementIds: achievements.unlocked.map(
						(a: { achievementId: string }) => a.achievementId
					),
				});
			} catch (error) {
				console.debug('Error fetching profile data:', error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

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

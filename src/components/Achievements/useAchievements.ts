'use client';

import { FireIcon, FlashIcon, Medal01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { getUserAchievements } from '@/lib/db/achievement-actions';

export interface Badge {
	id: string;
	name: string;
	icon: string | null;
	iconBg: string;
	unlocked: boolean;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	description?: string;
	points?: number;
	unlockedAt?: Date;
}

export interface Category {
	id: string;
	label: string;
	icon: typeof StarIcon;
}

export function useAchievements() {
	const [activeTab, setActiveTab] = useState('all');

	const { data: achievementsData, isLoading } = useQuery({
		queryKey: ['userAchievements'],
		queryFn: () => getUserAchievements(),
	});

	const badges: Badge[] = ACHIEVEMENTS.map((achievement) => {
		const unlockedRecord = achievementsData?.unlocked.find(
			(a) => a.achievementId === achievement.id
		);
		const unlocked = !!unlockedRecord;

		return {
			id: achievement.id,
			name: unlocked ? unlockedRecord?.title || achievement.name : achievement.name,
			icon: unlocked ? achievement.icon : null,
			iconBg: unlocked ? achievement.iconBg : 'transparent',
			unlocked,
			category: achievement.category,
			description: achievement.description,
			points: achievement.points,
			unlockedAt: unlockedRecord?.unlockedAt,
		};
	});

	const filteredBadges =
		activeTab === 'all'
			? badges
			: badges.filter((b) => b.category === activeTab || b.category === 'all');

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const totalBadges = ACHIEVEMENTS.length;
	const progress = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;
	const masteryLevel = Math.floor(unlockedCount / 10) + 1;
	const nextMilestone = Math.ceil((unlockedCount + 1) / 10) * 10;
	const badgesToNext = nextMilestone - unlockedCount;

	const categories: Category[] = [
		{ id: 'all', label: 'all badges', icon: StarIcon },
		{ id: 'science', label: 'science', icon: FlashIcon },
		{ id: 'math', label: 'math', icon: Medal01Icon },
		{ id: 'streak', label: 'streaks', icon: FireIcon },
	];

	return {
		activeTab,
		setActiveTab,
		isLoading,
		badges,
		filteredBadges,
		unlockedCount,
		totalBadges,
		progress,
		masteryLevel,
		badgesToNext,
		categories,
	};
}

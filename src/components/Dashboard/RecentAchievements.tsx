'use client';

import { CaretRight, Medal, Trophy } from '@phosphor-icons/react';
import { m } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type ACHIEVEMENTS, getAchievementById } from '@/constants/achievements';
import { getUserAchievements, type UserAchievement } from '@/lib/db/achievement-actions';

interface UnlockedAchievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	iconBg: string;
	points: number;
	unlockedAt: Date;
	isNew: boolean;
}

interface RecentAchievementsProps {
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	};
}

export const RecentAchievements = memo(function RecentAchievements({
	initialAchievements,
}: RecentAchievementsProps) {
	const [achievements, setAchievements] = useState<UnlockedAchievement[]>(() => {
		if (initialAchievements) {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			const unlocked = initialAchievements.unlocked
				.map((ua) => {
					const def = getAchievementById(ua.achievementId);
					const unlockedAt = new Date(ua.unlockedAt || now);
					return {
						id: ua.achievementId,
						name: def?.name || 'Achievement',
						description: def?.description || '',
						icon: def?.icon || '🏆',
						iconBg: def?.iconBg || '#fef3c7',
						points: def?.points || 0,
						unlockedAt,
						isNew: unlockedAt >= today,
					};
				})
				.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
				.slice(0, 3);
			return unlocked;
		}
		return [];
	});
	const [isLoading, setIsLoading] = useState(achievements.length === 0 && !initialAchievements);

	useEffect(() => {
		if (achievements.length > 0 || initialAchievements) return; // Skip fetch if initialized with initial data

		async function fetchAchievements() {
			try {
				const result = await getUserAchievements();
				const now = new Date();
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

				const unlocked = result.unlocked
					.map((ua) => {
						const def = getAchievementById(ua.achievementId);
						const unlockedAt = new Date(ua.unlockedAt || now);
						return {
							id: ua.achievementId,
							name: def?.name || 'Achievement',
							description: def?.description || '',
							icon: def?.icon || '🏆',
							iconBg: def?.iconBg || '#fef3c7',
							points: def?.points || 0,
							unlockedAt,
							isNew: unlockedAt >= today,
						};
					})
					.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
					.slice(0, 3);

				setAchievements(unlocked);
			} catch (error) {
				console.error('[RecentAchievements] Error fetching:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchAchievements();
	}, [achievements.length, initialAchievements]);

	const formatTimeAgo = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
		return `${Math.floor(days / 30)} months ago`;
	};

	if (isLoading) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="animate-pulse space-y-4">
					<div className="h-5 w-32 bg-muted rounded-lg" />
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="w-10 h-10 bg-muted rounded-xl" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-24 bg-muted rounded" />
								<div className="h-3 w-16 bg-muted rounded" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	if (achievements.length === 0) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="flex items-center gap-2 mb-4">
					<Trophy weight="bold" className="w-5 h-5 text-brand-amber" />
					<h3 className="text-lg font-black text-foreground tracking-tight">Recent Achievements</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
						<Medal weight="bold" className="w-8 h-8 text-muted-foreground/50" />
					</div>
					<p className="text-sm text-muted-foreground font-medium">No achievements yet</p>
					<p className="text-xs text-muted-foreground/70 mt-1">Complete quizzes to earn badges!</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Trophy weight="bold" className="w-5 h-5 text-brand-amber" />
					<h3 className="text-lg font-black text-foreground tracking-tight">Recent Achievements</h3>
				</div>
				<Badge variant="secondary" className="text-[10px] font-black uppercase tracking-wider">
					View All
				</Badge>
			</div>

			<div className="space-y-3">
				{achievements.map((achievement, index) => (
					<m.div
						key={achievement.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						className="flex items-center gap-3 p-3 rounded-2xl bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group"
					>
						<div
							className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
							style={{ backgroundColor: achievement.iconBg }}
						>
							{achievement.icon}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-bold text-foreground truncate">
									{achievement.name}
								</span>
								{achievement.isNew && (
									<Badge className="text-[8px] font-black uppercase tracking-wider bg-brand-amber text-zinc-900 h-4 px-1.5">
										New
									</Badge>
								)}
							</div>
							<p className="text-[10px] text-muted-foreground font-medium">
								{formatTimeAgo(achievement.unlockedAt)}
							</p>
						</div>
						<CaretRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
					</m.div>
				))}
			</div>
		</Card>
	);
});

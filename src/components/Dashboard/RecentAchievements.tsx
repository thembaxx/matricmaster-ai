'use client';

import { ArrowRight01Icon, ChampionIcon, Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type ACHIEVEMENTS, getAchievementById } from '@/constants/achievements';
import { getUserAchievements, type UserAchievement } from '@/lib/db/achievement-actions';

interface RecentAchievementsProps {
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	};
}

export const RecentAchievements = memo(function RecentAchievements({
	initialAchievements,
}: RecentAchievementsProps) {
	const router = useRouter();

	const { data: fetchedAchievements, isPending } = useQuery({
		queryKey: ['user-achievements'],
		queryFn: getUserAchievements,
		enabled: !initialAchievements,
		staleTime: 5 * 60 * 1000,
	});

	const achievements = useMemo(() => {
		const source = initialAchievements ?? fetchedAchievements;
		if (!source) return [];

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		return source.unlocked
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
	}, [initialAchievements, fetchedAchievements]);

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

	if (isPending) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="space-y-4">
					<Skeleton className="h-5 w-32" />
					{[1, 2, 3].map((item) => (
						<div key={`recent-achievements-skeleton-${item}`} className="flex items-center gap-3">
							<Skeleton className="w-10 h-10 rounded-xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-16" />
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
					<HugeiconsIcon icon={ChampionIcon} className="w-5 h-5 text-brand-amber" />
					<h3 className="text-lg font-black text-foreground tracking-tight">Recent Achievements</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="relative mb-4">
						<div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center">
							<HugeiconsIcon icon={Medal01Icon} className="w-10 h-10 text-muted-foreground/50" />
						</div>
						<div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-amber rounded-full flex items-center justify-center">
							<span className="text-xs">🔒</span>
						</div>
					</div>
					<p className="text-base font-bold text-foreground mb-1">First Milestone</p>
					<p className="text-sm text-muted-foreground mb-4">
						Complete quizzes to earn your first badge!
					</p>
					<Button variant="outline" size="sm" onClick={() => router.push('/subjects')}>
						Start Learning
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={ChampionIcon} className="w-5 h-5 text-brand-amber" />
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
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
						/>
					</m.div>
				))}
			</div>
		</Card>
	);
});

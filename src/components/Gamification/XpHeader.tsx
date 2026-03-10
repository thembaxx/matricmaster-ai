'use client';

import { ChampionIcon, FireIcon, FlashIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ACHIEVEMENT_POINTS_MAP, type ACHIEVEMENTS } from '@/constants/achievements';
import { getUserAchievements, type UserAchievement } from '@/lib/db/achievement-actions';
import { getUserStreak } from '@/lib/db/progress-actions';
import { formatXp, getLevelInfo } from '@/lib/level-utils';

interface XpHeaderProps {
	variant?: 'full' | 'compact';
	className?: string;
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	};
	initialStreak?: {
		currentStreak: number;
	};
}

interface XpData {
	level: number;
	title: string;
	color: string;
	currentXp: number;
	xpInCurrentLevel: number;
	xpToNextLevel: number;
	progress: number;
	totalAchievements: number;
	unlockedAchievements: number;
	streak: number;
}

export const XpHeader = memo(function XpHeader({
	variant = 'full',
	className = '',
	initialAchievements,
	initialStreak,
}: XpHeaderProps) {
	const [data, setData] = useState<XpData | null>(() => {
		if (initialAchievements && initialStreak) {
			const unlocked = initialAchievements.unlocked.length;
			const total = unlocked + initialAchievements.available.length;

			const totalXp = initialAchievements.unlocked.reduce((sum, a) => {
				return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
			}, 0);

			const levelInfo = getLevelInfo(totalXp);

			return {
				level: levelInfo.level,
				title: levelInfo.title,
				color: levelInfo.color,
				currentXp: totalXp,
				xpInCurrentLevel: levelInfo.xpInCurrentLevel,
				xpToNextLevel: levelInfo.xpForNextLevel,
				progress: levelInfo.progressPercent,
				totalAchievements: total,
				unlockedAchievements: unlocked,
				streak: initialStreak.currentStreak,
			};
		}
		return null;
	});
	const [isLoading, setIsLoading] = useState(!data);

	useEffect(() => {
		if (data) return; // Skip fetch if initialized with initial data

		async function fetchData() {
			try {
				const [achievements, streakData] = await Promise.all([
					getUserAchievements(),
					getUserStreak(),
				]);

				const unlocked = achievements.unlocked.length;
				const total = unlocked + achievements.available.length;

				// Bolt: Fix logic bug (was searching available instead of all) and optimize with O(1) MapTrifold lookup
				const totalXp = achievements.unlocked.reduce((sum, a) => {
					return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
				}, 0);

				const levelInfo = getLevelInfo(totalXp);

				setData({
					level: levelInfo.level,
					title: levelInfo.title,
					color: levelInfo.color,
					currentXp: totalXp,
					xpInCurrentLevel: levelInfo.xpInCurrentLevel,
					xpToNextLevel: levelInfo.xpForNextLevel,
					progress: levelInfo.progressPercent,
					totalAchievements: total,
					unlockedAchievements: unlocked,
					streak: streakData.currentStreak,
				});
			} catch (error) {
				console.error('[XpHeader] Error fetching data:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [data]);

	if (isLoading) {
		return (
			<div className={`animate-pulse ${className}`}>
				{variant === 'full' ? (
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-muted rounded-2xl" />
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-muted rounded w-24" />
							<div className="h-2 bg-muted rounded w-full" />
						</div>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-muted rounded-xl" />
						<div className="h-4 bg-muted rounded w-16" />
					</div>
				)}
			</div>
		);
	}

	if (!data) return null;

	if (variant === 'compact') {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
					style={{ backgroundColor: `${data.color}15` }}
				>
					<HugeiconsIcon icon={ChampionIcon} className="w-4 h-4" style={{ color: data.color }} />
					<span className="text-sm font-black" style={{ color: data.color }}>
						Lv.{data.level}
					</span>
				</div>
				{data.streak > 0 && (
					<div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-full">
						<HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-orange-500" />
						<span className="text-sm font-black text-orange-500">{data.streak}</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="relative">
						<div
							className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
							style={{
								background: `linear-gradient(135deg, ${data.color}, ${data.color}cc)`,
								boxShadow: `0 8px 24px ${data.color}30`,
							}}
						>
							<HugeiconsIcon icon={ChampionIcon} className="w-7 h-7 text-white" />
						</div>
						<div
							className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 shadow-sm"
							style={{ borderColor: data.color }}
						>
							<span className="text-[10px] font-black" style={{ color: data.color }}>
								{data.level}
							</span>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-lg font-black text-foreground">Level {data.level}</span>
							<Badge
								className="text-[9px] font-black uppercase tracking-wider"
								style={{
									backgroundColor: `${data.color}15`,
									color: data.color,
									borderColor: `${data.color}30`,
								}}
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 mr-1" />
								{data.title}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-0.5">
							{formatXp(data.xpInCurrentLevel)} / {formatXp(data.xpToNextLevel)} XP to next level
						</p>
					</div>
				</div>

				{data.streak > 0 && (
					<div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
						<HugeiconsIcon icon={FireIcon} className="w-5 h-5 text-orange-500" />
						<div>
							<span className="text-xl font-black text-orange-500">{data.streak}</span>
							<span className="text-xs font-bold text-orange-500/70 ml-1">day streak</span>
						</div>
					</div>
				)}
			</div>

			<div className="relative">
				<Progress
					value={data.progress}
					className="h-3 bg-muted"
					style={
						{
							'--progress-background': data.color,
						} as React.CSSProperties
					}
				/>
				<div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-1 px-2 py-0.5 bg-background rounded-full border border-border shadow-sm">
					<HugeiconsIcon icon={FlashIcon} className="w-3 h-3" style={{ color: data.color }} />
					<span className="text-[10px] font-black text-muted-foreground">
						{Math.round(data.progress)}%
					</span>
				</div>
			</div>
		</div>
	);
});

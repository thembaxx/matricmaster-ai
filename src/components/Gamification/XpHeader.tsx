'use client';

import { Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getUserStreak } from '@/lib/db/progress-actions';

interface XpHeaderProps {
	variant?: 'full' | 'compact';
	className?: string;
}

interface XpData {
	level: number;
	currentXp: number;
	xpToNextLevel: number;
	progress: number;
	totalAchievements: number;
	unlockedAchievements: number;
	streak: number;
}

const XP_PER_LEVEL = 500;

function calculateLevel(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
	const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
	const currentXp = totalXp % XP_PER_LEVEL;
	const xpToNext = XP_PER_LEVEL;
	return { level, currentXp, xpToNext };
}

export function XpHeader({ variant = 'full', className = '' }: XpHeaderProps) {
	const [data, setData] = useState<XpData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [achievements, streakData] = await Promise.all([
					getUserAchievements(),
					getUserStreak(),
				]);

				const unlocked = achievements.unlocked.length;
				const total = unlocked + achievements.available.length;

				const totalXp = achievements.unlocked.reduce((sum, a) => {
					const def = achievements.available.find((d) => d.id === a.achievementId);
					return sum + (def?.points || 0);
				}, 0);

				const { level, currentXp, xpToNext } = calculateLevel(totalXp);

				setData({
					level,
					currentXp,
					xpToNextLevel: xpToNext,
					progress: (currentXp / xpToNext) * 100,
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
	}, []);

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
				<div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-amber/10 rounded-full">
					<Trophy className="w-4 h-4 text-brand-amber" />
					<span className="text-sm font-black text-brand-amber">Lv.{data.level}</span>
				</div>
				{data.streak > 0 && (
					<div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-full">
						<Flame className="w-4 h-4 text-orange-500" />
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
						<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-amber to-orange-400 flex items-center justify-center shadow-lg shadow-brand-amber/20">
							<Trophy className="w-7 h-7 text-white" />
						</div>
						<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 border-brand-amber shadow-sm">
							<span className="text-[10px] font-black text-brand-amber">{data.level}</span>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-lg font-black text-foreground">Level {data.level}</span>
							<Badge className="text-[9px] font-black uppercase tracking-wider bg-brand-amber/10 text-brand-amber border-brand-amber/20">
								<Sparkles className="w-3 h-3 mr-1" />
								{data.unlockedAchievements}/{data.totalAchievements} badges
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-0.5">
							{data.currentXp} / {data.xpToNextLevel} XP to next level
						</p>
					</div>
				</div>

				{data.streak > 0 && (
					<div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
						<Flame className="w-5 h-5 text-orange-500" />
						<div>
							<span className="text-xl font-black text-orange-500">{data.streak}</span>
							<span className="text-xs font-bold text-orange-500/70 ml-1">day streak</span>
						</div>
					</div>
				)}
			</div>

			<div className="relative">
				<Progress value={data.progress} className="h-3 bg-muted" />
				<div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-1 px-2 py-0.5 bg-background rounded-full border border-border shadow-sm">
					<Zap className="w-3 h-3 text-brand-amber" />
					<span className="text-[10px] font-black text-muted-foreground">
						{Math.round(data.progress)}%
					</span>
				</div>
			</div>
		</div>
	);
}

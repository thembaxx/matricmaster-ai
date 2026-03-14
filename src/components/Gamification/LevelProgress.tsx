'use client';

import { Lightning01Icon as Lightning, SparklesIcon as Sparkle } from 'hugeicons-react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LEVEL_BADGE_ICONS, MAX_LEVEL } from '@/constants/levels';
import { formatXp, getLevelInfo, getLevelTitle } from '@/lib/level-utils';
import { cn } from '@/lib/utils';

interface LevelProgressProps {
	totalXp: number;
	variant?: 'full' | 'compact' | 'badge';
	showTitle?: boolean;
	animate?: boolean;
	className?: string;
}

/**
 * Precomputed sorted badge thresholds for O(1) or O(log N) lookup.
 */
const BADGE_THRESHOLDS = Object.keys(LEVEL_BADGE_ICONS)
	.map(Number)
	.sort((a, b) => b - a);

function getLevelBadgeIcon(level: number): string {
	for (const threshold of BADGE_THRESHOLDS) {
		if (level >= threshold) {
			return LEVEL_BADGE_ICONS[threshold];
		}
	}
	return '🌱';
}

export const LevelProgress = memo(function LevelProgress({
	totalXp,
	variant = 'full',
	showTitle = true,
	animate = true,
	className = '',
}: LevelProgressProps) {
	const info = getLevelInfo(totalXp);
	const badgeIcon = getLevelBadgeIcon(info.level);

	if (variant === 'badge') {
		return (
			<div
				className={cn(
					"inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition-transform active:scale-95 shadow-sm",
					className
				)}
				style={{ backgroundColor: `${info.color}20`, color: info.color }}
			>
				<span className="text-lg">{badgeIcon}</span>
				<span className="uppercase tracking-widest">Lv {info.level}</span>
			</div>
		);
	}

	if (variant === 'compact') {
		return (
			<div className={cn("flex items-center gap-4", className)}>
				<div
					className="flex items-center gap-3 px-4 py-3 rounded-[1.25rem] shadow-sm"
					style={{ backgroundColor: `${info.color}15` }}
				>
					<span className="text-2xl">{badgeIcon}</span>
					<div className="flex flex-col">
						<span className="text-md font-black leading-none" style={{ color: info.color }}>
							Lvl {info.level}
						</span>
						{showTitle && (
							<span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1.5">{info.title}</span>
						)}
					</div>
				</div>
				<div className="flex-1 space-y-2">
					<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
						<div
							className="h-full rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
							style={{
								width: `${info.progressPercent}%`,
								backgroundColor: info.color,
							}}
						/>
					</div>
					<div className="flex justify-between items-center text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">
						<span>Progress</span>
						<span>{info.level < MAX_LEVEL ? `${Math.round(info.progressPercent)}%` : 'MAX'}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-6">
					<div className="relative">
						<m.div
							whileHover={{ scale: 1.1, rotate: 10 }}
							className="w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-all duration-500"
							style={{
								background: `linear-gradient(135deg, ${info.color}, ${info.color}dd)`,
								boxShadow: `0 15px 35px ${info.color}30`,
							}}
						>
							<span className="text-4xl filter drop-shadow-lg">{badgeIcon}</span>
						</m.div>
						<div
							className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border-4 shadow-xl px-2"
							style={{ borderColor: info.color }}
						>
							<span className="text-sm font-black" style={{ color: info.color }}>
								{info.level}
							</span>
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<span className="text-3xl font-black text-foreground tracking-tight leading-none">Level {info.level}</span>
							{showTitle && (
								<Badge
									className="h-7 px-3 text-[10px] font-black uppercase tracking-[0.15em] border-none"
									style={{
										backgroundColor: `${info.color}20`,
										color: info.color,
									}}
								>
									<Sparkle size={12} className="mr-1.5 fill-current" />
									{info.title}
								</Badge>
							)}
						</div>
						<p className="text-sm font-bold text-muted-foreground/60 leading-tight">
							{info.level < MAX_LEVEL ? (
								<>
									<span className="text-foreground">{formatXp(info.xpInCurrentLevel)}</span> / {formatXp(info.xpForNextLevel)} XP to reach Level {info.level + 1}
								</>
							) : (
								<span className="text-tiimo-orange font-black uppercase tracking-widest">Ultimate Mastery Reached!</span>
							)}
						</p>
					</div>
				</div>

				{info.nextMilestone && (
					<div className="hidden sm:block text-right space-y-1">
						<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Milestone</p>
						<p className="text-xl font-black text-foreground leading-none">Lvl {info.nextMilestone}</p>
					</div>
				)}
			</div>

			<div className="space-y-3">
				<div className="h-6 w-full bg-muted/20 rounded-full overflow-hidden p-1.5 shadow-inner">
					<m.div
						initial={animate ? { width: 0 } : { width: `${info.progressPercent}%` }}
						animate={{ width: `${info.progressPercent}%` }}
						transition={{ duration: 1.5, type: 'spring', damping: 25 }}
						className="h-full rounded-full transition-all duration-1000 relative group"
						style={{
							backgroundColor: info.color,
							boxShadow: `0 0 20px ${info.color}40`,
						}}
					>
						<div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
					</m.div>
				</div>
				<div className="flex justify-between items-center px-1">
					<div className="flex items-center gap-2">
						<Lightning size={16} className="stroke-[3px]" style={{ color: info.color }} />
						<span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Energy Potential</span>
					</div>
					<span className="text-sm font-black" style={{ color: info.color }}>
						{Math.round(info.progressPercent)}%
					</span>
				</div>
			</div>
		</div>
	);
});

export const LevelBadge = memo(function LevelBadge({
	level,
	size = 'default',
	className = '',
}: {
	level: number;
	size?: 'sm' | 'default' | 'lg';
	className?: string;
}) {
	const info = getLevelInfo(0);
	const levelInfo = { ...info, level, color: getLevelTitle(level) ? info.color : '#cbd5e1' };

	const badgeIcon = getLevelBadgeIcon(level);
	const sizeClasses = {
		sm: 'w-10 h-10 text-xl rounded-xl',
		default: 'w-16 h-16 text-3xl rounded-[1.25rem]',
		lg: 'w-24 h-24 text-5xl rounded-[2rem]',
	};

	return (
		<m.div
			whileHover={{ scale: 1.1, rotate: -5 }}
			className={cn(
				"flex items-center justify-center shadow-xl transition-all duration-300",
				sizeClasses[size],
				className
			)}
			style={{
				background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
				boxShadow: `0 10px 30px ${levelInfo.color}40`,
			}}
		>
			<span className="filter drop-shadow-md">{badgeIcon}</span>
		</m.div>
	);
});

export { getLevelInfo, getLevelTitle };

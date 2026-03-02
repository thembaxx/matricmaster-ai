'use client';

import { m } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LEVEL_BADGE_ICONS, MAX_LEVEL } from '@/constants/levels';
import { formatXp, getLevelInfo, getLevelTitle } from '@/lib/level-utils';

interface LevelProgressProps {
	totalXp: number;
	variant?: 'full' | 'compact' | 'badge';
	showTitle?: boolean;
	animate?: boolean;
	className?: string;
}

function getLevelBadgeIcon(level: number): string {
	const thresholds = Object.keys(LEVEL_BADGE_ICONS)
		.map(Number)
		.sort((a, b) => b - a);

	for (const threshold of thresholds) {
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
				className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm ${className}`}
				style={{ backgroundColor: `${info.color}15`, color: info.color }}
			>
				<span>{badgeIcon}</span>
				<span>Lv.{info.level}</span>
			</div>
		);
	}

	if (variant === 'compact') {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div
					className="flex items-center gap-2 px-3 py-2 rounded-2xl"
					style={{ backgroundColor: `${info.color}15` }}
				>
					<span className="text-xl">{badgeIcon}</span>
					<div className="flex flex-col">
						<span className="text-sm font-black" style={{ color: info.color }}>
							Level {info.level}
						</span>
						{showTitle && (
							<span className="text-[10px] font-medium text-muted-foreground">{info.title}</span>
						)}
					</div>
				</div>
				<div className="flex-1 max-w-[120px]">
					<Progress
						value={info.progressPercent}
						className="h-2"
						style={
							{
								'--progress-background': info.color,
							} as React.CSSProperties
						}
					/>
					<p className="text-[9px] text-muted-foreground text-center mt-1">
						{info.level < MAX_LEVEL
							? `${formatXp(info.xpInCurrentLevel)}/${formatXp(info.xpForNextLevel)} XP`
							: 'MAX'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-3 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="relative">
						<m.div
							initial={animate ? { scale: 0.8 } : undefined}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 300, damping: 20 }}
						>
							<div
								className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
								style={{
									background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
									boxShadow: `0 8px 24px ${info.color}30`,
								}}
							>
								<span className="text-3xl">{badgeIcon}</span>
							</div>
						</m.div>
						<div
							className="absolute -bottom-2 -right-2 min-w-[28px] h-7 bg-background rounded-full flex items-center justify-center border-2 shadow-sm px-2"
							style={{ borderColor: info.color }}
						>
							<span className="text-xs font-black" style={{ color: info.color }}>
								{info.level}
							</span>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xl font-black text-foreground">Level {info.level}</span>
							{showTitle && (
								<Badge
									className="text-[9px] font-black uppercase tracking-wider"
									style={{
										backgroundColor: `${info.color}15`,
										color: info.color,
										borderColor: `${info.color}30`,
									}}
								>
									<Sparkles className="w-3 h-3 mr-1" />
									{info.title}
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground mt-0.5">
							{info.level < MAX_LEVEL ? (
								<>
									{formatXp(info.xpInCurrentLevel)} / {formatXp(info.xpForNextLevel)} XP to next
									level
								</>
							) : (
								<span className="text-brand-amber font-bold">Maximum level reached!</span>
							)}
						</p>
					</div>
				</div>

				{info.nextMilestone && (
					<div className="text-right">
						<p className="text-xs text-muted-foreground">Next milestone</p>
						<p className="text-sm font-black text-foreground">Level {info.nextMilestone}</p>
					</div>
				)}
			</div>

			<div className="relative">
				<m.div
					initial={animate ? { opacity: 0 } : undefined}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<Progress
						value={info.progressPercent}
						className="h-3 bg-muted"
						style={
							{
								'--progress-background': info.color,
							} as React.CSSProperties
						}
					/>
				</m.div>
				<div
					className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-1 px-2 py-0.5 bg-background rounded-full border shadow-sm"
					style={{ borderColor: `${info.color}30` }}
				>
					<Zap className="w-3 h-3" style={{ color: info.color }} />
					<span className="text-[10px] font-black text-muted-foreground">
						{info.progressPercent}%
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
	const levelInfo = { ...info, level, color: getLevelTitle(level) ? info.color : '#6b7280' };

	const badgeIcon = getLevelBadgeIcon(level);
	const sizeClasses = {
		sm: 'w-8 h-8 text-lg',
		default: 'w-12 h-12 text-2xl',
		lg: 'w-16 h-16 text-3xl',
	};

	return (
		<div
			className={`rounded-xl flex items-center justify-center ${sizeClasses[size]} ${className}`}
			style={{
				background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}cc)`,
				boxShadow: `0 4px 12px ${levelInfo.color}30`,
			}}
		>
			<span>{badgeIcon}</span>
		</div>
	);
});

export { getLevelInfo, getLevelTitle };

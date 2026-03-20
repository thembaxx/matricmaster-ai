'use client';

import { CrownIcon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Achievement {
	id: string;
	name: string;
	icon: string;
	iconBg?: string;
	points?: number;
	description?: string;
}

interface AchievementBadgeProps {
	achievement: Achievement;
	size?: 'sm' | 'md' | 'lg';
	showLabel?: boolean;
	showPoints?: boolean;
	isFeatured?: boolean;
	isLocked?: boolean;
	lockedIcon?: string;
	className?: string;
	onClick?: () => void;
}

const sizeConfig = {
	sm: {
		container: 'w-10 h-10',
		icon: 'text-xl',
		label: 'text-[9px]',
		points: 'text-[8px]',
	},
	md: {
		container: 'w-14 h-14',
		icon: 'text-2xl',
		label: 'text-[10px]',
		points: 'text-[9px]',
	},
	lg: {
		container: 'w-20 h-20',
		icon: 'text-4xl',
		label: 'text-xs',
		points: 'text-[10px]',
	},
};

export const AchievementBadge = memo(function AchievementBadge({
	achievement,
	size = 'md',
	showLabel = false,
	showPoints = false,
	isFeatured = false,
	isLocked = false,
	lockedIcon = '🔒',
	className,
	onClick,
}: AchievementBadgeProps) {
	const config = sizeConfig[size];
	const bgColor = achievement.iconBg || 'bg-primary-violet/10';

	const content = (
		<>
			<m.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				whileHover={onClick ? { scale: 1.1 } : {}}
				whileTap={onClick ? { scale: 0.95 } : {}}
				transition={{ type: 'spring', stiffness: 400, damping: 17 }}
				className={cn(
					`${config.container} rounded-2xl flex items-center justify-center
					${isLocked ? 'bg-muted/50' : bgColor}
					border-2 ${isFeatured ? 'border-brand-amber shadow-lg' : 'border-transparent'}
					transition-all duration-300`,
					isFeatured && 'shadow-brand-amber/20'
				)}
			>
				<span
					className={cn(`${config.icon}`, isLocked && 'grayscale opacity-50')}
					aria-hidden="true"
				>
					{isLocked ? lockedIcon : achievement.icon}
				</span>

				{isFeatured && (
					<div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-amber rounded-full flex items-center justify-center shadow-md">
						<HugeiconsIcon icon={CrownIcon} className="w-3 h-3 text-white" />
					</div>
				)}
			</m.div>

			{showLabel && (
				<p
					className={cn(
						`${config.label} font-black text-center mt-2 max-w-[80px] truncate`,
						isLocked ? 'text-muted-foreground' : 'text-foreground'
					)}
				>
					{achievement.name}
				</p>
			)}

			{showPoints && achievement.points !== undefined && (
				<div className="flex items-center gap-0.5 mt-1">
					<HugeiconsIcon
						icon={StarIcon}
						className={cn(
							`${config.points}`,
							isLocked ? 'text-muted-foreground' : 'text-brand-amber'
						)}
					/>
					<span
						className={cn(
							`${config.points} font-black`,
							isLocked ? 'text-muted-foreground' : 'text-brand-amber'
						)}
					>
						{achievement.points}
					</span>
				</div>
			)}
		</>
	);

	if (onClick) {
		return (
			<div className={cn('', className)}>
				<Button
					type="button"
					variant="ghost"
					onClick={onClick}
					className="flex flex-col items-center p-0 h-auto"
				>
					{content}
				</Button>
			</div>
		);
	}

	return <div className={cn('flex flex-col items-center', className)}>{content}</div>;
});

interface AchievementBadgeGridProps {
	achievements: Achievement[];
	lockedAchievements?: Achievement[];
	maxVisible?: number;
	size?: 'sm' | 'md' | 'lg';
	showLabels?: boolean;
	showPoints?: boolean;
	featuredIds?: string[];
	className?: string;
}

export const AchievementBadgeGrid = memo(function AchievementBadgeGrid({
	achievements,
	lockedAchievements = [],
	maxVisible,
	size = 'md',
	showLabels = false,
	showPoints = false,
	featuredIds = [],
	className,
}: AchievementBadgeGridProps) {
	const allAchievements = [...achievements, ...lockedAchievements];
	const visibleAchievements = maxVisible ? allAchievements.slice(0, maxVisible) : allAchievements;

	const lockedIds = new Set(lockedAchievements.map((a) => a.id));

	return (
		<div className={cn('flex flex-wrap items-center gap-3 sm:gap-4', className)}>
			{visibleAchievements.map((achievement, index) => (
				<m.div
					key={achievement.id}
					initial={{ scale: 0.8, opacity: 0, y: 10 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					transition={{
						delay: index * 0.05,
						type: 'spring',
						stiffness: 400,
						damping: 17,
					}}
				>
					<AchievementBadge
						achievement={achievement}
						size={size}
						showLabel={showLabels}
						showPoints={showPoints}
						isFeatured={featuredIds.includes(achievement.id)}
						isLocked={lockedIds.has(achievement.id)}
					/>
				</m.div>
			))}
		</div>
	);
});

export default AchievementBadge;

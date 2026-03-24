'use client';

import { FireIcon, Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
	rank: number;
	userId: string;
	userName: string;
	userImage?: string | null;
	totalPoints: number;
	questionsCompleted?: number;
	accuracyPercentage?: number;
	streak?: number;
}

interface LeaderboardRowProps {
	entry: LeaderboardEntry;
	isCurrentUser?: boolean;
	showDetails?: boolean;
	formatPoints?: (points: number) => string;
	compact?: boolean;
	className?: string;
	onClick?: () => void;
}

export const LeaderboardRow = memo(function LeaderboardRow({
	entry,
	isCurrentUser = false,
	showDetails = true,
	formatPoints = (p) => p.toLocaleString(),
	compact = false,
	className,
	onClick,
}: LeaderboardRowProps) {
	const isTopThree = entry.rank <= 3;

	const rankColors = {
		1: 'bg-primary-orange text-white',
		2: 'bg-muted-foreground text-white',
		3: 'bg-primary-cyan text-white',
	};

	const content = (
		<m.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: entry.rank * 0.03 }}
			className={cn(
				'flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-5',
				'hover:bg-muted/50 transition-all group cursor-pointer rounded-2xl sm:rounded-3xl',
				isCurrentUser && 'bg-primary-orange/10 border border-primary-orange/30',
				className
			)}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
		>
			<span
				className={cn(
					'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
					'font-black text-xs sm:text-sm text-center',
					isTopThree ? rankColors[entry.rank as keyof typeof rankColors] : 'text-muted-foreground',
					'group-hover:text-primary transition-colors'
				)}
			>
				{entry.rank}
			</span>

			<Avatar
				className={cn(
					'border-2 border-border shadow-sm transition-transform',
					compact
						? 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl'
						: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
					'group-hover:scale-105',
					isTopThree && entry.rank === 1 && 'border-primary-orange',
					isCurrentUser && 'border-primary-orange'
				)}
			>
				<AvatarImage
					src={entry.userImage || undefined}
					className="object-cover"
					alt={entry.userName}
				/>
				<AvatarFallback className="font-black text-sm sm:text-base">
					{entry.userName?.[0] || '?'}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 min-w-0">
				<h4
					className={cn(
						'font-black text-foreground truncate tracking-tight',
						compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
					)}
				>
					{entry.userName}
					{isCurrentUser && (
						<span className="ml-2 text-[9px] sm:text-[10px] font-black  bg-primary-orange text-white px-2 py-0.5 rounded-full">
							You
						</span>
					)}
				</h4>
				{showDetails && (
					<p
						className={cn(
							'font-black  tracking-widest flex items-center gap-1 sm:gap-2',
							compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]',
							'text-muted-foreground'
						)}
					>
						<HugeiconsIcon icon={Medal01Icon} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
						{entry.questionsCompleted ?? 0} questions
						{entry.streak !== undefined && entry.streak > 0 && (
							<>
								<span className="mx-1">·</span>
								<HugeiconsIcon
									icon={FireIcon}
									className="w-3 h-3 text-primary-orange fill-primary-orange"
								/>
								<span className="text-primary-orange">{entry.streak}d</span>
							</>
						)}
					</p>
				)}
			</div>

			<div className="text-right shrink-0">
				<p
					className={cn(
						'font-black tracking-tighter',
						compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
						isTopThree && entry.rank === 1 ? 'text-primary-orange' : 'text-foreground'
					)}
				>
					{formatPoints(entry.totalPoints)}{' '}
					<span
						className={cn(
							'text-[9px] sm:text-[10px]',
							isTopThree && entry.rank === 1 ? '' : 'text-muted-foreground'
						)}
					>
						KP
					</span>
				</p>
				{showDetails && entry.accuracyPercentage !== undefined && (
					<div className="flex items-center justify-end gap-1 mt-0.5">
						<div className="w-1 h-1 rounded-full bg-accent-lime" />
						<p
							className={cn(
								'text-[8px] sm:text-[9px] font-black text-accent-lime  tracking-widest'
							)}
						>
							{entry.accuracyPercentage}% accuracy
						</p>
					</div>
				)}
			</div>
		</m.div>
	);

	return content;
});

interface LeaderboardListProps {
	entries: LeaderboardEntry[];
	currentUserId?: string;
	showDetails?: boolean;
	formatPoints?: (points: number) => string;
	compact?: boolean;
	className?: string;
	onEntryClick?: (entry: LeaderboardEntry) => void;
}

export const LeaderboardList = memo(function LeaderboardList({
	entries,
	currentUserId,
	showDetails = true,
	formatPoints,
	compact = false,
	className,
	onEntryClick,
}: LeaderboardListProps) {
	return (
		<div className={cn('grid grid-cols-1 gap-1', className)}>
			{entries.map((entry) => (
				<LeaderboardRow
					key={entry.userId}
					entry={entry}
					isCurrentUser={entry.userId === currentUserId}
					showDetails={showDetails}
					formatPoints={formatPoints}
					compact={compact}
					onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
				/>
			))}
		</div>
	);
});

export default LeaderboardRow;

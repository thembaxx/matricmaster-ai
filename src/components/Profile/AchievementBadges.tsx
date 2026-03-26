'use client';

import { LockIcon, StarIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { ACHIEVEMENTS } from '@/lib/content-adapter';

interface AchievementBadgesProps {
	unlockedIds: string[];
	className?: string;
}

export const AchievementBadges = memo(function AchievementBadges({
	unlockedIds,
	className = '',
}: AchievementBadgesProps) {
	const unlockedSet = new Set(unlockedIds);

	return (
		<div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 ${className}`}>
			{ACHIEVEMENTS.map((achievement, index) => {
				const isUnlocked = unlockedSet.has(achievement.id);
				return (
					<m.div
						key={achievement.id}
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.02 }}
						className="group relative"
					>
						<div
							className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-300 ${
								isUnlocked
									? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-brand-amber/30 shadow-lg shadow-brand-amber/10'
									: 'bg-muted/50 border-2 border-dashed border-muted-foreground/20 opacity-50'
							}`}
						>
							<div
								className={`text-2xl mb-1 transition-transform duration-300 ${
									isUnlocked ? 'group-hover:scale-110' : 'grayscale'
								}`}
							>
								{achievement.icon}
							</div>

							{isUnlocked ? (
								<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
									<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-white" />
								</div>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
									<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground" />
								</div>
							)}

							{achievement.points > 0 && isUnlocked && (
								<div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-amber rounded-full">
									<HugeiconsIcon icon={StarIcon} className="w-2.5 h-2.5 text-white" />
									<span className="text-[8px] font-black text-white">{achievement.points}</span>
								</div>
							)}
						</div>

						<div className="mt-1.5 text-center">
							<p
								className={`text-[9px] font-bold truncate ${
									isUnlocked ? 'text-foreground' : 'text-muted-foreground'
								}`}
							>
								{achievement.name}
							</p>
						</div>

						<div
							className={`absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${
								isUnlocked ? '' : 'hidden'
							}`}
						>
							<p className="font-bold">{achievement.name}</p>
							<p className="text-muted-foreground text-[10px]">{achievement.description}</p>
							<p className="text-brand-amber font-bold mt-1">+{achievement.points} XP</p>
						</div>
					</m.div>
				);
			})}
		</div>
	);
});

export const AchievementBadgesCompact = memo(function AchievementBadgesCompact({
	unlockedIds,
}: {
	unlockedIds: string[];
}) {
	const unlockedSet = new Set(unlockedIds);
	const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).slice(0, 6);
	const remainingCount = unlockedSet.size - 6;

	if (unlockedAchievements.length === 0) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<HugeiconsIcon icon={LockIcon} className="w-4 h-4" />
				<span className="text-xs font-medium">No achievements yet</span>
			</div>
		);
	}

	return (
		<div className="flex items-center">
			{unlockedAchievements.map((achievement, index) => (
				<m.div
					key={achievement.id}
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: index * 0.05 }}
					className="-ml-2 first:ml-0 relative"
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-md"
						style={{ backgroundColor: achievement.iconBg }}
					>
						<span className="text-lg">{achievement.icon}</span>
					</div>
				</m.div>
			))}
			{remainingCount > 0 && (
				<div className="-ml-2 w-10 h-10 rounded-full flex items-center justify-center bg-muted border-2 border-background shadow-md">
					<span className="text-xs font-black text-muted-foreground">+{remainingCount}</span>
				</div>
			)}
		</div>
	);
});

export const AchievementProgress = memo(function AchievementProgress({
	unlockedIds,
}: {
	unlockedIds: string[];
}) {
	const unlockedSet = new Set(unlockedIds);
	const total = ACHIEVEMENTS.length;
	const unlocked = unlockedSet.size;
	const percentage = Math.round((unlocked / total) * 100);

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-bold text-foreground">Achievements</span>
				<span className="text-sm font-bold text-muted-foreground">
					{unlocked}/{total}
				</span>
			</div>
			<div className="h-2 bg-muted rounded-full overflow-hidden">
				<m.div
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="h-full bg-gradient-to-r from-brand-amber to-orange-400 rounded-full"
				/>
			</div>
			<p className="text-xs text-muted-foreground text-right">{percentage}% complete</p>
		</div>
	);
});

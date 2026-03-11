'use client';

import { CheckmarkCircle01Icon as Check, Lock01Icon as Lock, StarIcon as Star } from 'hugeicons-react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { ACHIEVEMENTS } from '@/constants/achievements';

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
		<div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6", className)}>
			{ACHIEVEMENTS.map((achievement, index) => {
				const isUnlocked = unlockedSet.has(achievement.id);
				return (
					<m.div
						key={achievement.id}
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{ delay: index * 0.02, type: 'spring' }}
						className="group relative"
					>
						<div
							className={cn(
								"relative aspect-square rounded-[2rem] flex flex-col items-center justify-center p-4 transition-all duration-500",
								isUnlocked
									? 'bg-white dark:bg-zinc-900 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2'
									: 'bg-muted/10 opacity-40 grayscale border-none'
							)}
						>
							<div
								className={cn(
									"text-4xl mb-2 transition-transform duration-500",
									isUnlocked ? 'group-hover:scale-125 group-hover:rotate-6' : ''
								)}
							>
								{achievement.icon}
							</div>

							{isUnlocked ? (
								<div className="absolute -top-2 -right-2 w-8 h-8 bg-tiimo-green text-white rounded-xl flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-900 scale-0 group-hover:scale-100 transition-transform">
									<Check size={14} className="stroke-[3px]" />
								</div>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<Lock size={20} className="text-muted-foreground/30 stroke-[3px]" />
								</div>
							)}

							{achievement.points > 0 && isUnlocked && (
								<div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-3 py-1 bg-tiimo-orange text-white rounded-xl shadow-lg border-4 border-white dark:border-zinc-900">
									<Star size={10} className="stroke-[3px] fill-white/20" />
									<span className="text-[8px] font-black uppercase">{achievement.points}</span>
								</div>
							)}
						</div>

						<div className="mt-3 text-center">
							<p
								className={cn(
									"text-[10px] font-black uppercase tracking-widest truncate",
									isUnlocked ? 'text-foreground' : 'text-muted-foreground/40'
								)}
							>
								{achievement.name}
							</p>
						</div>

						<div
							className={cn(
								"absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-4 px-5 py-4 bg-white dark:bg-zinc-800 text-foreground rounded-2xl shadow-2xl border-none opacity-0 group-hover:opacity-100 transition-all pointer-events-none min-w-[200px] scale-90 group-hover:scale-100",
								isUnlocked ? '' : 'hidden'
							)}
						>
							<p className="font-black text-lg tracking-tight mb-1">{achievement.name}</p>
							<p className="text-muted-foreground font-bold text-xs leading-relaxed">{achievement.description}</p>
							<div className="mt-3 flex items-center gap-2 text-tiimo-orange font-black text-[10px] uppercase tracking-widest">
								<Star size={12} className="stroke-[3px]" />
								Worth {achievement.points} Mastery Points
							</div>
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
				<Lock className="w-4 h-4" />
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
		<div className="space-y-4">
			<div className="flex items-end justify-between">
				<div className="space-y-1">
					<span className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Collection Progress</span>
					<div className="text-2xl font-black text-foreground leading-none">
						{unlocked} <span className="text-muted-foreground/40">/ {total}</span>
					</div>
				</div>
				<span className="text-xl font-black text-primary">{percentage}%</span>
			</div>
			<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
				<m.div
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 1, type: 'spring', damping: 20 }}
					className="h-full bg-linear-to-r from-primary to-tiimo-purple rounded-full shadow-lg"
				/>
			</div>
		</div>
	);
});

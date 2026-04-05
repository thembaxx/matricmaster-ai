'use client';

import { ChampionIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';

interface AchievementUnlockedProps {
	achievement: string | null;
}

export const AchievementUnlocked = memo(function AchievementUnlocked({
	achievement,
}: AchievementUnlockedProps) {
	if (!achievement) return null;

	return (
		<AnimatePresence>
			<m.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.8 }}
				transition={{ delay: 0.5 }}
				className="w-full max-w-md space-y-3 mb-8"
			>
				<h3 className="text-lg font-black text-foreground text-left ml-1 flex items-center gap-2  tracking-tight">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary-orange" />
					Rewards Unlocked
				</h3>
				<div className="bg-card p-6 rounded-[2rem] flex items-center gap-5 shadow-soft-lg border border-primary-orange/20">
					<div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-accent-pink rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
						<HugeiconsIcon icon={ChampionIcon} className="w-8 h-8 text-white" />
					</div>
					<div className="flex-1">
						<p className="text-[10px] font-black text-primary-orange  tracking-widest mb-0.5 opacity-80">
							New Achievement
						</p>
						<h4 className="text-xl font-bold text-foreground">Achievement Unlocked!</h4>
						<p className="text-sm text-muted-foreground font-medium">
							Keep learning to unlock more
						</p>
					</div>
				</div>
			</m.div>
		</AnimatePresence>
	);
});

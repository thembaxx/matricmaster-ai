'use client';

import { ChampionIcon, FireIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface StatsCardsProps {
	streak: number;
	accuracy: number;
}

export const StatsCards = memo(function StatsCards({ streak, accuracy }: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-8 shadow-tiimo border-border/50 flex flex-col justify-between relative overflow-hidden tiimo-press group">
					<div className="absolute top-0 left-0 w-2 h-full bg-tiimo-yellow opacity-40" />
					<div className="space-y-4 relative z-10">
						<div className="flex items-center gap-3">
							<m.div
								whileHover={{ scale: 1.1, rotate: 12 }}
								className="w-12 h-12 bg-tiimo-yellow/15 rounded-2xl flex items-center justify-center"
							>
								<HugeiconsIcon icon={FireIcon} className="w-7 h-7 text-tiimo-yellow" />
							</m.div>
							<span className="text-base font-bold text-foreground tracking-tight">
								Current Streak
							</span>
						</div>
						<div className="flex items-baseline gap-2">
							<m.span
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="text-4xl font-black text-foreground tracking-tighter"
							>
								{streak}
							</m.span>
							<span className="text-sm font-bold text-tiimo-gray-muted  tracking-widest">Days</span>
						</div>
					</div>
				</Card>
			</m.div>

			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-8 shadow-tiimo border-border/50 flex flex-col justify-between relative overflow-hidden tiimo-press group">
					<div className="absolute top-0 left-0 w-2 h-full bg-tiimo-lavender opacity-40" />
					<div className="space-y-4 relative z-10">
						<div className="flex items-center gap-3">
							<m.div
								whileHover={{ scale: 1.1, rotate: -12 }}
								className="w-12 h-12 bg-tiimo-lavender/15 rounded-2xl flex items-center justify-center"
							>
								<HugeiconsIcon icon={ChampionIcon} className="w-7 h-7 text-tiimo-lavender" />
							</m.div>
							<span className="text-base font-bold text-foreground tracking-tight">
								Overall Mastery
							</span>
						</div>
						<div className="flex items-baseline gap-2">
							<m.span
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="text-4xl font-black text-foreground tracking-tighter"
							>
								{accuracy}
							</m.span>
							<span className="text-sm font-bold text-tiimo-gray-muted  tracking-widest">
								Average
							</span>
						</div>
					</div>
				</Card>
			</m.div>
		</div>
	);
});

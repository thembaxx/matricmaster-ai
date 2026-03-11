'use client';

import { FireIcon as Fire, Trophy01Icon as Trophy } from 'hugeicons-react';
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
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-6 premium-glass border-none rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
					<m.div
						animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
						transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: [0.16, 1, 0.3, 1] }}
						className="absolute -right-3 -bottom-3 w-24 h-24 bg-brand-amber/15 rounded-full blur-xl pointer-events-none"
					/>
					<div className="space-y-2 relative z-10">
						<div className="flex items-center gap-2">
							<m.div
								whileHover={{ scale: 1.1, rotate: 12 }}
								className="w-10 h-10 bg-brand-amber/15 rounded-xl flex items-center justify-center border border-brand-amber/25"
							>
								<Fire className="w-5 h-5 text-brand-amber fill-brand-amber stroke-[3]" />
							</m.div>
							<span className="text-sm font-semibold text-foreground">Study Streak</span>
						</div>
						<div className="mt-3">
							<m.span
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="text-3xl font-bold text-foreground"
							>
								{streak}
							</m.span>
							<span className="text-sm text-muted-foreground ml-2">days</span>
						</div>
					</div>
				</Card>
			</m.div>

			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-6 premium-glass border-none rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
					<m.div
						animate={{ scale: [1.15, 1, 1.15], rotate: [0, -8, 0] }}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: [0.16, 1, 0.3, 1] }}
						className="absolute -right-3 -bottom-3 w-24 h-24 bg-primary/15 rounded-full blur-xl pointer-events-none"
					/>
					<div className="space-y-2 relative z-10">
						<div className="flex items-center gap-2">
							<m.div
								whileHover={{ scale: 1.1, rotate: -12 }}
								className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/25"
							>
								<Trophy className="w-5 h-5 text-primary stroke-[3]" />
							</m.div>
							<span className="text-sm font-semibold text-foreground">Accuracy</span>
						</div>
						<div className="mt-3">
							<m.span
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="text-3xl font-bold text-foreground"
							>
								{accuracy}
							</m.span>
							<span className="text-sm text-muted-foreground ml-2">average</span>
						</div>
					</div>
				</Card>
			</m.div>
		</div>
	);
});

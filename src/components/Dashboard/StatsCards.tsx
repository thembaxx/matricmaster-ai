'use client';

import { m } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface StatsCardsProps {
	streak: number;
	accuracy: number;
}

export const StatsCards = memo(function StatsCards({ streak, accuracy }: StatsCardsProps) {
	return (
		<div className="flex flex-col gap-6">
			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-6 premium-glass border-none rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
					<m.div
						animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
						className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl pointer-events-none"
					/>
					<div className="space-y-1 relative z-10">
						<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
							Current Streak
						</p>
						<div className="flex items-baseline gap-2">
							<m.span
								initial={{ scale: 0.5 }}
								animate={{ scale: 1 }}
								className="text-4xl font-black text-foreground"
							>
								{streak}
							</m.span>
							<span className="text-muted-foreground font-black text-xs">DAYS</span>
						</div>
					</div>
					<div className="mt-6 relative z-10 self-start">
						<m.div
							whileHover={{ scale: 1.2, rotate: 15 }}
							className="w-12 h-12 bg-brand-amber/10 rounded-2xl flex items-center justify-center border border-brand-amber/20"
						>
							<Flame className="w-6 h-6 text-brand-amber fill-brand-amber" />
						</m.div>
					</div>
				</Card>
			</m.div>

			<m.div variants={STAGGER_ITEM} className="flex-1">
				<Card className="h-full p-6 premium-glass border-none rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
					<m.div
						animate={{ scale: [1.2, 1, 1.2], rotate: [0, -5, 0] }}
						transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
						className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"
					/>
					<div className="space-y-1 relative z-10">
						<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
							Accuracy Rate
						</p>
						<div className="flex items-baseline gap-2">
							<m.span
								initial={{ scale: 0.5 }}
								animate={{ scale: 1 }}
								className="text-4xl font-black text-foreground"
							>
								{accuracy}
							</m.span>
							<span className="text-muted-foreground font-black text-xs">%</span>
						</div>
					</div>
					<div className="mt-6 relative z-10 self-start">
						<m.div
							whileHover={{ scale: 1.2, rotate: -15 }}
							className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"
						>
							<Trophy className="w-6 h-6 text-primary" />
						</m.div>
					</div>
				</Card>
			</m.div>
		</div>
	);
});

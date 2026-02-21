'use client';

import { m } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface DayProgress {
	day: string;
	date: number;
	status: 'complete' | 'active' | 'idle';
}

interface WeeklyChartCardProps {
	weekProgress: DayProgress[];
}

export function WeeklyChartCard({ weekProgress }: WeeklyChartCardProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="lg:col-span-2">
			<Card className="p-8 premium-glass border-none rounded-[2.5rem] h-full flex flex-col justify-between">
				<div className="flex justify-between items-center mb-8">
					<h3 className="text-xl font-black text-foreground tracking-tight uppercase">
						Weekly Activity
					</h3>
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 rounded-full bg-primary" />
						<span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
							Today
						</span>
					</div>
				</div>
				<div className="grid grid-cols-7 gap-3 sm:gap-4 flex-1 items-end pt-4">
					{weekProgress.map((item) => (
						<m.div
							key={item.day}
							variants={STAGGER_ITEM}
							className="flex flex-col items-center gap-4 group"
						>
							<span
								className={`text-[10px] font-black tracking-widest ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground opacity-40'}`}
							>
								{item.day}
							</span>
							<m.div
								whileHover={{ scale: 1.05, y: -5 }}
								whileTap={{ scale: 0.95 }}
								className={`w-full aspect-square max-w-[60px] rounded-[1.5rem] flex items-center justify-center transition-all duration-300 cursor-pointer ${
									item.status === 'complete'
										? 'bg-primary/10 text-primary border border-primary/10'
										: item.status === 'active'
											? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/40'
											: 'bg-muted/50 text-muted-foreground/30'
								}`}
							>
								{item.status === 'complete' ? (
									<Check className="w-6 h-6 stroke-[4px]" />
								) : (
									<span className="text-sm font-black">{item.date}</span>
								)}
							</m.div>
						</m.div>
					))}
				</div>
			</Card>
		</m.div>
	);
}

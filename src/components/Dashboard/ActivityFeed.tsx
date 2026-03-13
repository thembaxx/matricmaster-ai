'use client';

import { BookOpen01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getRecentActivityAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
	const [activities, setActivities] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const data = await getRecentActivityAction();
			setActivities(data);
			setIsLoading(false);
		}
		load();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-4 animate-pulse">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-20 bg-muted/50 rounded-3xl" />
				))}
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<Card className="p-8 text-center border-dashed border-2 bg-muted/10 rounded-[2.5rem]">
				<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
					No recent activity found
				</p>
				<p className="text-xs text-muted-foreground/60 mt-1 uppercase">
					Start studying to see your feed!
				</p>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{activities.map((act, index) => {
				const date = new Date(act.completedAt);
				const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

				return (
					<m.div
						key={act.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="p-5 border border-border/50 shadow-tiimo rounded-[2rem] hover:shadow-tiimo-lg transition-all group overflow-hidden relative">
							<div className="flex items-center gap-4 relative z-10">
								<div
									className={cn(
										'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
										act.sessionType === 'quiz'
											? 'bg-primary/10 text-primary'
											: 'bg-success/10 text-success'
									)}
								>
									<HugeiconsIcon
										icon={act.sessionType === 'quiz' ? CheckmarkCircle02Icon : BookOpen01Icon}
										className="w-6 h-6"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-0.5">
										<h4 className="font-bold text-sm truncate uppercase tracking-tight">
											{act.sessionType === 'quiz' ? 'Completed Quiz' : 'Study Session'}
										</h4>
										<span className="text-[10px] font-black text-muted-foreground/60 uppercase">
											{timeStr}
										</span>
									</div>
									<p className="text-xs text-muted-foreground font-medium truncate">
										{act.subjectName || 'General'} • Earned{' '}
										<span className="text-primary font-black">+{act.marksEarned} XP</span>
									</p>
								</div>
							</div>
							<div className="absolute top-0 right-0 w-24 h-full bg-linear-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						</Card>
					</m.div>
				);
			})}
		</div>
	);
}

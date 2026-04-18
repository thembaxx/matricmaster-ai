'use client';

import {
	BookOpen01Icon,
	HelpCircleIcon,
	Layers02Icon,
	Medal01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DURATION, EASING, STAGGER } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

type ActivityType = 'quiz' | 'flashcard' | 'study' | 'achievement';

interface Activity {
	type: ActivityType;
	title: string;
	detail: string;
	timestamp: Date;
	icon: string;
}

interface ActivityStreamProps {
	activities: Activity[];
}

const ICON_MAP: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
	quiz: ({ className }) => (
		<HugeiconsIcon icon={HelpCircleIcon} className={cn('w-4 h-4', className)} />
	),
	flashcard: ({ className }) => (
		<HugeiconsIcon icon={Layers02Icon} className={cn('w-4 h-4', className)} />
	),
	study: ({ className }) => (
		<HugeiconsIcon icon={BookOpen01Icon} className={cn('w-4 h-4', className)} />
	),
	achievement: ({ className }) => (
		<HugeiconsIcon icon={Medal01Icon} className={cn('w-4 h-4', className)} />
	),
};

const COLOR_MAP: Record<ActivityType, string> = {
	quiz: 'bg-primary/10 text-primary',
	flashcard: 'bg-tiimo-green/10 text-tiimo-green',
	study: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	achievement: 'bg-tiimo-yellow/10 text-tiimo-yellow',
};

function groupByDate(activities: Activity[]): Map<string, Activity[]> {
	const groups = new Map<string, Activity[]>();
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterdayStart = new Date(todayStart.getTime() - 86400000);
	const lastWeekStart = new Date(todayStart.getTime() - 7 * 86400000);

	for (const activity of activities) {
		const ts = activity.timestamp.getTime();
		let label: string;
		if (ts >= todayStart.getTime()) {
			label = 'Today';
		} else if (ts >= yesterdayStart.getTime()) {
			label = 'Yesterday';
		} else if (ts >= lastWeekStart.getTime()) {
			label = 'Last Week';
		} else {
			label = activity.timestamp.toLocaleDateString('en-ZA', {
				day: 'numeric',
				month: 'short',
			});
		}
		if (!groups.has(label)) groups.set(label, []);
		groups.get(label)!.push(activity);
	}

	return groups;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString('en-ZA', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

export function ActivityStream({ activities }: ActivityStreamProps) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (activities.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-bold">Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<m.div
						initial={prefersReducedMotion ? {} : { opacity: 0 }}
						animate={prefersReducedMotion ? {} : { opacity: 1 }}
						className="text-center py-8"
					>
						<div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
							<HugeiconsIcon icon={BookOpen01Icon} className="w-6 h-6 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium mb-1">Your story begins here</p>
						<p className="text-xs text-muted-foreground">
							Start studying to see your activity timeline
						</p>
					</m.div>
				</CardContent>
			</Card>
		);
	}

	const groups = groupByDate(activities);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-bold">Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<AnimatePresence>
						{Array.from(groups.entries()).map(([dateLabel, items], groupIdx) => (
							<m.div
								key={dateLabel}
								initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
								animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
								transition={{
									delay: groupIdx * STAGGER.NORMAL,
									duration: DURATION.normal,
									ease: EASING.easeOut,
								}}
							>
								<p className="text-xs font-medium text-muted-foreground mb-2 font-numeric">
									{dateLabel}
								</p>
								<div className="space-y-2">
									{items.map((activity, idx) => {
										const Icon = ICON_MAP[activity.type];
										return (
											<m.div
												key={`${dateLabel}-${idx}`}
												initial={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
												animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
												transition={{
													delay: groupIdx * STAGGER.NORMAL + idx * STAGGER.FAST,
													duration: DURATION.quick,
													ease: EASING.easeOut,
												}}
												className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
											>
												<div
													className={cn(
														'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
														COLOR_MAP[activity.type]
													)}
												>
													<Icon />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{activity.title}</p>
													<p className="text-xs text-muted-foreground truncate">
														{activity.detail}
													</p>
												</div>
												<span className="text-xs font-numeric text-muted-foreground shrink-0">
													{formatTime(activity.timestamp)}
												</span>
											</m.div>
										);
									})}
								</div>
							</m.div>
						))}
					</AnimatePresence>
				</div>
			</CardContent>
		</Card>
	);
}

export function ActivityStreamSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-bold">Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-start gap-3">
							<Skeleton className="w-8 h-8 rounded-lg shrink-0" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-3 w-10 shrink-0" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

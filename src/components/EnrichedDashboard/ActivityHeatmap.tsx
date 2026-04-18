'use client';

import { motion as m } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
	timeline: { date: string; count: number }[];
	totalDays: number;
}

function getActivityColor(count: number): string {
	if (count === 0) return 'bg-muted/40';
	if (count <= 2) return 'bg-primary/30';
	if (count <= 5) return 'bg-primary/60';
	return 'bg-primary';
}

function formatDateLabel(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function getDayOfWeek(dateStr: string): number {
	return new Date(dateStr).getDay();
}

export function ActivityHeatmap({ timeline, totalDays }: ActivityHeatmapProps) {
	const dataByDate = new Map(timeline.map((entry) => [entry.date, entry.count]));

	const today = new Date();
	const sixMonthsAgo = new Date(today);
	sixMonthsAgo.setMonth(today.getMonth() - 6);

	const days: { date: string; count: number }[] = [];
	const current = new Date(sixMonthsAgo);
	while (current <= today) {
		const dateStr = current.toISOString().split('T')[0];
		days.push({ date: dateStr, count: dataByDate.get(dateStr) ?? 0 });
		current.setDate(current.getDate() + 1);
	}

	const weeks: { date: string; count: number }[][] = [];
	let currentWeek: { date: string; count: number }[] = [];

	days.forEach((day) => {
		const dayOfWeek = getDayOfWeek(day.date);
		if (dayOfWeek === 0 && currentWeek.length > 0) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
		currentWeek.push(day);
	});
	if (currentWeek.length > 0) {
		weeks.push(currentWeek);
	}

	const totalActivity = timeline.reduce((sum, entry) => sum + entry.count, 0);

	const monthLabels: { label: string; weekIndex: number }[] = [];
	let lastMonth = -1;
	weeks.forEach((week, idx) => {
		if (week.length > 0) {
			const month = new Date(week[0].date).getMonth();
			if (month !== lastMonth) {
				monthLabels.push({
					label: new Date(week[0].date).toLocaleDateString('en-ZA', { month: 'short' }),
					weekIndex: idx,
				});
				lastMonth = month;
			}
		}
	});

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-bold">Study Activity</CardTitle>
				<p className="text-sm text-muted-foreground">
					{totalActivity} activities over {totalDays} days
				</p>
			</CardHeader>
			<CardContent>
				<div role="img" aria-label={`${totalActivity} study activities over ${totalDays} days`}>
					<div className="hidden sm:block">
						<div className="flex gap-1 mb-2">
							{monthLabels.map(({ label, weekIndex }) => (
								<div
									key={weekIndex}
									className="text-xs font-numeric text-muted-foreground"
									style={{ marginLeft: weekIndex === 0 ? 0 : undefined }}
								>
									{label}
								</div>
							))}
						</div>
						<div className="flex gap-[3px] overflow-x-auto pb-2">
							{weeks.map((week, weekIdx) => (
								<div key={weekIdx} className="flex flex-col gap-[3px]">
									{Array.from({ length: 7 }).map((_, dayIdx) => {
										const day = week[dayIdx];
										if (!day) return <div key={dayIdx} className="w-[11px] h-[11px]" />;
										return (
											<TooltipProvider key={day.date}>
												<Tooltip>
													<TooltipTrigger asChild>
														<m.div
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															transition={{ delay: weekIdx * 0.01 }}
															className={cn(
																'w-[11px] h-[11px] rounded-sm cursor-pointer',
																getActivityColor(day.count)
															)}
														/>
													</TooltipTrigger>
													<TooltipContent side="top" className="text-xs">
														<p className="font-numeric">
															{formatDateLabel(day.date)}: {day.count} activities
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										);
									})}
								</div>
							))}
						</div>
					</div>

					<div className="sm:hidden">
						<div className="flex gap-[2px] overflow-x-auto pb-2">
							{weeks.slice(-12).map((week, weekIdx) => {
								const weekTotal = week.reduce((sum, d) => sum + d.count, 0);
								return (
									<TooltipProvider key={weekIdx}>
										<Tooltip>
											<TooltipTrigger asChild>
												<m.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: weekIdx * 0.02 }}
													className={cn(
														'w-[20px] h-[20px] rounded-sm cursor-pointer',
														getActivityColor(weekTotal)
													)}
												/>
											</TooltipTrigger>
											<TooltipContent side="top" className="text-xs">
												<p className="font-numeric">Week: {weekTotal} activities</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								);
							})}
						</div>
					</div>

					<div className="flex items-center gap-1.5 mt-3 justify-end">
						<span className="text-xs text-muted-foreground">Less</span>
						<div className="flex gap-[3px]">
							<div className="w-[11px] h-[11px] rounded-sm bg-muted/40" />
							<div className="w-[11px] h-[11px] rounded-sm bg-primary/30" />
							<div className="w-[11px] h-[11px] rounded-sm bg-primary/60" />
							<div className="w-[11px] h-[11px] rounded-sm bg-primary" />
						</div>
						<span className="text-xs text-muted-foreground">More</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

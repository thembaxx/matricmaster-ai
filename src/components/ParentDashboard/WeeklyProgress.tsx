'use client';

import {
	ArrowUp01Icon,
	CheckmarkCircle01Icon,
	Layers01Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

export function WeeklyProgress() {
	const { data, isLoading } = useQuery({
		queryKey: ['parent-weekly-progress'],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			return json.weeklyProgress;
		},
		staleTime: 5 * 60 * 1000,
	});

	const dailyMinutes = data?.dailyMinutes ?? Array.from({ length: 7 }, () => 0);
	const maxMinutes = Math.max(...dailyMinutes, 60);
	const totalMinutes = dailyMinutes.reduce((a: number, b: number) => a + b, 0);

	const tasksCompleted = data?.tasksCompleted ?? 0;
	const tasksPlanned = data?.tasksPlanned ?? 0;
	const quizTrend = data?.quizTrend ?? [];
	const flashcardStreak = data?.flashcardStreak ?? 0;

	return (
		<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
			<CardHeader className="bg-muted/30 px-8 py-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
						<HugeiconsIcon icon={ArrowUp01Icon} className="w-5 h-5 text-primary" />
					</div>
					<CardTitle className="text-lg font-black tracking-tight">Weekly Progress</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-6">
				{isLoading ? (
					<div className="space-y-4">
						<div className="h-32 bg-muted animate-pulse rounded-2xl" />
						<div className="h-20 bg-muted animate-pulse rounded-2xl" />
					</div>
				) : (
					<>
						<div>
							<div className="flex justify-between items-end mb-3">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
									Study Time (daily)
								</p>
								<p className="text-xs font-bold text-muted-foreground">
									Total: {formatTime(totalMinutes)}
								</p>
							</div>
							<div className="flex items-end gap-2 h-28">
								{dailyMinutes.map((mins: number, idx: number) => {
									const heightPct = maxMinutes > 0 ? (mins / maxMinutes) * 100 : 0;
									const isToday = idx === dailyMinutes.length - 1;
									return (
										<div key={DAYS[idx]} className="flex-1 flex flex-col items-center gap-1">
											<span className="text-[9px] font-bold text-muted-foreground tabular-nums">
												{mins > 0 ? formatTime(mins) : '—'}
											</span>
											<div className="w-full relative flex-1 flex items-end">
												<div
													className={cn(
														'w-full rounded-t-lg transition-all duration-500',
														isToday ? 'bg-primary' : mins > 0 ? 'bg-primary/30' : 'bg-muted'
													)}
													style={{
														height: `${Math.max(heightPct, mins > 0 ? 15 : 5)}%`,
													}}
												/>
											</div>
											<span
												className={cn(
													'text-[10px] font-bold',
													isToday ? 'text-primary' : 'text-muted-foreground'
												)}
											>
												{DAYS[idx]}
											</span>
										</div>
									);
								})}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="p-4 bg-muted/30 rounded-2xl space-y-2">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-success" />
									<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
										Tasks
									</span>
								</div>
								<p className="text-lg font-black">
									{tasksCompleted}/{tasksPlanned}
								</p>
								<Progress
									value={tasksPlanned > 0 ? (tasksCompleted / tasksPlanned) * 100 : 0}
									className="h-1.5"
								/>
							</div>

							<div className="p-4 bg-muted/30 rounded-2xl space-y-2">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={Target01Icon} className="w-4 h-4 text-primary" />
									<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
										Quiz Trend
									</span>
								</div>
								<div className="flex items-end gap-1 h-8">
									{quizTrend.length > 0 ? (
										quizTrend.map((score: number, i: number) => (
											<div
												key={`score-${i}`}
												className="flex-1 rounded-sm bg-primary/60"
												style={{
													height: `${Math.max((score / 100) * 100, 10)}%`,
												}}
											/>
										))
									) : (
										<p className="text-xs text-muted-foreground">No data yet</p>
									)}
								</div>
							</div>

							<div className="p-4 bg-muted/30 rounded-2xl space-y-2">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 text-warning" />
									<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
										Flashcards
									</span>
								</div>
								<p className="text-lg font-black">{flashcardStreak}d</p>
								<p className="text-[9px] font-bold text-muted-foreground">review streak</p>
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

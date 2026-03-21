'use client';

import {
	ArrowUp01Icon,
	CheckmarkCircle01Icon,
	Layers01Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const ResponsiveContainer = dynamic(
	() => import('recharts').then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ value: number; payload: { day: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (active && payload?.length) {
		return (
			<div className="bg-background border border-border/50 rounded-lg px-3 py-2 shadow-xl">
				<p className="text-xs font-bold">{payload[0].payload.day}</p>
				<p className="text-sm font-black text-primary">{formatTime(payload[0].value)}</p>
			</div>
		);
	}
	return null;
}

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
	const totalMinutes = dailyMinutes.reduce((a: number, b: number) => a + b, 0);

	const tasksCompleted = data?.tasksCompleted ?? 0;
	const tasksPlanned = data?.tasksPlanned ?? 0;
	const quizTrend = data?.quizTrend ?? [];
	const flashcardStreak = data?.flashcardStreak ?? 0;

	const chartData = DAYS.map((day, idx) => ({
		day,
		minutes: dailyMinutes[idx] || 0,
	}));

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
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Study Time (daily)
								</p>
								<p className="text-xs font-bold text-muted-foreground">
									Total: {formatTime(totalMinutes)}
								</p>
							</div>
							<div className="h-32">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={chartData} barCategoryGap="20%">
										<XAxis
											dataKey="day"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--muted-foreground)' }}
											dy={8}
										/>
										<YAxis hide />
										<Tooltip
											content={<CustomTooltip />}
											cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
										/>
										<Bar
											dataKey="minutes"
											fill="var(--color-primary)"
											radius={[4, 4, 0, 0]}
											maxBarSize={40}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="p-4 bg-muted/30 rounded-2xl space-y-2">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-success" />
									<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
									<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Quiz Trend
									</span>
								</div>
								<div className="flex items-end gap-1 h-8">
									{quizTrend.length > 0 ? (
										quizTrend.map((score: number, i: number) => (
											<div
												key={`weekly-progress-trend-${score}-${i}`}
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
									<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Flashcards
									</span>
								</div>
								<p className="text-lg font-black">{flashcardStreak}d</p>
								<p className="text-xs font-bold text-muted-foreground">review streak</p>
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

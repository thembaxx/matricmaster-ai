import { ArrowDown01Icon, ArrowUp01Icon, ArrowUp02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyActivity } from './constants';

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

function getBarColor(minutes: number, maxMinutes: number): string {
	const percentage = (minutes / maxMinutes) * 100;
	if (percentage >= 75) return 'bg-green-500';
	if (percentage >= 40) return 'bg-primary';
	if (percentage > 0) return 'bg-primary/60';
	return 'bg-muted';
}

function calculateTrend(activity: DailyActivity[]): {
	direction: 'up' | 'down' | 'stable';
	percentage: number;
} {
	const recentDays = activity.slice(-3);
	const earlierDays = activity.slice(-7, -4);
	const recentAvg = recentDays.reduce((a, b) => a + b.studyMinutes, 0) / 3;
	const earlierAvg = earlierDays.reduce((a, b) => a + b.studyMinutes, 0) / 3;

	if (earlierAvg === 0) return { direction: 'stable', percentage: 0 };

	const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;

	if (change > 15) return { direction: 'up', percentage: Math.round(change) };
	if (change < -15) return { direction: 'down', percentage: Math.round(Math.abs(change)) };
	return { direction: 'stable', percentage: 0 };
}

function TrendIndicator({
	trend,
}: {
	trend: { direction: 'up' | 'down' | 'stable'; percentage: number };
}) {
	if (trend.direction === 'up') {
		return (
			<div className="flex items-center gap-1 text-green-500 text-xs font-medium">
				<HugeiconsIcon icon={ArrowUp01Icon} className="w-3 h-3" />
				<span>{trend.percentage}%</span>
			</div>
		);
	}
	if (trend.direction === 'down') {
		return (
			<div className="flex items-center gap-1 text-red-500 text-xs font-medium">
				<HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3" />
				<span>{trend.percentage}%</span>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
			<span>—</span>
		</div>
	);
}

export function WeeklyProgressChart({ activity }: { activity: DailyActivity[] }) {
	const maxMinutes = Math.max(...activity.map((d) => d.studyMinutes), 60);
	const totalMinutes = activity.reduce((a, b) => a + b.studyMinutes, 0);
	const avgMinutes = Math.round(totalMinutes / 7);
	const trend = calculateTrend(activity);

	const maxBarHeight = 160;

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<HugeiconsIcon icon={ArrowUp02Icon} className="w-5 h-5 text-primary" />
						<span>Weekly Progress</span>
					</CardTitle>
					<TrendIndicator trend={trend} />
				</div>
			</CardHeader>
			<CardContent>
				<div
					className="flex items-end justify-between gap-1 sm:gap-2 min-h-[140px] sm:min-h-[180px]"
					role="img"
					aria-label={`Weekly study progress: ${formatTime(totalMinutes)} total, ${formatTime(avgMinutes)} average daily`}
				>
					{activity.map((day) => (
						<div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
							<div
								className="w-full relative flex items-end justify-center"
								style={{ height: maxBarHeight }}
							>
								<div
									className={`w-full max-w-[40px] sm:max-w-[60px] rounded-t-md transition-all duration-300 group-hover:opacity-80 ${getBarColor(day.studyMinutes, maxMinutes)}`}
									style={{ height: `${Math.max((day.studyMinutes / maxMinutes) * 100, 4)}%` }}
									role="presentation"
								/>
								<div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded-md px-2 py-1 text-xs shadow-md whitespace-nowrap pointer-events-none z-10">
									<p className="font-medium">{formatTime(day.studyMinutes)}</p>
									<p className="text-muted-foreground text-[10px]">
										{day.xpEarned > 0 && `+${day.xpEarned} XP`}
									</p>
								</div>
							</div>
							<span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
								{day.date}
							</span>
						</div>
					))}
				</div>
				<div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-sm">
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">Total</span>
						<span className="font-bold tabular-nums">{formatTime(totalMinutes)}</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">Daily avg</span>
						<span className="font-bold tabular-nums">{formatTime(avgMinutes)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

import { ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyActivity } from './constants';

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

export function WeeklyProgressChart({ activity }: { activity: DailyActivity[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={ArrowUp01Icon} className="w-5 h-5" />
					Weekly Progress
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="min-h-[150px] max-h-[280px] flex items-end gap-2">
					{activity.map((day) => (
						<div key={day.date} className="flex-1 flex flex-col items-center gap-2">
							<div
								className="w-full bg-primary rounded-t"
								style={{ height: `${(day.studyMinutes / 150) * 100}%`, minHeight: '20px' }}
							/>
							<span className="text-xs text-muted-foreground">{day.date}</span>
						</div>
					))}
				</div>
				<div className="mt-4 flex justify-between text-sm text-muted-foreground">
					<span>Total: {formatTime(activity.reduce((a, b) => a + b.studyMinutes, 0))}</span>
					<span>
						Avg: {formatTime(Math.round(activity.reduce((a, b) => a + b.studyMinutes, 0) / 7))}
						/day
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

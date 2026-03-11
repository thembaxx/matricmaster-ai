'use client';

import { m } from 'framer-motion';
import { useSchedule } from '@/stores/useScheduleStore';
import { SUBJECTS } from '@/types/schedule';

export function NextTaskWidget() {
	const { currentTask } = useSchedule();

	if (!currentTask) {
		return (
			<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
				<div className="flex items-center gap-2 mb-2">
					<span className="text-lg">📅</span>
					<h3 className="font-medium text-sm text-muted-foreground">Next Task</h3>
				</div>
				<p className="text-muted-foreground text-sm">All done for today!</p>
			</div>
		);
	}

	const subject = SUBJECTS[currentTask.subject];

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50"
		>
			<div className="flex items-center gap-2 mb-2">
				<span className="text-lg">📅</span>
				<h3 className="font-medium text-sm text-muted-foreground">Next Task</h3>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-2xl">{subject?.emoji}</span>
				<div>
					<h4 className="font-medium text-foreground">{currentTask.title}</h4>
					<p className="text-sm text-muted-foreground">
						{currentTask.duration} min • {subject?.name}
					</p>
				</div>
			</div>
		</m.div>
	);
}

export function DailyProgressWidget() {
	const { tasks } = useSchedule();
	const completed = tasks.filter((t) => t.completed).length;
	const total = tasks.length;
	const progress = total > 0 ? (completed / total) * 100 : 0;

	return (
		<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<span className="text-lg">📊</span>
					<h3 className="font-medium text-sm text-muted-foreground">Today's Progress</h3>
				</div>
				<span className="text-sm font-medium">
					{completed}/{total}
				</span>
			</div>
			<div className="h-2 bg-muted rounded-full overflow-hidden">
				<m.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					className="h-full bg-primary rounded-full"
				/>
			</div>
		</div>
	);
}

export function StreakWidget() {
	return (
		<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
			<div className="flex items-center gap-2 mb-2">
				<span className="text-lg">🔥</span>
				<h3 className="font-medium text-sm text-muted-foreground">Streak</h3>
			</div>
			<div className="flex items-baseline gap-1">
				<span className="text-2xl font-bold">7</span>
				<span className="text-muted-foreground text-sm">days</span>
			</div>
		</div>
	);
}

'use client';

import { Card } from '@/components/ui/card';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

const PRIORITY_CONFIG = {
	high: {
		bg: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20',
		border: 'border-red-200 dark:border-red-800',
		accent: 'text-red-600 dark:text-red-400',
		badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
	},
	medium: {
		bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20',
		border: 'border-amber-200 dark:border-amber-800',
		accent: 'text-amber-600 dark:text-amber-400',
		badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
	},
	low: {
		bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20',
		border: 'border-green-200 dark:border-green-800',
		accent: 'text-green-600 dark:text-green-400',
		badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
	},
};

export function ExamCountdownPanel() {
	const { exams } = useSmartSchedulerStore();

	if (exams.length === 0) {
		return (
			<Card className="p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-3">
					<div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
					<h3 className="font-semibold text-sm tracking-tight">Exam Countdown</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-6 text-center">
					<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
						<svg
							className="w-6 h-6 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							role="img"
							aria-label="Calendar icon"
						>
							<title>Calendar</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
					<p className="text-xs text-muted-foreground/70 mt-1">
						Add your exam dates to get personalized recommendations.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-5 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
				<h3 className="font-semibold text-sm tracking-tight">Exam Countdown</h3>
			</div>
			<div className="space-y-3">
				{exams.map((exam) => {
					const config = PRIORITY_CONFIG[exam.priority];
					return (
						<div
							key={exam.id}
							className={cn(
								'p-4 rounded-xl border transition-all hover:shadow-md',
								config.bg,
								config.border
							)}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<div className="font-medium text-sm truncate">{exam.subject}</div>
									<div className="text-xs text-muted-foreground/70 mt-0.5">
										{exam.daysRemaining} days left
									</div>
								</div>
								<div
									className={cn(
										'flex flex-col items-center justify-center min-w-[48px] py-1 px-2 rounded-lg',
										config.badge
									)}
								>
									<span className="text-2xl font-bold leading-none">{exam.daysRemaining}</span>
									<span className="text-[10px] font-medium uppercase tracking-wide">days</span>
								</div>
							</div>
							<div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
								<div
									className={cn('h-full rounded-full transition-all', config.accent)}
									style={{
										width: `${Math.max(5, 100 - (exam.daysRemaining / 180) * 100)}%`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}

function cn(...classes: (string | boolean | undefined | null)[]) {
	return classes.filter(Boolean).join(' ');
}

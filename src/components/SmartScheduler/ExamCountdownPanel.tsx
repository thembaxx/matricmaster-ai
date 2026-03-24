'use client';

import { differenceInDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { NSC_EXAM_DATES, SUBJECT_COLORS } from '@/data/exam-dates';
import { cn } from '@/lib/utils';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { ExamCountdown } from '@/types/smart-scheduler';

const PRIORITY_CONFIG = {
	high: {
		bg: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20',
		border: 'border-red-200 dark:border-red-800',
		accent: 'bg-red-500',
		textAccent: 'text-red-600 dark:text-red-400',
		badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
	},
	medium: {
		bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20',
		border: 'border-amber-200 dark:border-amber-800',
		accent: 'bg-amber-500',
		textAccent: 'text-amber-600 dark:text-amber-400',
		badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
	},
	low: {
		bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20',
		border: 'border-green-200 dark:border-green-800',
		accent: 'bg-green-500',
		textAccent: 'text-green-600 dark:text-green-400',
		badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
	},
};

function computeExamsFromStatic(): ExamCountdown[] {
	const now = new Date();
	return NSC_EXAM_DATES.map((exam) => {
		const examDate = new Date(exam.date);
		const daysRemaining = differenceInDays(examDate, now);
		return {
			id: `${exam.subjectKey}-${exam.paper}`,
			subject: exam.subject,
			date: examDate,
			daysRemaining,
			priority:
				daysRemaining <= 14
					? ('high' as const)
					: daysRemaining <= 60
						? ('medium' as const)
						: ('low' as const),
		};
	})
		.filter((e) => e.daysRemaining > 0)
		.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function ExamCountdownPanel() {
	const { exams, setExams } = useSmartSchedulerStore();
	const [hasSetExams, setHasSetExams] = useState(false);

	useEffect(() => {
		if (!hasSetExams) {
			const staticExams = computeExamsFromStatic();
			if (exams.length === 0 || staticExams.length > exams.length) {
				setExams(staticExams);
			}
			setHasSetExams(true);
		}
	}, [hasSetExams, exams.length, setExams]);

	const displayExams = exams.length > 0 ? exams : computeExamsFromStatic();

	if (displayExams.length === 0) {
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
				{displayExams.slice(0, 6).map((exam) => {
					const config = PRIORITY_CONFIG[exam.priority];
					const subjectColor = SUBJECT_COLORS[exam.subject] || '#9F85FF';

					return (
						<div
							key={exam.id}
							className={cn(
								'p-3 rounded-xl border transition-all hover:shadow-md',
								config.bg,
								config.border
							)}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<div
											className="w-2 h-2 rounded-full flex-shrink-0"
											style={{ backgroundColor: subjectColor }}
										/>
										<span className="font-medium text-sm truncate">{exam.subject}</span>
									</div>
									<div className="text-xs text-muted-foreground/70 mt-0.5 ml-4">
										{exam.daysRemaining <= 7
											? `${exam.daysRemaining} days left`
											: exam.daysRemaining <= 30
												? `${Math.ceil(exam.daysRemaining / 7)} weeks left`
												: `${exam.daysRemaining} days left`}
									</div>
								</div>
								<div
									className={cn(
										'flex flex-col items-center justify-center min-w-[48px] py-1 px-2 rounded-lg',
										config.badge
									)}
								>
									<span className="text-2xl font-bold leading-none">{exam.daysRemaining}</span>
									<span className="text-[10px] font-medium  tracking-wide">days</span>
								</div>
							</div>
							<div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
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

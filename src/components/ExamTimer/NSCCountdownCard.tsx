'use client';

import { CalendarIcon, Clock03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDaysUntilExam, getNextExam, getWeeksUntilExam, type NSCExamDate } from './NSCCountdown';

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-ZA', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export function NSCCountdownCard() {
	const [nextExam, setNextExam] = useState<NSCExamDate | null>(null);
	const [daysLeft, setDaysLeft] = useState(0);

	useEffect(() => {
		const exam = getNextExam();
		setNextExam(exam);
		if (exam) {
			setDaysLeft(getDaysUntilExam(exam.date));
		}
	}, []);

	useEffect(() => {
		if (!nextExam) return;

		const interval = setInterval(() => {
			setDaysLeft(getDaysUntilExam(nextExam.date));
		}, 60000);

		return () => clearInterval(interval);
	}, [nextExam]);

	if (!nextExam) {
		return (
			<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg flex items-center gap-2">
						<HugeiconsIcon icon={CalendarIcon} className="w-5 h-5 text-primary" />
						NSC Exam Countdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Exam dates will be announced soon. Check back later!
					</p>
				</CardContent>
			</Card>
		);
	}

	const weeksLeft = getWeeksUntilExam(nextExam.date);

	return (
		<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg flex items-center gap-2">
					<HugeiconsIcon icon={CalendarIcon} className="w-5 h-5 text-primary" />
					NSC Exam Countdown
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Next Exam</p>
						<p className="font-semibold">
							{nextExam.subject} Paper {nextExam.paper}
						</p>
						<p className="text-xs text-muted-foreground">{formatDate(nextExam.date)}</p>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-1.5">
								<HugeiconsIcon
									icon={Clock03Icon}
									className={`w-4 h-4 ${daysLeft <= 30 ? 'text-red-500' : 'text-primary'}`}
								/>
								<span
									className={`text-2xl font-bold tabular-nums ${daysLeft <= 30 ? 'text-red-500' : 'text-primary'}`}
								>
									{daysLeft}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">days remaining</p>
						</div>

						<div className="flex-1 border-l pl-4">
							<p className="text-2xl font-bold text-muted-foreground tabular-nums">{weeksLeft}</p>
							<p className="text-xs text-muted-foreground">weeks remaining</p>
						</div>
					</div>

					{daysLeft <= 30 && (
						<div className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded">
							Exam season is approaching! Make sure you&apos;re prepared.
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

'use client';

import { Calendar01Icon, ClockIcon, RocketIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NSC_EXAM_DATES, SUBJECT_COLORS } from '@/content';
import { cn } from '@/lib/utils';

interface NextExam {
	subject: string;
	date: Date;
	daysRemaining: number;
	subjectKey: string;
	paper: string;
}

function getNextExam(): NextExam | null {
	const now = new Date();
	const upcoming = NSC_EXAM_DATES.map((exam) => ({
		...exam,
		date: new Date(exam.date),
		daysRemaining: differenceInDays(new Date(exam.date), now),
	}))
		.filter((e) => e.daysRemaining > 0)
		.sort((a, b) => a.daysRemaining - b.daysRemaining);

	return upcoming[0] ?? null;
}

function getUrgencyConfig(daysRemaining: number) {
	if (daysRemaining <= 7) {
		return {
			gradient: 'from-red-500 via-orange-500 to-amber-500',
			glow: 'shadow-red-500/20',
			badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
			text: 'text-red-600 dark:text-red-400',
		};
	}
	if (daysRemaining <= 30) {
		return {
			gradient: 'from-amber-500 via-orange-500 to-yellow-500',
			glow: 'shadow-amber-500/20',
			badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
			text: 'text-amber-600 dark:text-amber-400',
		};
	}
	return {
		gradient: 'from-primary via-indigo-500 to-purple-500',
		glow: 'shadow-primary/20',
		badge: 'bg-primary/10 text-primary dark:bg-primary/20',
		text: 'text-primary',
	};
}

export function ExamCountdownHero() {
	const router = useRouter();
	const [nextExam, setNextExam] = useState<NextExam | null>(null);
	const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	useEffect(() => {
		const exam = getNextExam();
		setNextExam(exam);

		if (!exam) return;

		const update = () => {
			const now = new Date();
			const diff = exam.date.getTime() - now.getTime();
			if (diff <= 0) {
				setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				return;
			}
			setCountdown({
				days: Math.floor(diff / (1000 * 60 * 60 * 24)),
				hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
				minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
				seconds: Math.floor((diff % (1000 * 60)) / 1000),
			});
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!nextExam) {
		return (
			<div
				className={cn(
					'relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br',
					'from-primary/5 via-background to-primary/10 p-5 md:p-6',
					'shadow-lg shadow-primary/10'
				)}
			>
				<div className="flex items-center gap-4">
					<div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
						<HugeiconsIcon icon={Calendar01Icon} className="h-7 w-7 text-primary" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-muted-foreground">No exams scheduled</p>
						<p className="text-base font-semibold mt-0.5">
							Set your exam date to see your countdown
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="mt-4 w-full md:w-auto"
					onClick={() => router.push('/study-plan')}
				>
					Set Exam Date
				</Button>
			</div>
		);
	}

	const config = getUrgencyConfig(nextExam.daysRemaining);
	const subjectColor = SUBJECT_COLORS[nextExam.subject] || 'var(--primary)';

	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br',
				`from-background via-background to-${subjectColor}/5`,
				'p-5 md:p-6 shadow-lg',
				config.glow
			)}
		>
			{/* Background decoration */}
			<div
				className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', config.gradient)}
				aria-hidden="true"
			/>
			<div
				className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl"
				style={{ backgroundColor: subjectColor, opacity: 0.15 }}
				aria-hidden="true"
			/>

			<div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
				{/* Left: countdown */}
				<div className="flex items-center gap-4">
					<div
						className="flex items-center justify-center w-16 h-16 rounded-2xl md:rounded-3xl shadow-lg"
						style={{ backgroundColor: subjectColor, opacity: 0.15 }}
					>
						<HugeiconsIcon
							icon={Calendar01Icon}
							className="h-8 w-8"
							style={{ color: subjectColor }}
						/>
					</div>
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Next Exam
						</p>
						<p className="text-lg font-bold mt-0.5" style={{ color: subjectColor }}>
							{nextExam.subject} — {nextExam.paper}
						</p>
					</div>
				</div>

				{/* Divider */}
				<div className="hidden md:block w-px h-12 bg-border/50" aria-hidden="true" />

				{/* Center: countdown digits */}
				<div className="flex-1">
					<div className="flex items-end gap-1">
						<span
							className={cn(
								'text-5xl md:text-6xl font-bold tabular-nums tracking-tight',
								config.text
							)}
						>
							{countdown.days}
						</span>
						<span className="text-xl font-semibold text-muted-foreground mb-2">days</span>
					</div>
					<div className="flex items-center gap-3 mt-1">
						<div className="flex items-center gap-1.5">
							<HugeiconsIcon icon={ClockIcon} className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground tabular-nums">
								{String(countdown.hours).padStart(2, '0')}:
								{String(countdown.minutes).padStart(2, '0')}:
								{String(countdown.seconds).padStart(2, '0')}
							</span>
						</div>
						<span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', config.badge)}>
							{nextExam.daysRemaining <= 7
								? 'CRITICAL'
								: nextExam.daysRemaining <= 30
									? 'URGENT'
									: 'ON TRACK'}
						</span>
					</div>
				</div>

				{/* Right: CTA */}
				<div className="flex flex-col gap-2">
					<Button
						size="sm"
						className={cn(
							'gap-2 font-semibold shadow-md',
							nextExam.daysRemaining <= 7
								? 'bg-red-500 hover:bg-red-600 text-white'
								: nextExam.daysRemaining <= 30
									? 'bg-amber-500 hover:bg-amber-600 text-white'
									: 'bg-primary hover:bg-primary/90'
						)}
						onClick={() => router.push(`/study-plan?subject=${nextExam.subjectKey}`)}
					>
						<HugeiconsIcon icon={RocketIcon} className="h-4 w-4" />
						Study Now
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="text-xs"
						onClick={() => router.push('/smart-scheduler')}
					>
						View Schedule
					</Button>
				</div>
			</div>
		</div>
	);
}

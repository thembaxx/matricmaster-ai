'use client';

import { Calendar01Icon, ClockIcon, RocketIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NSC_EXAM_DATES } from '@/content';
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
			accent: '#ef4444',
		};
	}
	if (daysRemaining <= 30) {
		return {
			gradient: 'from-amber-500 via-orange-500 to-yellow-500',
			glow: 'shadow-amber-500/20',
			badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
			text: 'text-amber-600 dark:text-amber-400',
			accent: '#f59e0b',
		};
	}
	return {
		gradient: 'from-primary via-indigo-500 to-purple-500',
		glow: 'shadow-primary/20',
		badge: 'bg-primary/10 text-primary dark:bg-primary/20',
		text: 'text-primary',
		accent: '#3b82f6',
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
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
				<div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
				<div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-[80px]" />

				<div className="relative flex items-center gap-4">
					<div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
						<HugeiconsIcon icon={Calendar01Icon} className="h-7 w-7 text-primary" />
					</div>
					<div className="flex-1">
						<p className="text-sm text-muted-foreground">no exams scheduled</p>
						<p className="font-semibold mt-0.5 text-foreground">
							set your exam date to see your countdown
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="mt-4 w-full md:w-auto"
					onClick={() => router.push('/study-plan')}
				>
					set exam date
				</Button>
			</div>
		);
	}

	const config = getUrgencyConfig(nextExam.daysRemaining);

	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br',
				'p-6 md:p-8 transition-all duration-500',
				config.glow
			)}
		>
			<div
				className={cn('absolute inset-0 opacity-[0.08] bg-gradient-to-br', config.gradient)}
				aria-hidden="true"
			/>
			<div
				className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px]"
				style={{ backgroundColor: config.accent }}
				aria-hidden="true"
			/>
			<div
				className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[100px]"
				style={{ backgroundColor: config.accent, opacity: 0.5 }}
				aria-hidden="true"
			/>

			<div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
				<div className="flex items-center gap-5">
					<div
						className="flex items-center justify-center w-18 h-18 rounded-2xl shadow-lg"
						style={{ backgroundColor: config.accent }}
					>
						<HugeiconsIcon icon={Calendar01Icon} className="h-9 w-9 text-white" />
					</div>
					<div>
						<p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
							next exam
						</p>
						<p className="text-xl font-bold mt-1" style={{ color: config.accent }}>
							{nextExam.subject} — {nextExam.paper}
						</p>
					</div>
				</div>

				<div className="hidden lg:block w-px h-16 bg-border/40" />

				<div className="flex-1">
					<div className="flex items-end gap-2">
						<span
							className={cn(
								'text-6xl md:text-7xl font-bold font-numeric tabular-nums tracking-tight',
								config.text
							)}
						>
							{countdown.days}
						</span>
						<span className="text-base font-semibold text-muted-foreground mb-2">days</span>
					</div>
					<div className="flex items-center gap-4 mt-2">
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={ClockIcon} className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground font-numeric tabular-nums">
								{String(countdown.hours).padStart(2, '0')}:
								{String(countdown.minutes).padStart(2, '0')}:
								{String(countdown.seconds).padStart(2, '0')}
							</span>
						</div>
						<span className={cn('text-xs font-semibold px-3 py-1 rounded-full', config.badge)}>
							{nextExam.daysRemaining <= 7
								? 'critical'
								: nextExam.daysRemaining <= 30
									? 'urgent'
									: 'on track'}
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<Button
						className={cn(
							'gap-2 font-semibold shadow-lg',
							nextExam.daysRemaining <= 7
								? 'bg-red-500 hover:bg-red-600'
								: nextExam.daysRemaining <= 30
									? 'bg-amber-500 hover:bg-amber-600'
									: 'bg-primary hover:bg-primary/90'
						)}
						onClick={() => router.push(`/study-plan?subject=${nextExam.subjectKey}`)}
					>
						<HugeiconsIcon icon={RocketIcon} className="h-4 w-4" />
						study now
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="text-sm"
						onClick={() => router.push('/smart-scheduler')}
					>
						view schedule
					</Button>
				</div>
			</div>
		</div>
	);
}

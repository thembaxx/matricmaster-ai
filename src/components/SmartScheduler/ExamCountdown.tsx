'use client';

import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface CountdownState {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
}

function calculateCountdown(targetDate: Date): CountdownState {
	const now = new Date();
	const diff = targetDate.getTime() - now.getTime();

	if (diff <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return { days, hours, minutes, seconds, isExpired: false };
}

export function ExamCountdown() {
	const [countdown, setCountdown] = useState<CountdownState | null>(null);

	const { data: examDate } = useQuery({
		queryKey: ['exam-date'],
		queryFn: async () => {
			const res = await fetch('/api/study-plans/active');
			if (!res.ok) return null;
			const data = await res.json();
			return data?.targetExamDate ? new Date(data.targetExamDate) : null;
		},
		staleTime: 60 * 60 * 1000,
	});

	useEffect(() => {
		if (!examDate) return;

		const updateCountdown = () => {
			setCountdown(calculateCountdown(examDate));
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, [examDate]);

	if (!examDate || !countdown) return null;

	const urgencyColor =
		countdown.days <= 7 ? 'text-red-500' : countdown.days <= 30 ? 'text-amber-500' : 'text-primary';

	return (
		<div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
			<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
				<HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-primary" />
			</div>
			<div className="flex-1">
				<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
					exam countdown
				</p>
				{countdown.isExpired ? (
					<p className="text-lg font-bold text-red-500">exams are here!</p>
				) : (
					<div className="flex items-baseline gap-1.5">
						<span className={`text-2xl font-bold tabular-nums ${urgencyColor}`}>
							{countdown.days}
						</span>
						<span className="text-sm text-muted-foreground">days</span>
						<span className="text-lg font-semibold tabular-nums text-muted-foreground ml-2">
							{String(countdown.hours).padStart(2, '0')}:
							{String(countdown.minutes).padStart(2, '0')}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

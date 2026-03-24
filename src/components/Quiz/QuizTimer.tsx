'use client';

import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
	elapsedSeconds: number;
	totalSeconds?: number;
}

export function QuizTimer({ elapsedSeconds, totalSeconds }: QuizTimerProps) {
	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

	const hasLimit = totalSeconds !== undefined && totalSeconds > 0;
	const remaining = hasLimit ? Math.max(0, totalSeconds - elapsedSeconds) : 0;
	const progress = hasLimit ? Math.min(1, elapsedSeconds / totalSeconds) : 0;
	const urgencyThreshold = hasLimit && remaining / totalSeconds < 0.3;

	const ringColor = progress < 0.5 ? '#22c55e' : progress < 0.8 ? '#eab308' : '#ef4444';
	const formatted = formatTime(elapsedSeconds);

	const radius = 24;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = hasLimit ? circumference * (1 - progress) : 0;

	return (
		<div className="flex items-center justify-between mb-8">
			<div
				className={cn(
					'w-14 h-14 bg-subject-math-soft rounded-[1.5rem] flex items-center justify-center relative',
					urgencyThreshold && 'timer-urgency'
				)}
			>
				{hasLimit && (
					<svg
						className="absolute inset-0 w-14 h-14 -rotate-90"
						viewBox="0 0 56 56"
						aria-hidden="true"
					>
						<circle
							cx="28"
							cy="28"
							r={radius}
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-secondary"
						/>
						<m.circle
							cx="28"
							cy="28"
							r={radius}
							fill="none"
							stroke={ringColor}
							strokeWidth="3"
							strokeLinecap="round"
							strokeDasharray={circumference}
							initial={false}
							animate={{ strokeDashoffset: dashOffset, stroke: ringColor }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
						/>
					</svg>
				)}
				<svg
					className="w-8 h-8 text-subject-math relative z-10"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<div className="px-4 py-2 bg-secondary rounded-full shadow-sm">
				<span className="font-mono font-black text-foreground tabular-nums overflow-hidden inline-flex">
					<AnimatePresence mode="popLayout">
						{formatted.split('').map((char, i) => (
							<m.span
								key={`${formatted}-${i}`}
								initial={{ y: -12, opacity: 0, filter: 'blur(2px)' }}
								animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
								exit={{ y: 12, opacity: 0, filter: 'blur(2px)' }}
								transition={{ duration: 0.2, ease: 'easeOut' }}
								className="inline-block"
							>
								{char}
							</m.span>
						))}
					</AnimatePresence>
				</span>
			</div>
		</div>
	);
}

import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { CIRCLE_CIRCUMFERENCE, formatTime } from './constants';

interface TimerViewProps {
	title: string;
	timeRemaining: number;
	progress: number;
	isPaused: boolean;
	onTogglePause: () => void;
}

export function TimerView({
	title,
	timeRemaining,
	progress,
	isPaused,
	onTogglePause,
}: TimerViewProps) {
	const { trigger } = useHaptics();
	const lastMilestoneRef = useRef<number>(0);
	const hasCompletedRef = useRef(false);

	const currentMilestone = Math.floor(progress / 25) * 25;

	useEffect(() => {
		if (isPaused || hasCompletedRef.current) return;

		if (progress >= 100 && !hasCompletedRef.current) {
			hasCompletedRef.current = true;
			trigger('success');
			return;
		}

		if (currentMilestone > lastMilestoneRef.current && currentMilestone < 100) {
			lastMilestoneRef.current = currentMilestone;
			trigger('medium');
		}
	}, [progress, isPaused, trigger, currentMilestone]);

	return (
		<m.div
			key="timer"
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className="w-full max-w-md flex flex-col items-center justify-center grow"
		>
			<div className="text-center mb-12">
				<h1 className="text-3xl font-black text-foreground tracking-tighter mb-2">
					{title.toLowerCase()}
				</h1>
				<p className="text-sm font-bold text-muted-foreground tracking-widest">deep work session</p>
			</div>

			<div className="relative w-64 sm:w-72 h-64 sm:h-72 mx-auto mb-12">
				<svg
					className="w-full h-full -rotate-90"
					viewBox="0 0 100 100"
					role="img"
					aria-label="Study timer"
				>
					<title>Study timer</title>
					<circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="4" />
					<m.circle
						cx="50"
						cy="50"
						r="45"
						fill="none"
						stroke="var(--primary)"
						strokeWidth="4"
						strokeLinecap="round"
						strokeDasharray={`${CIRCLE_CIRCUMFERENCE}`}
						initial={{ strokeDashoffset: `${CIRCLE_CIRCUMFERENCE}` }}
						animate={{ strokeDashoffset: `${CIRCLE_CIRCUMFERENCE * (1 - progress / 100)}` }}
						transition={{ duration: 0.5 }}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-6xl font-black font-mono tracking-tighter text-foreground">
						{formatTime(timeRemaining)}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button
					size="lg"
					variant={isPaused ? 'default' : 'outline'}
					onClick={onTogglePause}
					className="rounded-full px-10 h-16 text-xs font-black tracking-widest gap-2 shadow-soft-lg shadow-primary/20"
				>
					<HugeiconsIcon icon={isPaused ? PlayIcon : PauseIcon} className="w-5 h-5" />
					{isPaused ? 'start session' : 'pause'}
				</Button>
			</div>
		</m.div>
	);
}

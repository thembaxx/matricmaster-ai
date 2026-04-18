'use client';

import { motion as m } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/stores/useScheduleStore';

export function TimerControls() {
	const { isTimerRunning, startTimer, pauseTimer, resetTimer, addTime } = useSchedule();

	return (
		<div className="flex items-center justify-center gap-4">
			<m.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => addTime(-60)}
				type="button"
				className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-label="Remove 1 minute"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span className="sr-only">Remove 1 min</span>
			</m.button>

			<m.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={isTimerRunning ? pauseTimer : startTimer}
				type="button"
				className={cn(
					'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
					isTimerRunning ? 'bg-warning hover:bg-warning/80' : 'bg-primary hover:bg-primary/80'
				)}
			>
				{isTimerRunning ? (
					<svg
						className="w-8 h-8 text-white"
						fill="currentColor"
						viewBox="0 0 24 24"
						aria-label="Pause"
					>
						<rect x="6" y="4" width="4" height="16" rx="1" />
						<rect x="14" y="4" width="4" height="16" rx="1" />
					</svg>
				) : (
					<svg
						className="w-8 h-8 text-white ml-1"
						fill="currentColor"
						viewBox="0 0 24 24"
						aria-label="Start"
					>
						<path d="M8 5v14l11-7z" />
					</svg>
				)}
			</m.button>

			<m.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => addTime(60)}
				type="button"
				className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-label="Add 1 minute"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span className="sr-only">Add 1 min</span>
			</m.button>

			<m.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={resetTimer}
				type="button"
				className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-label="Reset timer"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				<span className="sr-only">Reset</span>
			</m.button>
		</div>
	);
}

'use client';

interface QuizTimerProps {
	elapsedSeconds: number;
}

export function QuizTimer({ elapsedSeconds }: QuizTimerProps) {
	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

	return (
		<div className="flex items-center justify-between mb-8">
			<div className="w-14 h-14 bg-subject-math-soft rounded-[1.5rem] flex items-center justify-center">
				<svg
					className="w-8 h-8 text-subject-math"
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
				<span className="font-mono font-black text-foreground tabular-nums">
					{formatTime(elapsedSeconds)}
				</span>
			</div>
		</div>
	);
}

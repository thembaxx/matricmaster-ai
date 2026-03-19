'use client';

import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TimerControls } from '@/components/Timer/TimerControls';
import { cn } from '@/lib/utils';

type TimerMode = 'focus' | 'short-break' | 'long-break';

interface TimerPanelProps {
	mode: TimerMode;
	setMode: (mode: TimerMode) => void;
	timeRemaining: number;
	progress: number;
	isTimerRunning: boolean;
	formatTime: (seconds: number) => string;
}

export function TimerPanel({
	mode,
	setMode,
	timeRemaining,
	progress,
	isTimerRunning,
	formatTime,
}: TimerPanelProps) {
	return (
		<div className="lg:col-span-7 flex flex-col items-center space-y-8 bg-card border border-border/50 p-8 md:p-12 rounded-[3rem] shadow-tiimo relative overflow-hidden min-h-[500px] justify-center">
			<div
				className={cn(
					'absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500',
					mode === 'focus' ? 'bg-primary' : 'bg-success'
				)}
			/>

			<div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full relative z-10">
				{(['focus', 'short-break', 'long-break'] as const).map((m) => (
					<button
						type="button"
						key={m}
						onClick={() => setMode(m)}
						className={cn(
							'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
							mode === m
								? 'bg-background shadow-tiimo text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						)}
					>
						{m.replace('-', ' ')}
					</button>
				))}
			</div>

			<ProgressRing
				progress={progress}
				size={320}
				strokeWidth={16}
				className={cn(mode === 'focus' ? 'text-primary' : 'text-success')}
			>
				<div className="text-center space-y-2">
					<div className="text-7xl font-black tracking-tighter tabular-nums">
						{formatTime(timeRemaining)}
					</div>
					<div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
						{isTimerRunning ? 'Session Active' : 'Paused'}
					</div>
				</div>
			</ProgressRing>

			<TimerControls />
		</div>
	);
}

'use client';

import { Forward01Icon, PlayIcon, RefreshIcon, StopCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { TimerMode, UseTimerReturn } from '@/hooks/use-timer';
import { cn } from '@/lib/utils';

interface TimerProps {
	timer: UseTimerReturn;
	size?: 'sm' | 'md' | 'lg';
	showControls?: boolean;
	showModeSelector?: boolean;
	showProgress?: boolean;
	showStats?: boolean;
	className?: string;
}

const MODE_LABELS: Record<TimerMode, string> = {
	focus: 'Focus',
	'short-break': 'Short Break',
	'long-break': 'Long Break',
};

const MODE_COLORS: Record<TimerMode, string> = {
	focus: 'text-primary',
	'short-break': 'text-tiimo-green',
	'long-break': 'text-tiimo-yellow',
};

const MODE_BG_COLORS: Record<TimerMode, string> = {
	focus: 'bg-primary',
	'short-break': 'bg-tiimo-green',
	'long-break': 'bg-tiimo-yellow',
};

const SIZE_CONFIG = {
	sm: {
		circle: 'w-32 h-32',
		text: 'text-3xl',
		icon: 'w-4 h-4',
		button: 'h-10 text-xs',
	},
	md: {
		circle: 'w-48 h-48',
		text: '5xl',
		icon: 'w-5 h-5',
		button: 'h-12 text-sm',
	},
	lg: {
		circle: 'w-64 h-64',
		text: '7xl',
		icon: 'w-6 h-6',
		button: 'h-14 text-base',
	},
};

export function Timer({
	timer,
	size = 'md',
	showControls = true,
	showModeSelector = false,
	showProgress = true,
	showStats = false,
	className,
}: TimerProps) {
	const config = SIZE_CONFIG[size];
	const { strokeDasharray, strokeDashoffset } = useMemo(() => {
		const circumference = 2 * Math.PI * 45;
		const offset = circumference - (timer.progress / 100) * circumference;
		return {
			strokeDasharray: circumference,
			strokeDashoffset: offset,
		};
	}, [timer.progress]);

	const modeColor = MODE_COLORS[timer.mode];
	const modeBgColor = MODE_BG_COLORS[timer.mode];

	return (
		<div className={cn('flex flex-col items-center gap-6', className)}>
			{showModeSelector && (
				<div className="flex gap-2">
					{(['focus', 'short-break', 'long-break'] as TimerMode[]).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => timer.setMode(m)}
							className={cn(
								'px-4 py-2 rounded-full text-xs font-black  tracking-widest transition-all',
								timer.mode === m
									? `${MODE_BG_COLORS[m]} text-white`
									: 'bg-muted text-muted-foreground hover:bg-muted/80'
							)}
						>
							{MODE_LABELS[m]}
						</button>
					))}
				</div>
			)}

			<div className="relative">
				<svg
					className={cn('transform -rotate-90', config.circle)}
					viewBox="0 0 100 100"
					role="img"
					aria-label={`${timer.formatTime()} remaining in ${MODE_LABELS[timer.mode]} mode`}
				>
					<circle
						cx="50"
						cy="50"
						r="45"
						stroke="currentColor"
						strokeWidth="3"
						fill="none"
						className="text-border"
					/>
					{showProgress && (
						<circle
							cx="50"
							cy="50"
							r="45"
							stroke="currentColor"
							strokeWidth="4"
							fill="none"
							strokeLinecap="round"
							strokeDasharray={strokeDasharray}
							strokeDashoffset={strokeDashoffset}
							className={cn('transition-all duration-300', modeColor)}
						/>
					)}
				</svg>

				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className={cn('font-black tracking-tighter tabular-nums', config.text, modeColor)}>
						{timer.formatTime()}
					</span>
					<span className="text-xs font-black  tracking-widest text-muted-foreground mt-1">
						{MODE_LABELS[timer.mode]}
					</span>
				</div>
			</div>

			{showStats && (
				<div className="flex items-center gap-6 text-center">
					<div>
						<p className="text-2xl font-black text-primary">{timer.cycles}</p>
						<p className="text-[10px]  tracking-widest text-muted-foreground">Complete Cycles</p>
					</div>
					<div className="w-px h-8 bg-border" />
					<div>
						<p className="text-2xl font-black text-primary">
							{Math.floor((timer.totalTime - timer.timeRemaining) / 60)}
						</p>
						<p className="text-[10px]  tracking-widest text-muted-foreground">Minutes</p>
					</div>
				</div>
			)}

			{showControls && (
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon"
						onClick={timer.reset}
						className={cn('rounded-full', config.button)}
					>
						<HugeiconsIcon icon={RefreshIcon} className={config.icon} />
					</Button>

					<m.div
						initial={{ scale: 1 }}
						animate={{ scale: timer.isRunning ? [1, 0.95, 1] : 1 }}
						transition={{ repeat: timer.isRunning ? Number.POSITIVE_INFINITY : 0, duration: 2 }}
					>
						<Button
							size="lg"
							onClick={timer.isRunning ? timer.pause : timer.start}
							className={cn(
								'rounded-full px-8 font-black  tracking-widest shadow-xl transition-all',
								config.button,
								timer.isRunning ? 'bg-tiimo-yellow text-white' : modeBgColor
							)}
						>
							<HugeiconsIcon
								icon={timer.isRunning ? StopCircleIcon : PlayIcon}
								className={config.icon}
							/>
							<span className="ml-2">{timer.isRunning ? 'Pause' : 'Start'}</span>
						</Button>
					</m.div>

					<Button
						variant="outline"
						size="icon"
						onClick={timer.skip}
						className={cn('rounded-full', config.button)}
					>
						<HugeiconsIcon icon={Forward01Icon} className={config.icon} />
					</Button>
				</div>
			)}
		</div>
	);
}

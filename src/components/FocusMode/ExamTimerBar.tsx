'use client';

import { useFocusModeContext } from '@/contexts/FocusModeContext';
import { cn } from '@/lib/utils';

function formatExamTime(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) {
		return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
	return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ExamTimerBar() {
	const { timeRemaining, totalTime, config, violations, status } = useFocusModeContext();

	const pct = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
	const remainingPct = 100 - pct;

	const color =
		remainingPct > 50 ? 'bg-emerald-500' : remainingPct > 20 ? 'bg-amber-500' : 'bg-red-500';

	const bgColor =
		remainingPct > 50
			? 'bg-emerald-500/10'
			: remainingPct > 20
				? 'bg-amber-500/10'
				: 'bg-red-500/10';

	const textColor =
		remainingPct > 50
			? 'text-emerald-600 dark:text-emerald-400'
			: remainingPct > 20
				? 'text-amber-600 dark:text-amber-400'
				: 'text-red-600 dark:text-red-400';

	if (status !== 'active' && status !== 'paused') return null;

	return (
		<div className={cn('fixed top-0 left-0 right-0 z-[100] h-12', bgColor)}>
			<div className="h-full flex items-center justify-between px-4 sm:px-6">
				<div className="flex items-center gap-3">
					<div
						className={cn('w-2 h-2 rounded-full', color, status === 'active' && 'animate-pulse')}
					/>
					<span className="text-xs font-bold tracking-widest truncate max-w-[200px] sm:max-w-none">
						{config?.paperTitle || 'exam session'}
					</span>
				</div>

				<div className="flex items-center gap-4">
					{violations > 0 && (
						<span className="text-[10px] font-bold text-red-500 tracking-wider">
							violations: {violations}/3
						</span>
					)}
					<div className={cn('font-mono text-lg font-black tracking-tight', textColor)}>
						{formatExamTime(timeRemaining)}
					</div>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
				<div
					className={cn('h-full transition-all duration-1000 ease-linear', color)}
					style={{ width: `${remainingPct}%` }}
				/>
			</div>
		</div>
	);
}

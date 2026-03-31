'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { useFocusModeContext } from '@/contexts/FocusModeContext';
import { cn } from '@/lib/utils';

interface FocusLayoutProps {
	children: React.ReactNode;
	timeRemaining?: number;
	totalTime?: number;
}

export function FocusLayout({
	children,
	timeRemaining: legacyTr,
	totalTime: legacyTt,
}: FocusLayoutProps) {
	const { exitExam, status, timeRemaining: ctxTr, totalTime: ctxTt } = useFocusModeContext();

	const timeRemaining = ctxTr || legacyTr || 0;
	const totalTime = ctxTt || legacyTt || 1;

	const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
	const remainingPct = 100 - progress;

	const barColor =
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

	const formatTime = (s: number) => {
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
		return `${m}:${sec.toString().padStart(2, '0')}`;
	};

	return (
		<div className="fixed inset-0 z-[100] bg-background">
			<div className={cn('fixed top-0 left-0 right-0 h-12', bgColor)}>
				<div className="h-full flex items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								'w-2 h-2 rounded-full',
								barColor,
								status === 'active' && 'animate-pulse'
							)}
						/>
						<span className="text-xs font-bold tracking-widest">focus mode</span>
					</div>

					<div className="flex items-center gap-4">
						<span className={cn('font-mono text-lg font-black tracking-tight', textColor)}>
							{formatTime(timeRemaining)}
						</span>
						<Button variant="ghost" size="sm" onClick={exitExam} className="gap-1">
							<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
							exit
						</Button>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
					<div
						className={cn('h-full transition-all duration-1000 ease-linear', barColor)}
						style={{ width: `${remainingPct}%` }}
					/>
				</div>
			</div>

			<div className="pt-12 h-full overflow-auto">{children}</div>
		</div>
	);
}

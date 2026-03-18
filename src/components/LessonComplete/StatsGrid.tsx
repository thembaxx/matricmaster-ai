'use client';

import { CheckmarkCircle02Icon, Clock01Icon, FlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import type { QuizResult } from '@/types/quiz';

function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

interface StatsGridProps {
	result: QuizResult;
	pointsEarned: number;
	isCompleting: boolean;
}

export const StatsGrid = memo(function StatsGrid({
	result,
	pointsEarned,
	isCompleting,
}: StatsGridProps) {
	return (
		<div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8">
			<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
				<div className="w-10 h-10 rounded-2xl bg-accent-lime/10 flex items-center justify-center mb-3">
					<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-accent-lime" />
				</div>
				<span className="text-xl font-black text-foreground tracking-tight">
					{result.accuracy}%
				</span>
				<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
					Accuracy
				</span>
			</div>

			<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
				<div className="w-10 h-10 rounded-2xl bg-primary-cyan/10 flex items-center justify-center mb-3">
					<HugeiconsIcon icon={Clock01Icon} className="w-6 h-6 text-primary-cyan" />
				</div>
				<span className="text-xl font-black text-foreground tracking-tight">
					{formatDuration(result.durationSeconds)}
				</span>
				<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
					Time
				</span>
			</div>

			<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
				<div className="w-10 h-10 rounded-2xl bg-primary-orange/10 flex items-center justify-center mb-3">
					<HugeiconsIcon icon={FlashIcon} className="w-6 h-6 text-primary-orange" />
				</div>
				<span className="text-xl font-black text-primary-orange tracking-tight">
					{isCompleting ? '...' : `+${pointsEarned}`}
				</span>
				<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
					XP Gained
				</span>
			</div>
		</div>
	);
});

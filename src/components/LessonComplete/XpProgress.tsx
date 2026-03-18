'use client';

import { memo } from 'react';
import { Progress } from '@/components/ui/progress';

interface XpProgressProps {
	level: number;
	xpInCurrentLevel: number;
	xpForNextLevel: number;
	xpProgress: number;
}

export const XpProgress = memo(function XpProgress({
	level,
	xpInCurrentLevel,
	xpForNextLevel,
	xpProgress,
}: XpProgressProps) {
	return (
		<div className="w-full max-w-md space-y-3 mb-10 px-1">
			<div className="flex justify-between items-end">
				<span className="text-base font-black text-foreground uppercase tracking-tight">
					Level {level}
				</span>
				<span className="text-xs font-black text-muted-foreground opacity-60">
					{xpInCurrentLevel} / {xpForNextLevel} XP
				</span>
			</div>
			<Progress
				value={xpProgress}
				className="h-3 bg-muted/30 rounded-full"
				style={{ '--progress-background': 'var(--primary-violet)' } as React.CSSProperties}
			/>
			<div className="flex justify-end">
				<span className="text-xs font-bold text-muted-foreground">Next: Level {level + 1}</span>
			</div>
		</div>
	);
});

'use client';

import { ArrowDown01Icon, FireIcon, GlobeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';

interface LessonsHeaderProps {
	streak?: number;
}

export const LessonsHeader = memo(function LessonsHeader({ streak = 5 }: LessonsHeaderProps) {
	return (
		<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-black text-foreground tracking-tight">Grade 12 Prep</h1>
					<p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
						Keep up the streak!{' '}
						<HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-brand-amber fill-brand-amber" />
						<span className="font-bold text-foreground">{streak} days</span>
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="rounded-full bg-card border-border shadow-sm gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4"
				>
					<HugeiconsIcon icon={GlobeIcon} className="w-4 h-4 text-muted-foreground" />
					<span className="font-bold text-foreground hidden sm:inline">English</span>
					<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground/50" />
				</Button>
			</div>
		</header>
	);
});

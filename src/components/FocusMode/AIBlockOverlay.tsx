'use client';

import { LockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFocusModeContext } from '@/contexts/FocusModeContext';
import { cn } from '@/lib/utils';

interface AIBlockOverlayProps {
	children: ReactNode;
}

export function AIBlockOverlay({ children }: AIBlockOverlayProps) {
	const { isActive } = useFocusModeContext();

	if (!isActive) {
		return <>{children}</>;
	}

	return (
		<Tooltip delayDuration={200}>
			<TooltipTrigger asChild>
				<div className={cn('relative cursor-not-allowed')}>
					<div className="pointer-events-none opacity-40 grayscale">{children}</div>
					<div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-lg">
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border/50 shadow-sm">
							<HugeiconsIcon icon={LockIcon} className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-[10px] font-bold tracking-widest text-muted-foreground">
								focus mode
							</span>
						</div>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent side="top" className="max-w-[200px]">
				<p className="text-xs">focus mode active: ai features unlock when your exam ends.</p>
			</TooltipContent>
		</Tooltip>
	);
}

interface AIBlockGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function AIBlockGuard({ children, fallback }: AIBlockGuardProps) {
	const { isActive } = useFocusModeContext();

	if (!isActive) {
		return <>{children}</>;
	}

	return <>{fallback ?? null}</>;
}

'use client';

import { LockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface AIFeatureBlockProps {
	children: React.ReactNode;
}

export function AIFeatureBlock({ children }: AIFeatureBlockProps) {
	const { isFocusMode, state } = useFocusMode();

	if (!isFocusMode || state === 'completed') {
		return <>{children}</>;
	}

	return (
		<div className="relative">
			<div className="pointer-events-none opacity-50">{children}</div>
			<div className="absolute inset-0 flex items-center justify-center bg-background/60">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<HugeiconsIcon icon={LockIcon} className="w-4 h-4" />
					<span>Focus Mode - AI available after exam</span>
				</div>
			</div>
		</div>
	);
}

'use client';

import { Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface FlashcardCompleteProps {
	reviewedCount: number;
	onStartNewSession: () => void;
}

export function FlashcardComplete({ reviewedCount, onStartNewSession }: FlashcardCompleteProps) {
	return (
		<div className="text-center py-12 space-y-4">
			<div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
				<HugeiconsIcon icon={Tick01Icon} className="w-10 h-10 text-green-600" />
			</div>
			<div>
				<h3 className="text-xl font-bold">Review Complete!</h3>
				<p className="text-muted-foreground">You reviewed {reviewedCount} cards</p>
			</div>
			<Button onClick={onStartNewSession}>Start New Session</Button>
		</div>
	);
}

'use client';

import { Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface FlashcardCompleteProps {
	reviewedCount: number;
	sessionStats?: { correct: number; total: number; streak: number };
	onStartNewSession: () => void;
}

export function FlashcardComplete({
	reviewedCount,
	sessionStats,
	onStartNewSession,
}: FlashcardCompleteProps) {
	const accuracy = sessionStats ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

	return (
		<div className="text-center py-12 space-y-4">
			<div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
				<HugeiconsIcon icon={Tick01Icon} className="w-10 h-10 text-green-600" />
			</div>
			<div>
				<h3 className="text-xl font-bold">Review Complete!</h3>
				<p className="text-muted-foreground">You reviewed {reviewedCount} cards</p>
				{sessionStats && (
					<div className="mt-2 text-sm space-y-1">
						<p>
							Accuracy: {accuracy}% ({sessionStats.correct}/{sessionStats.total} correct)
						</p>
						{sessionStats.streak > 0 && <p>Best streak: {sessionStats.streak} cards</p>}
					</div>
				)}
			</div>
			<Button onClick={onStartNewSession}>Start New Session</Button>
		</div>
	);
}

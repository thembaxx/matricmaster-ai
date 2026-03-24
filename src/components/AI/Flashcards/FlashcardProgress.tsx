'use client';

interface FlashcardProgressProps {
	currentIndex: number;
	totalCards: number;
	reviewedCount: number;
	isComplete: boolean;
}

export function FlashcardProgress({
	currentIndex,
	totalCards,
	reviewedCount,
	isComplete,
}: FlashcardProgressProps) {
	const progress = ((currentIndex + 1) / totalCards) * 100;

	return (
		<div className="space-y-2">
			<div className="w-full bg-muted rounded-full h-2">
				<div
					className="bg-primary h-2 rounded-full transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>
			{isComplete && (
				<p className="text-xs text-center text-green-600 dark:text-green-400">
					Session Complete! You reviewed {reviewedCount} cards
				</p>
			)}
		</div>
	);
}

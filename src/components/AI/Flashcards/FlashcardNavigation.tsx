'use client';

import { PlusSignIcon, Refresh01Icon, ShuffleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface FlashcardNavigationProps {
	onFlip: () => void;
	onShuffle?: () => void;
	onReset: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	onAddToMasterDeck?: () => void;
	isShuffled?: boolean;
	isAddingToMaster?: boolean;
	showAddToMasterDeck?: boolean;
	reviewMode?: boolean;
	canGoPrevious?: boolean;
	canGoNext?: boolean;
}

export function FlashcardNavigation({
	onFlip,
	onShuffle,
	onReset,
	onPrevious,
	onNext,
	onAddToMasterDeck,
	isShuffled = false,
	isAddingToMaster = false,
	showAddToMasterDeck = false,
	reviewMode = false,
	canGoPrevious = false,
	canGoNext = false,
}: FlashcardNavigationProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-center gap-2">
				<Button variant="outline" size="sm" onClick={onFlip}>
					<HugeiconsIcon icon={Refresh01Icon} className="h-4 w-4 mr-1" />
					Flip
				</Button>

				{showAddToMasterDeck && onAddToMasterDeck && (
					<Button
						variant="outline"
						size="sm"
						onClick={onAddToMasterDeck}
						disabled={isAddingToMaster}
						className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30"
					>
						<HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
						{isAddingToMaster ? 'Adding...' : 'Add to Master Deck'}
					</Button>
				)}

				{!reviewMode && (
					<>
						<Button
							variant="outline"
							size="sm"
							onClick={onShuffle}
							className={isShuffled ? 'bg-primary/10' : ''}
						>
							<HugeiconsIcon icon={ShuffleIcon} className="h-4 w-4 mr-1" />
							Shuffle
						</Button>
						<Button variant="outline" size="sm" onClick={onReset}>
							<HugeiconsIcon icon={Refresh01Icon} className="h-4 w-4 mr-1" />
							Reset
						</Button>
					</>
				)}
			</div>

			{!reviewMode && (
				<div className="flex justify-between">
					<Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious}>
						Previous
					</Button>
					<Button onClick={onNext} disabled={!canGoNext}>
						Next
					</Button>
				</div>
			)}

			<p className="text-xs text-center text-muted-foreground">
				{reviewMode
					? 'Flip to see answer, then rate your recall'
					: 'Use arrow keys or click buttons to navigate'}
			</p>
		</div>
	);
}

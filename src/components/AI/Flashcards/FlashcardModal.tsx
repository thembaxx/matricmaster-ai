'use client';

import { Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { Rating } from '@/lib/spaced-repetition';
import { FlashcardComplete } from './FlashcardComplete';
import { FlashcardDisplay } from './FlashcardDisplay';
import { FlashcardNavigation } from './FlashcardNavigation';
import { FlashcardProgress } from './FlashcardProgress';
import { FlashcardRatingButtons } from './FlashcardRatingButtons';
import type { Flashcard } from './useFlashcardState';
import { useFlashcardState } from './useFlashcardState';

interface FlashcardModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flashcards: Flashcard[];
	subject?: string;
	reviewMode?: boolean;
	onRate?: (flashcardId: string, rating: Rating) => Promise<void>;
	onAddToMasterDeck?: (flashcard: Flashcard) => Promise<void>;
	showAddToMasterDeck?: boolean;
	adaptiveDifficulty?: boolean;
}

export function FlashcardModal({
	open,
	onOpenChange,
	flashcards,
	subject,
	reviewMode = false,
	onRate,
	onAddToMasterDeck,
	showAddToMasterDeck = false,
	adaptiveDifficulty = false,
}: FlashcardModalProps) {
	const {
		currentIndex,
		isFlipped,
		isShuffled,
		reviewedCards,
		isRating,
		showRatingButtons,
		isAddingToMaster,
		currentCard,
		isComplete,
		currentDifficulty,
		sessionStats,
		handleFlip,
		handleRate,
		handleNext,
		handlePrevious,
		handleShuffle,
		handleReset,
		handleAddToMasterDeck,
		handleOpenChange,
	} = useFlashcardState({
		flashcards,
		reviewMode,
		onRate,
		onAddToMasterDeck,
		adaptiveDifficulty,
	});

	const onOpenChangeWrapper = (isOpen: boolean) => {
		handleOpenChange(isOpen);
		onOpenChange(isOpen);
	};

	if (!currentCard) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChangeWrapper}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Idea01Icon} className="h-5 w-5 text-brand-amber" />
						{reviewMode ? 'Review Session' : 'Flashcards'}
					</DialogTitle>
					<DialogDescription>
						{subject && <span className="capitalize">{subject}</span>}
						{subject && ' • '}
						{isComplete ? 'Session Complete!' : `Card ${currentIndex + 1} of ${flashcards.length}`}
						{reviewMode && adaptiveDifficulty && !isComplete && (
							<span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
								Difficulty: {currentDifficulty} • {sessionStats.correct}/{sessionStats.total}{' '}
								correct
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<FlashcardProgress
						currentIndex={currentIndex}
						totalCards={flashcards.length}
						reviewedCount={reviewedCards.size}
						isComplete={isComplete}
					/>

					{isComplete ? (
						<FlashcardComplete
							reviewedCount={reviewedCards.size}
							sessionStats={sessionStats}
							onStartNewSession={handleReset}
						/>
					) : (
						<>
							<FlashcardDisplay card={currentCard} isFlipped={isFlipped} reviewMode={reviewMode} />

							{reviewMode && showRatingButtons ? (
								<FlashcardRatingButtons onRate={handleRate} isDisabled={isRating} />
							) : (
								<FlashcardNavigation
									onFlip={handleFlip}
									onShuffle={handleShuffle}
									onReset={handleReset}
									onPrevious={handlePrevious}
									onNext={handleNext}
									onAddToMasterDeck={handleAddToMasterDeck}
									isShuffled={isShuffled}
									isAddingToMaster={isAddingToMaster}
									showAddToMasterDeck={showAddToMasterDeck}
									reviewMode={reviewMode}
									canGoPrevious={currentIndex > 0}
									canGoNext={currentIndex < flashcards.length - 1}
								/>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

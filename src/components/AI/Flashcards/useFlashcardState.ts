'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Rating } from '@/lib/spaced-repetition';
import { getAdaptiveDifficulty } from '@/services/spacedRepetition';
import { processGamificationAction } from '@/services/unified-gamification';

interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags?: string[];
	intervalDays?: number;
	easeFactor?: number | string;
	nextReview?: Date | string;
	timesReviewed?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
}

interface UseFlashcardStateProps {
	flashcards: Flashcard[];
	reviewMode?: boolean;
	onRate?: (flashcardId: string, rating: Rating) => Promise<void>;
	onAddToMasterDeck?: (flashcard: Flashcard) => Promise<void>;
	adaptiveDifficulty?: boolean;
}

interface UseFlashcardStateReturn {
	currentIndex: number;
	isFlipped: boolean;
	isShuffled: boolean;
	reviewedCards: Set<string>;
	isRating: boolean;
	showRatingButtons: boolean;
	isAddingToMaster: boolean;
	currentCard: Flashcard | undefined;
	progress: number;
	isComplete: boolean;
	shuffledCards: Flashcard[];
	currentDifficulty: 'easy' | 'medium' | 'hard';
	sessionStats: { correct: number; total: number; streak: number };
	handleFlip: () => void;
	handleRate: (rating: Rating) => Promise<void>;
	handleNext: () => void;
	handlePrevious: () => void;
	handleShuffle: () => void;
	handleReset: () => void;
	handleAddToMasterDeck: () => Promise<void>;
	handleOpenChange: (isOpen: boolean) => void;
}

export function useFlashcardState({
	flashcards,
	reviewMode = false,
	onRate,
	onAddToMasterDeck,
	adaptiveDifficulty = false,
}: UseFlashcardStateProps): UseFlashcardStateReturn {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [isShuffled, setIsShuffled] = useState(false);
	const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
	const [isRating, setIsRating] = useState(false);
	const [showRatingButtons, setShowRatingButtons] = useState(false);
	const [isAddingToMaster, setIsAddingToMaster] = useState(false);
	const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, streak: 0 });

	const shuffledCards = useMemo(
		() => [...flashcards].sort(() => Math.random() - 0.5),
		[flashcards]
	);

	const currentCard = isShuffled ? shuffledCards[currentIndex] : flashcards[currentIndex];
	const progress = ((currentIndex + 1) / flashcards.length) * 100;
	const isComplete = reviewedCards.size === flashcards.length;

	const handleFlip = useCallback(() => {
		setIsFlipped((prev) => {
			const newIsFlipped = !prev;
			if (reviewMode && !newIsFlipped) {
				setShowRatingButtons(true);
			}
			return newIsFlipped;
		});
	}, [reviewMode]);

	const handleRate = useCallback(
		async (rating: Rating) => {
			if (!currentCard || !onRate || isRating) return;

			setIsRating(true);
			try {
				await onRate(currentCard.id, rating);
				setReviewedCards((prev) => new Set(prev).add(currentCard.id));

				// Update session stats
				const isCorrect = rating >= 3;
				setSessionStats((prev) => ({
					correct: prev.correct + (isCorrect ? 1 : 0),
					total: prev.total + 1,
					streak: isCorrect ? prev.streak + 1 : 0,
				}));

				// Process gamification event
				try {
					await processGamificationAction('flashcard_review', {
						count: 1,
						rating,
						difficulty: currentDifficulty,
						correct: isCorrect,
					});
				} catch (gamificationError) {
					console.debug('Gamification tracking failed:', gamificationError);
				}

				// Adaptive difficulty adjustment
				if (adaptiveDifficulty && sessionStats.total >= 5) {
					try {
						const newDifficulty = await getAdaptiveDifficulty();
						setCurrentDifficulty(newDifficulty);
					} catch (difficultyError) {
						console.debug('Adaptive difficulty failed:', difficultyError);
					}
				}

				if (currentIndex < flashcards.length - 1) {
					setCurrentIndex((prev) => prev + 1);
					setIsFlipped(false);
					setShowRatingButtons(false);
				}
			} catch (error) {
				console.error('Failed to save rating:', error);
				toast.error('Failed to save rating');
			} finally {
				setIsRating(false);
			}
		},
		[
			currentCard,
			onRate,
			isRating,
			currentIndex,
			flashcards.length,
			adaptiveDifficulty,
			sessionStats,
			currentDifficulty,
		]
	);

	const handleNext = useCallback(() => {
		if (currentIndex < flashcards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
			setShowRatingButtons(false);
		}
	}, [currentIndex, flashcards.length]);

	const handlePrevious = useCallback(() => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setIsFlipped(false);
			setShowRatingButtons(false);
		}
	}, [currentIndex]);

	const handleShuffle = useCallback(() => {
		setIsShuffled((prev) => !prev);
		setCurrentIndex(0);
		setIsFlipped(false);
		setShowRatingButtons(false);
	}, []);

	const handleReset = useCallback(() => {
		setCurrentIndex(0);
		setIsFlipped(false);
		setIsShuffled(false);
		setReviewedCards(new Set());
		setShowRatingButtons(false);
		setSessionStats({ correct: 0, total: 0, streak: 0 });
		setCurrentDifficulty('medium');
	}, []);

	const handleAddToMasterDeck = useCallback(async () => {
		if (!currentCard || !onAddToMasterDeck || isAddingToMaster) return;

		setIsAddingToMaster(true);
		try {
			await onAddToMasterDeck(currentCard);
			toast.success('Added to Master Deck');
		} catch (error) {
			console.error('Failed to add to Master Deck:', error);
			toast.error('Failed to add to Master Deck');
		} finally {
			setIsAddingToMaster(false);
		}
	}, [currentCard, onAddToMasterDeck, isAddingToMaster]);

	const handleOpenChange = useCallback((isOpen: boolean) => {
		if (isOpen) {
			setCurrentIndex(0);
			setIsFlipped(false);
			setReviewedCards(new Set());
			setShowRatingButtons(false);
			setSessionStats({ correct: 0, total: 0, streak: 0 });
			setCurrentDifficulty('medium');
		}
	}, []);

	return {
		currentIndex,
		isFlipped,
		isShuffled,
		reviewedCards,
		isRating,
		showRatingButtons,
		isAddingToMaster,
		currentCard,
		progress,
		isComplete,
		shuffledCards,
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
	};
}

export type { Flashcard };

'use client';

import {
	ArrowPathIcon as ArrowCounterClockwise,
	CheckmarkCircle01Icon as Check,
	ViewIcon as FlipHorizontal,
	IdeaIcon as Lightbulb,
	Shuffle01Icon as Shuffle,
	Tag01Icon as Tag,
	ThumbsDownIcon as ThumbsDown,
	ThumbsUpIcon as ThumbsUp,
	Cancel01Icon as X,
} from 'hugeicons-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { Rating } from '@/lib/spaced-repetition';
import { formatReviewInterval } from '@/lib/spaced-repetition';

interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags?: string[];
	intervalDays?: number;
	easeFactor?: number | string;
	nextReview?: Date | string;
	timesReviewed?: number;
}

interface FlashcardModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flashcards: Flashcard[];
	subject?: string;
	reviewMode?: boolean;
	onRate?: (flashcardId: string, rating: Rating) => Promise<void>;
}

export function FlashcardModal({
	open,
	onOpenChange,
	flashcards,
	subject,
	reviewMode = false,
	onRate,
}: FlashcardModalProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [isShuffled, setIsShuffled] = useState(false);
	const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
	const [isRating, setIsRating] = useState(false);
	const [showRatingButtons, setShowRatingButtons] = useState(false);

	const shuffledCards = useMemo(
		() => [...flashcards].sort(() => Math.random() - 0.5),
		[flashcards]
	);
	const currentCard = isShuffled ? shuffledCards[currentIndex] : flashcards[currentIndex];
	const progress = ((currentIndex + 1) / flashcards.length) * 100;
	const isComplete = reviewedCards.size === flashcards.length;

	useEffect(() => {
		if (open) {
			setCurrentIndex(0);
			setIsFlipped(false);
			setReviewedCards(new Set());
			setShowRatingButtons(false);
		}
	}, [open]);

	const handleFlip = () => {
		setIsFlipped(!isFlipped);
		if (reviewMode && !isFlipped) {
			setShowRatingButtons(true);
		}
	};

	const handleRate = async (rating: Rating) => {
		if (!currentCard || !onRate || isRating) return;

		setIsRating(true);
		try {
			await onRate(currentCard.id, rating);
			setReviewedCards((prev) => new Set(prev).add(currentCard.id));

			if (currentIndex < flashcards.length - 1) {
				setCurrentIndex((prev) => prev + 1);
				setIsFlipped(false);
				setShowRatingButtons(false);
			}
		} catch {
			toast.error('Failed to save rating');
		} finally {
			setIsRating(false);
		}
	};

	const handleNext = () => {
		if (currentIndex < flashcards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
			setShowRatingButtons(false);
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setIsFlipped(false);
			setShowRatingButtons(false);
		}
	};

	const handleShuffle = () => {
		setIsShuffled(!isShuffled);
		setCurrentIndex(0);
		setIsFlipped(false);
		setShowRatingButtons(false);
	};

	const handleReset = () => {
		setCurrentIndex(0);
		setIsFlipped(false);
		setIsShuffled(false);
		setReviewedCards(new Set());
		setShowRatingButtons(false);
	};

	if (!currentCard) return null;

	const ratingButtons = [
		{ rating: 1 as Rating, icon: X, label: 'Again', shortcut: '1' },
		{ rating: 2 as Rating, icon: ThumbsDown, label: 'Hard', shortcut: '2' },
		{ rating: 3 as Rating, icon: Check, label: 'Good', shortcut: '3' },
		{ rating: 4 as Rating, icon: ThumbsUp, label: 'Easy', shortcut: '4' },
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lightbulb className="h-5 w-5 text-brand-amber" />
						{reviewMode ? 'Review session' : 'Flashcards'}
					</DialogTitle>
					<DialogDescription>
						{subject && <span className="capitalize">{subject}</span>}
						{subject && ' • '}
						{isComplete ? 'Session complete!' : `Card ${currentIndex + 1} of ${flashcards.length}`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="w-full bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>

					{isComplete ? (
						<div className="text-center py-12 space-y-4">
							<div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
								<Check className="w-10 h-10 text-green-600" />
							</div>
							<div>
								<h3 className="text-xl font-bold">Review complete!</h3>
								<p className="text-muted-foreground">You reviewed {reviewedCards.size} cards</p>
							</div>
							<Button onClick={handleReset}>Start new session</Button>
						</div>
					) : (
						<>
							<div className="relative h-64 perspective-1000">
								<div
									className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
										isFlipped ? 'rotate-y-180' : ''
									}`}
									style={{
										transformStyle: 'preserve-3d',
										transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
									}}
								>
									<div
										className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-lg backface-hidden"
										style={{ backfaceVisibility: 'hidden' }}
									>
										<p className="text-sm uppercase tracking-widest opacity-70 mb-4">Question</p>
										<p className="text-xl font-bold text-center">{currentCard.front}</p>
										{currentCard.timesReviewed !== undefined && currentCard.timesReviewed > 0 && (
											<p className="text-xs opacity-60 mt-4">
												Reviewed {currentCard.timesReviewed} times
											</p>
										)}
									</div>
									<div
										className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg"
										style={{
											backfaceVisibility: 'hidden',
											transform: 'rotateY(180deg)',
										}}
									>
										<p className="text-sm uppercase tracking-widest opacity-70 mb-4">Answer</p>
										<p className="text-lg font-medium text-center">{currentCard.back}</p>
										{currentCard.tags && currentCard.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-4">
												{currentCard.tags.map((tag) => (
													<Badge key={tag} variant="secondary" className="text-xs">
														<Tag className="h-3 w-3 mr-1" />
														{tag}
													</Badge>
												))}
											</div>
										)}
										{reviewMode && currentCard.intervalDays !== undefined && (
											<p className="text-xs opacity-70 mt-4">
												Next review: {formatReviewInterval(currentCard.intervalDays)}
											</p>
										)}
									</div>
								</div>
							</div>

							{reviewMode && showRatingButtons ? (
								<div className="space-y-2">
									<p className="text-sm text-center text-muted-foreground">
										How well did you remember?
									</p>
									<div className="grid grid-cols-4 gap-2">
										{ratingButtons.map(({ rating, icon: Icon, label, shortcut }) => (
											<Button
												key={rating}
												variant="outline"
												size="sm"
												className="flex-col h-auto py-2"
												onClick={() => handleRate(rating)}
												disabled={isRating}
											>
												<Icon className="h-4 w-4 mb-1" />
												<span className="text-xs">{label}</span>
												<span className="text-[10px] opacity-50">{shortcut}</span>
											</Button>
										))}
									</div>
								</div>
							) : (
								<div className="flex justify-center gap-2">
									<Button variant="outline" size="sm" onClick={handleFlip}>
										<FlipHorizontal className="h-4 w-4 mr-1" />
										Flip
									</Button>
									{!reviewMode && (
										<>
											<Button
												variant="outline"
												size="sm"
												onClick={handleShuffle}
												className={isShuffled ? 'bg-primary/10' : ''}
											>
												<Shuffle className="h-4 w-4 mr-1" />
												Shuffle
											</Button>
											<Button variant="outline" size="sm" onClick={handleReset}>
												<ArrowCounterClockwise className="h-4 w-4 mr-1" />
												Reset
											</Button>
										</>
									)}
								</div>
							)}

							{!reviewMode && (
								<div className="flex justify-between">
									<Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
										Previous
									</Button>
									<Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
										Next
									</Button>
								</div>
							)}

							<p className="text-xs text-center text-muted-foreground">
								{reviewMode
									? 'Flip to see answer, then rate your recall'
									: 'Use arrow keys or click buttons to navigate'}
							</p>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

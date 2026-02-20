'use client';

import { FlipHorizontal, Lightbulb, RotateCcw, Shuffle, Tag } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags: string[];
}

interface FlashcardModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flashcards: Flashcard[];
	subject?: string;
}

export function FlashcardModal({ open, onOpenChange, flashcards, subject }: FlashcardModalProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(flashcards);
	const [isShuffled, setIsShuffled] = useState(false);

	const currentCard = isShuffled ? shuffledCards[currentIndex] : flashcards[currentIndex];
	const progress = ((currentIndex + 1) / flashcards.length) * 100;

	const handleFlip = () => {
		setIsFlipped(!isFlipped);
	};

	const handleNext = () => {
		if (currentIndex < flashcards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setIsFlipped(false);
		}
	};

	const handleShuffle = () => {
		if (!isShuffled) {
			const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
			setShuffledCards(shuffled);
		}
		setIsShuffled(!isShuffled);
		setCurrentIndex(0);
		setIsFlipped(false);
	};

	const handleReset = () => {
		setCurrentIndex(0);
		setIsFlipped(false);
		setIsShuffled(false);
		setShuffledCards(flashcards);
	};

	if (!currentCard) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lightbulb className="h-5 w-5 text-brand-amber" />
						Flashcards
					</DialogTitle>
					<DialogDescription>
						{subject && <span className="capitalize">{subject}</span>}
						{subject && ' • '}Card {currentIndex + 1} of {flashcards.length}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="w-full bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>

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
							</div>
						</div>
					</div>

					<div className="flex justify-center gap-2">
						<Button variant="outline" size="sm" onClick={handleFlip}>
							<FlipHorizontal className="h-4 w-4 mr-1" />
							Flip
						</Button>
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
							<RotateCcw className="h-4 w-4 mr-1" />
							Reset
						</Button>
					</div>

					<div className="flex justify-between">
						<Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
							Previous
						</Button>
						<Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
							Next
						</Button>
					</div>

					<p className="text-xs text-center text-muted-foreground">
						Use arrow keys or click buttons to navigate • Click card to flip
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default FlashcardModal;

'use client';

import { Tag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
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

interface FlashcardDisplayProps {
	card: Flashcard;
	isFlipped: boolean;
	reviewMode?: boolean;
}

export function FlashcardDisplay({ card, isFlipped, reviewMode = false }: FlashcardDisplayProps) {
	return (
		<div className="relative h-64 perspective-1000">
			<div
				className="absolute inset-0 transition-transform duration-500"
				style={{
					transformStyle: 'preserve-3d',
					transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
				}}
			>
				<div
					className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-lg backface-hidden"
					style={{ backfaceVisibility: 'hidden' }}
				>
					<p className="text-sm tracking-widest opacity-70 mb-4">Question</p>
					<p className="text-xl font-bold text-center">{card.front}</p>
					{card.timesReviewed !== undefined && card.timesReviewed > 0 && (
						<p className="text-xs opacity-60 mt-4">Reviewed {card.timesReviewed} times</p>
					)}
				</div>
				<div
					className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg"
					style={{
						backfaceVisibility: 'hidden',
						transform: 'rotateY(180deg)',
					}}
				>
					<p className="text-sm tracking-widest opacity-70 mb-4">Answer</p>
					<p className="text-lg font-medium text-center">{card.back}</p>
					{card.tags && card.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-4">
							{card.tags.map((tag) => (
								<Badge key={tag} variant="secondary" className="text-xs">
									<HugeiconsIcon icon={Tag01Icon} className="h-3 w-3 mr-1" />
									{tag}
								</Badge>
							))}
						</div>
					)}
					{reviewMode && card.intervalDays !== undefined && (
						<p className="text-xs opacity-70 mt-4">
							Next review: {formatReviewInterval(card.intervalDays)}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

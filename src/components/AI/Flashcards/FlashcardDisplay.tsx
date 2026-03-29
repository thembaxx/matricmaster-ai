'use client';

import { Loading03Icon, SparklesIcon, Tag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatReviewInterval } from '@/lib/spaced-repetition';
import { getFlashcardExplanationAction } from '@/services/aiActions';

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
	const [explanation, setExplanation] = useState<string>('');
	const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
	const [showPopover, setShowPopover] = useState(false);

	const handleAskAI = useCallback(async () => {
		if (explanation) return;

		setIsLoadingExplanation(true);
		try {
			const result = await getFlashcardExplanationAction(card.front, card.back);
			setExplanation(result);
		} catch (error) {
			console.error('Failed to get explanation:', error);
			setExplanation("Sorry, I couldn't generate an explanation. Please try again.");
		} finally {
			setIsLoadingExplanation(false);
		}
	}, [card.front, card.back, explanation]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setShowPopover(open);
			if (open && !explanation) {
				handleAskAI();
			}
		},
		[handleAskAI, explanation]
	);

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

			<Popover open={showPopover} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						variant="secondary"
						size="sm"
						className="absolute bottom-2 right-2 z-10 gap-1.5 shadow-lg"
					>
						<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
						Ask AI
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80 max-h-64 overflow-y-auto" align="end">
					<div className="space-y-2">
						<h4 className="font-medium text-sm flex items-center gap-1.5">
							<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-primary" />
							Concept Explanation
						</h4>
						{isLoadingExplanation ? (
							<div className="flex items-center justify-center py-4">
								<HugeiconsIcon
									icon={Loading03Icon}
									className="h-5 w-5 animate-spin text-muted-foreground"
								/>
							</div>
						) : (
							<p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation}</p>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

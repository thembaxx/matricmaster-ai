'use client';

import {
	Cancel01Icon,
	CheckmarkCircle02Icon,
	Edit01Icon,
	Layers01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GeneratedFlashcardPreview {
	id: string;
	front: string;
	back: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

interface WrongAnswerFlashcardSuggestionProps {
	flashcards: GeneratedFlashcardPreview[];
	isLoading?: boolean;
	onStartReview?: () => void;
	onEditFlashcard?: (flashcard: GeneratedFlashcardPreview) => void;
	onDismiss?: () => void;
	topic?: string;
}

export const WrongAnswerFlashcardSuggestion = memo(function WrongAnswerFlashcardSuggestion({
	flashcards,
	isLoading = false,
	onStartReview,
	onEditFlashcard,
	onDismiss,
	topic,
}: WrongAnswerFlashcardSuggestionProps) {
	const [dismissed, setDismissed] = useState(false);
	const [expandedCard, setExpandedCard] = useState<string | null>(null);

	const handleDismiss = useCallback(() => {
		setDismissed(true);
		onDismiss?.();
	}, [onDismiss]);

	const handleStartReview = useCallback(() => {
		onStartReview?.();
	}, [onStartReview]);

	if (dismissed || flashcards.length === 0) {
		return null;
	}

	const difficultyColors = {
		easy: 'text-green-500 bg-green-500/10',
		medium: 'text-yellow-500 bg-yellow-500/10',
		hard: 'text-red-500 bg-red-500/10',
	};

	return (
		<AnimatePresence>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className="w-full max-w-2xl mx-auto"
			>
				<Card className="overflow-hidden border-primary-orange/30 shadow-lg">
					<div className="bg-gradient-to-r from-primary-orange/20 to-primary/10 p-4 border-b border-primary-orange/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary-orange/20 flex items-center justify-center">
									<HugeiconsIcon icon={Layers01Icon} className="w-5 h-5 text-primary-orange" />
								</div>
								<div>
									<h3 className="font-bold text-foreground">
										{flashcards.length} Flashcard{flashcards.length > 1 ? 's' : ''} from Mistakes
									</h3>
									{topic && <p className="text-sm text-muted-foreground">Topic: {topic}</p>}
								</div>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
								<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
							</Button>
						</div>
					</div>

					<div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
							</div>
						) : (
							flashcards.slice(0, 5).map((flashcard) => (
								<m.div
									key={flashcard.id}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									className="group"
								>
									<button
										type="button"
										onClick={() =>
											setExpandedCard(expandedCard === flashcard.id ? null : flashcard.id)
										}
										className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">{flashcard.front}</p>
												<div className="flex items-center gap-2 mt-1">
													<span
														className={`text-xs px-2 py-0.5 rounded-full font-medium ${
															difficultyColors[flashcard.difficulty]
														}`}
													>
														{flashcard.difficulty}
													</span>
													<span className="text-xs text-muted-foreground">{flashcard.topic}</span>
												</div>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													onEditFlashcard?.(flashcard);
												}}
											>
												<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
											</Button>
										</div>

										<AnimatePresence>
											{expandedCard === flashcard.id && (
												<m.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													className="overflow-hidden"
												>
													<div className="pt-3 mt-3 border-t border-border/50">
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{flashcard.back}
														</p>
													</div>
												</m.div>
											)}
										</AnimatePresence>
									</button>
								</m.div>
							))
						)}

						{flashcards.length > 5 && (
							<p className="text-sm text-muted-foreground text-center">
								+{flashcards.length - 5} more flashcard{flashcards.length - 5 > 1 ? 's' : ''}
							</p>
						)}
					</div>

					<div className="p-4 border-t border-border bg-secondary/30 flex gap-3">
						<Button variant="outline" className="flex-1" onClick={handleDismiss}>
							Dismiss
						</Button>
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => flashcards[0] && onEditFlashcard?.(flashcards[0])}
						>
							<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 mr-2" />
							Edit Flashcard
						</Button>
						<Button
							className="flex-1 bg-primary-orange hover:bg-primary-orange/90 text-white"
							onClick={handleStartReview}
							disabled={isLoading}
						>
							<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
							Start Review
						</Button>
					</div>
				</Card>
			</m.div>
		</AnimatePresence>
	);
});

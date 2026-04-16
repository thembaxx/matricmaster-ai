'use client';

import { CheckmarkCircle02Icon, Layers01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateFlashcardsFromMistakes } from '@/lib/db/learning-loop-actions';
import { useQuizToStudyPlanStore } from '@/stores/useQuizToStudyPlanStore';

interface FlashcardGeneratorProps {
	mistakeCount: number;
}

export const FlashcardGenerator = memo(function FlashcardGenerator({
	mistakeCount,
}: FlashcardGeneratorProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationResult, setGenerationResult] = useState<{
		success: boolean;
		cardsCreated: number;
	} | null>(null);
	const weakTopics = useQuizToStudyPlanStore((s) => s.weakTopics);

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			// If we have weak topics from quiz, generate flashcards for them
			if (weakTopics.length > 0) {
				const { generateFlashcardsForWeakTopic } = await import(
					'@/services/adaptiveLearningService'
				);
				let totalCreated = 0;
				for (const topic of weakTopics) {
					const result = await generateFlashcardsForWeakTopic(topic.topic, topic.subject);
					if (result.success) {
						totalCreated += result.cardsCreated;
					}
				}
				setGenerationResult({ success: true, cardsCreated: totalCreated });
			} else {
				const result = await generateFlashcardsFromMistakes();
				setGenerationResult(result);
			}
		} catch (error) {
			console.error('Failed to generate flashcards:', error);
			setGenerationResult({ success: false, cardsCreated: 0 });
		} finally {
			setIsGenerating(false);
		}
	};

	if (generationResult) {
		return (
			<m.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="w-full max-w-md space-y-3 mb-8"
			>
				<div className="bg-card p-6 rounded-[2rem] flex items-center gap-4 shadow-lg border border-green-500/20">
					<div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-green-500" />
					</div>
					<div>
						<p className="font-bold text-foreground">
							{generationResult.cardsCreated > 0
								? `${generationResult.cardsCreated} Flashcards Created!`
								: 'No New Cards'}
						</p>
						<p className="text-sm text-muted-foreground">
							{generationResult.cardsCreated > 0
								? 'Added to your Mistake Master deck'
								: 'All mistakes already have flashcards'}
						</p>
					</div>
				</div>
			</m.div>
		);
	}

	if (mistakeCount === 0) return null;

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.55 }}
			className="w-full max-w-md space-y-3 mb-8"
		>
			<Button
				variant="outline"
				className="w-full h-16 rounded-2xl text-lg font-black shadow-lg border-primary-orange/30 hover:bg-primary-orange/10 flex items-center justify-center gap-3"
				onClick={handleGenerate}
				disabled={isGenerating}
			>
				{isGenerating ? (
					<>
						<div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
						Generating...
					</>
				) : (
					<>
						<HugeiconsIcon icon={Layers01Icon} className="w-6 h-6 text-primary-orange" />
						Create Flashcards from Mistakes
					</>
				)}
			</Button>
			<p className="text-center text-sm text-muted-foreground font-medium">
				{mistakeCount} {mistakeCount === 1 ? 'mistake' : 'mistakes'} to review
			</p>
		</m.div>
	);
});

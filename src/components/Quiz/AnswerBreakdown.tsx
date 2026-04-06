'use client';

import { Cancel01Icon, CheckmarkCircle02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import { cn } from '@/lib/utils';
import { generateAnswerExplanation, getExplanation } from '@/services/geminiService';

interface AnswerBreakdownProps {
	correctAnswer: string;
	selectedAnswer: string | null;
	isCorrect: boolean;
	topic: string;
	question: string;
	subject: string;
	onContinue?: () => void;
}

export function AnswerBreakdown({
	correctAnswer,
	selectedAnswer,
	isCorrect,
	topic,
	question,
	subject,
	onContinue,
}: AnswerBreakdownProps) {
	const { triggerQuotaError } = useGeminiQuotaModal();
	const [showAnswerExplanation, setShowAnswerExplanation] = useState(false);

	const { data: explanation, isLoading: loading } = useQuery({
		queryKey: ['explanation', topic],
		queryFn: async () => {
			try {
				const result = await getExplanation('General', topic);
				return result;
			} catch (err) {
				if (isQuotaError(err)) {
					triggerQuotaError();
				}
				console.debug('Failed to fetch explanation:', err);
				return null;
			}
		},
	});

	const {
		data: answerExplanation,
		isLoading: answerExplanationLoading,
		refetch: refetchAnswerExplanation,
	} = useQuery({
		queryKey: ['answer-explanation', question, correctAnswer, selectedAnswer, subject, topic],
		queryFn: async () => {
			try {
				const result = await generateAnswerExplanation(
					question,
					correctAnswer,
					selectedAnswer || '',
					subject,
					topic
				);
				return result;
			} catch (err) {
				if (isQuotaError(err)) {
					triggerQuotaError();
				}
				console.debug('Failed to fetch answer explanation:', err);
				return null;
			}
		},
		enabled: false, // Only run when manually triggered
	});

	return (
		<div aria-live="polite" aria-atomic="true">
			<Card
				className={cn(
					'p-6 rounded-[1.5rem] border-0 shadow-tiimo overflow-hidden',
					isCorrect ? 'bg-success/5' : 'bg-destructive/5'
				)}
			>
				{isCorrect && (
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success to-emerald-400" />
				)}
				{!isCorrect && (
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive to-red-400" />
				)}

				<div className="flex gap-5">
					<div
						className={cn(
							'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
							isCorrect ? 'bg-success text-white' : 'bg-destructive text-white'
						)}
					>
						<HugeiconsIcon
							icon={isCorrect ? CheckmarkCircle02Icon : Cancel01Icon}
							className="w-7 h-7"
						/>
					</div>
					<div className="flex-1 space-y-4">
						<div>
							<h4 className="font-display font-bold text-xl text-foreground">
								{isCorrect ? 'Brilliant!' : 'Not quite right'}
							</h4>
							<p className="text-sm text-muted-foreground mt-1">
								{isCorrect ? 'Keep up the great work!' : "Don't worry, practice makes perfect."}
							</p>
						</div>

						<div className="space-y-2">
							{!isCorrect && selectedAnswer && (
								<div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10">
									<span className="text-xs font-medium text-destructive">Your answer:</span>
									<span className="text-sm font-medium">{selectedAnswer}</span>
								</div>
							)}
							<div className="flex items-center gap-2 p-3 rounded-xl bg-success/10">
								<span className="text-xs font-medium text-success">Correct answer:</span>
								<span className="text-sm font-bold">{correctAnswer}</span>
							</div>
						</div>

						{!loading && explanation && (
							<div className="p-4 rounded-xl bg-card border border-border/50">
								<div className="flex items-center gap-2 mb-2">
									<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
									<p className="text-xs font-semibold text-primary">AI Explanation</p>
								</div>
								<p className="text-sm text-foreground/80 leading-relaxed">{explanation}</p>
							</div>
						)}

						{loading && (
							<div className="space-y-3">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						)}

						{!isCorrect && !showAnswerExplanation && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setShowAnswerExplanation(true);
									refetchAnswerExplanation();
								}}
								className="rounded-full gap-2 mt-4"
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
								Explain My Mistake
							</Button>
						)}

						{showAnswerExplanation && (
							<div className="p-4 rounded-xl bg-card border border-border/50 mt-4">
								<div className="flex items-center gap-2 mb-2">
									<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
									<p className="text-xs font-semibold text-primary">Why You Got It Wrong</p>
								</div>
								{answerExplanationLoading ? (
									<div className="space-y-3">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-4 w-2/3" />
									</div>
								) : answerExplanation ? (
									<p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
										{answerExplanation}
									</p>
								) : (
									<p className="text-sm text-destructive">
										Failed to load explanation. Please try again.
									</p>
								)}
							</div>
						)}

						{onContinue && (
							<Button onClick={onContinue} className="rounded-full h-11 px-6 font-medium">
								Continue
							</Button>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}

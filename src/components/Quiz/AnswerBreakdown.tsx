'use client';

import { Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getExplanation } from '@/services/geminiService';

interface AnswerBreakdownProps {
	correctAnswer: string;
	selectedAnswer: string | null;
	isCorrect: boolean;
	topic: string;
	onContinue?: () => void;
}

export function AnswerBreakdown({
	correctAnswer,
	selectedAnswer,
	isCorrect,
	topic,
	onContinue,
}: AnswerBreakdownProps) {
	const [explanation, setExplanation] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchExplanation() {
			try {
				const result = await getExplanation('General', topic);
				setExplanation(result);
			} catch (error) {
				console.error('Failed to fetch explanation:', error);
			} finally {
				setLoading(false);
			}
		}
		fetchExplanation();
	}, [topic]);

	return (
		<Card
			className={cn(
				'p-6 rounded-2xl border-2',
				isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'
			)}
		>
			<div className="flex gap-4">
				<div
					className={cn(
						'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
						isCorrect ? 'bg-success text-white' : 'bg-destructive text-white'
					)}
				>
					<HugeiconsIcon
						icon={isCorrect ? CheckmarkCircle02Icon : Cancel01Icon}
						className="w-6 h-6"
					/>
				</div>
				<div className="flex-1 space-y-3">
					<h4 className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Not quite right'}</h4>

					<div className="space-y-2">
						{!isCorrect && selectedAnswer && (
							<p className="text-sm text-muted-foreground">
								You selected: <span className="font-medium">{selectedAnswer}</span>
							</p>
						)}
						<p className="text-sm">
							Correct answer: <span className="font-bold text-success">{correctAnswer}</span>
						</p>
					</div>

					{!loading && explanation && (
						<div className="mt-4 p-3 rounded-xl bg-background/50">
							<p className="text-xs font-medium text-muted-foreground mb-1">Explanation:</p>
							<p className="text-sm text-foreground/80">{explanation}</p>
						</div>
					)}

					{loading && (
						<div className="mt-4 animate-pulse">
							<div className="h-4 bg-muted rounded w-3/4 mb-2" />
							<div className="h-4 bg-muted rounded w-1/2" />
						</div>
					)}

					{onContinue && (
						<button
							type="button"
							onClick={onContinue}
							className="mt-4 text-sm font-medium text-primary hover:underline"
						>
							Continue
						</button>
					)}
				</div>
			</div>
		</Card>
	);
}

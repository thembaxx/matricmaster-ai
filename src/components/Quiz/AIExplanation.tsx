'use client';

import { Loading03Icon, SparklesIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIExplanationProps {
	question: string;
	correctAnswer?: string;
	explanation?: string;
	className?: string;
}

export function AIExplanation({ question, correctAnswer, className }: AIExplanationProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [explanation, setExplanation] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showAudioPlayer, setShowAudioPlayer] = useState(false);

	const handleExplain = async () => {
		setIsExpanded(true);
		if (explanation) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: `Explain this question and provide the answer: ${question}${
						correctAnswer ? ` The correct answer is: ${correctAnswer}` : ''
					}`,
					includeSuggestions: false,
				}),
			});

			const data = await response.json();

			if (data.response) {
				setExplanation(data.response);
			} else {
				setError('Failed to get explanation. Please try again.');
			}
		} catch (error) {
			console.error('Failed to get AI explanation:', error);
			setError('Failed to get explanation. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Card
				className={cn(
					'bg-muted/30 border-dashed transition-all',
					isExpanded ? 'border-primary/50' : 'border-transparent',
					className
				)}
			>
				<div className="p-4">
					{!isExpanded ? (
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<h4 className="text-sm font-medium">Explain this question</h4>
								<p className="text-xs text-muted-foreground mt-0.5">
									Get AI assistance to understand this question
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={handleExplain}
								className="ml-4 rounded-full gap-2"
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
								Explain
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium flex items-center gap-2">
									<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
									AI explanation
								</h4>
								<div className="flex items-center gap-2">
									{explanation && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setShowAudioPlayer(true)}
											className="rounded-full h-8 w-8"
											title="Listen to explanation"
										>
											<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setIsExpanded(false)}
										className="text-xs"
									>
										Close
									</Button>
								</div>
							</div>

							{isLoading && (
								<div className="space-y-3">
									<div className="flex items-center gap-3 p-3">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<HugeiconsIcon
												icon={Loading03Icon}
												className="w-4 h-4 text-primary animate-spin"
											/>
										</div>
										<div className="flex-1 space-y-2">
											<div className="h-3 bg-muted rounded animate-pulse w-3/4" />
											<div className="h-3 bg-muted rounded animate-pulse w-1/2" />
										</div>
									</div>
									<div className="space-y-2 px-3">
										<div className="h-2 bg-muted rounded animate-pulse" />
										<div className="h-2 bg-muted rounded animate-pulse w-5/6" />
										<div className="h-2 bg-muted rounded animate-pulse w-4/6" />
									</div>
								</div>
							)}

							{error && (
								<div className="p-3 bg-destructive/10 rounded-lg">
									<p className="text-sm text-destructive">{error}</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleExplain}
										className="mt-2 text-xs"
									>
										Try again
									</Button>
								</div>
							)}

							{explanation && (
								<div className="p-4 bg-card rounded-xl border">
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<p className="text-sm whitespace-pre-wrap">{explanation}</p>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</Card>

			{explanation && (
				<ResponsiveAudioPlayer
					text={explanation}
					title="Question Explanation"
					open={showAudioPlayer}
					onOpenChange={setShowAudioPlayer}
				/>
			)}
		</>
	);
}

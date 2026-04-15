'use client';

import { AlertCircleIcon, BookOpenIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface WrongAnswerExplanationButtonProps {
	questionId: string;
	questionText: string;
	correctAnswer: string;
	quizId?: string;
	className?: string;
}

export function WrongAnswerExplanationButton({
	questionId,
	questionText,
	correctAnswer,
	quizId = 'single-question',
	className,
}: WrongAnswerExplanationButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [explanation, setExplanation] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGetExplanation = async () => {
		if (explanation) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/learning-loop/convert-wrong-answers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quizId,
					questionIds: [questionId],
				}),
			});

			const data = await response.json();

			if (data.success && data.explanations?.[0]?.explanation) {
				setExplanation(data.explanations[0].explanation);
			} else {
				setError(data.error || 'Failed to get explanation. Please try again.');
			}
		} catch (err) {
			console.error('Failed to get AI explanation:', err);
			setError('Failed to get explanation. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setExplanation(null);
			setError(null);
		}
	};

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Dialog open={isOpen} onOpenChange={handleOpenChange}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn('gap-2 text-muted-foreground hover:text-foreground', className)}
							>
								<BookOpenIcon className="w-4 h-4" />
								<span className="text-sm">Get AI Explanation</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle className="font-geist text-lg">Step-by-step explanation</DialogTitle>
								<DialogDescription className="font-geist text-sm text-muted-foreground">
									AI-powered explanation for this question
								</DialogDescription>
							</DialogHeader>

							<div className="mt-4 space-y-4">
								<div className="p-4 bg-muted/30 rounded-lg border">
									<h4 className="text-sm font-medium mb-2">Question:</h4>
									<p className="text-sm font-geist">{questionText}</p>
									{correctAnswer && (
										<div className="mt-3 pt-3 border-t">
											<p className="text-sm">
												<span className="font-medium">Correct answer: </span>
												<span className="text-primary font-geist">{correctAnswer}</span>
											</p>
										</div>
									)}
								</div>

								{isLoading && (
									<div className="space-y-3">
										<div className="flex items-center gap-3 p-3">
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
												<BookOpenIcon className="w-4 h-4 text-primary" />
											</div>
											<div className="flex-1 space-y-2">
												<Skeleton className="h-3 w-3/4" />
												<Skeleton className="h-3 w-1/2" />
											</div>
										</div>
										<div className="space-y-2 px-3">
											<Skeleton className="h-2" />
											<Skeleton className="h-2 w-5/6" />
											<Skeleton className="h-2 w-4/6" />
										</div>
									</div>
								)}

								{error && (
									<div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
										<AlertCircleIcon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
										<div className="flex-1">
											<p className="text-sm text-destructive">{error}</p>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleGetExplanation}
												className="mt-2 text-xs"
											>
												Try again
											</Button>
										</div>
									</div>
								)}

								{explanation && (
									<div className="p-4 bg-card rounded-xl border">
										<div className="prose prose-sm max-w-none font-geist">
											<p
												dangerouslySetInnerHTML={{
													__html: explanation.replace(/\n/g, '<br />'),
												}}
											/>
										</div>
									</div>
								)}

								{!explanation && !error && !isLoading && (
									<div className="flex justify-center py-4">
										<Button onClick={handleGetExplanation} className="gap-2">
											<BookOpenIcon className="w-4 h-4" />
											Get Explanation
										</Button>
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>
				</TooltipTrigger>
				<TooltipContent>
					<p className="font-geist text-xs">Get step-by-step explanation</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

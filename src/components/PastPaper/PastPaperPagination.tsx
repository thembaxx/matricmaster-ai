'use client';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface PastPaperPaginationProps {
	totalQuestions: number;
	currentQuestionIndex: number;
	hasPreviousQuestions: boolean;
	hasMoreQuestions: boolean;
	previousQuestion: () => void;
	nextQuestion: () => void;
	goToQuestion: (index: number) => void;
}

export function PastPaperPagination({
	totalQuestions,
	currentQuestionIndex,
	hasPreviousQuestions,
	hasMoreQuestions,
	previousQuestion,
	nextQuestion,
	goToQuestion,
}: PastPaperPaginationProps) {
	if (totalQuestions === 0) return null;

	return (
		<footer className="absolute bottom-0 left-0 ios-glass border-t border-border px-6 py-4 pb-8 z-30 w-full">
			<div className="max-w-full mx-auto flex items-center gap-4">
				<Button
					variant="outline"
					size="sm"
					disabled={!hasPreviousQuestions}
					onClick={previousQuestion}
					className="gap-2"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
				</Button>

				<div className="flex items-center gap-2 grow">
					{Array.from({ length: totalQuestions }, (_, i) => i)
						.filter((i) => {
							if (i < 3 || i >= totalQuestions - 3) return true;
							if (Math.abs(i - currentQuestionIndex) <= 1) return true;
							return false;
						})
						.map((i, _, arr) => {
							const showEllipsis =
								i > 0 && !arr.includes(i - 1) && !(Math.abs(i - currentQuestionIndex) <= 1);
							return (
								<div key={`page-${i}`} className="flex items-center gap-2">
									{showEllipsis && <span className="text-muted-foreground">...</span>}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => goToQuestion(i)}
										className={`w-8 h-8 rounded-lg font-bold text-xs ${
											currentQuestionIndex === i
												? 'bg-brand-blue text-white'
												: 'bg-muted text-muted-foreground hover:bg-brand-blue/10'
										}`}
									>
										{i + 1}
									</Button>
								</div>
							);
						})}
				</div>

				<Button
					variant="outline"
					size="sm"
					disabled={!hasMoreQuestions}
					onClick={nextQuestion}
					className="gap-2"
				>
					<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
				</Button>
			</div>
		</footer>
	);
}

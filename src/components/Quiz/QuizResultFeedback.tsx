'use client';

import { CheckmarkCircle02Icon as CheckCircle, SquareArrowRight01Icon as SkipForward } from 'hugeicons-react';

type QuizResultFeedbackProps = {
	showResult: boolean;
	isCorrect: boolean;
	correctAnswer?: string;
	correctMessage?: string;
	incorrectMessage?: string;
};

export function QuizResultFeedback({
	showResult,
	isCorrect,
	correctAnswer,
	correctMessage = 'Excellent understanding of the principles involved.',
	incorrectMessage,
}: QuizResultFeedbackProps) {
	if (!showResult) return null;

	return (
		<div
			className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-4 ${
				isCorrect
					? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
					: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
			}`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
						isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
					}`}
				>
					{isCorrect ? (
						<CheckCircle className="w-5 h-5 text-green-600" />
					) : (
						<SkipForward className="w-5 h-5 text-red-600" />
					)}
				</div>
				<div>
					<h4
						className={`font-black text-xs uppercase tracking-widest mb-1 ${
							isCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
						}`}
					>
						{isCorrect ? 'Correct! Well done' : 'Not quite right'}
					</h4>
					<p
						className={`text-sm font-medium ${
							isCorrect
								? 'text-green-800/80 dark:text-green-200/80'
								: 'text-red-800/80 dark:text-red-200/80'
						}`}
					>
						{isCorrect
							? correctMessage
							: incorrectMessage ||
								(correctAnswer
									? `The correct answer is ${correctAnswer}. Let's review the hint.`
									: 'Try again!')}
					</p>
				</div>
			</div>
		</div>
	);
}

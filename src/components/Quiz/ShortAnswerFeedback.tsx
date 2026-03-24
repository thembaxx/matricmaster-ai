'use client';

interface ShortAnswerFeedbackProps {
	isCorrect: boolean;
	feedback: string;
	correctAnswer: string;
}

export function ShortAnswerFeedback({
	isCorrect,
	feedback,
	correctAnswer,
}: ShortAnswerFeedbackProps) {
	return (
		<div className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-6 sm:p-8">
			<div className="flex items-start gap-3">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
						isCorrect ? 'bg-tiimo-green/10 text-tiimo-green' : 'bg-destructive/10 text-destructive'
					}`}
				>
					<svg
						className="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						{isCorrect ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						)}
					</svg>
				</div>
				<div className="flex-1">
					<p className="font-semibold text-foreground mb-1">
						{isCorrect ? 'correct!' : 'not quite right'}
					</p>
					<p className="text-sm text-muted-foreground">{feedback}</p>
					<p className="text-xs text-muted-foreground mt-2">
						correct answer: <span className="font-semibold text-foreground">{correctAnswer}</span>
					</p>
				</div>
			</div>
		</div>
	);
}

'use client';

interface QuestionNavigationProps {
	questions: Array<{ id: string; questionNumber: string | number }>;
	currentQuestionIndex: number;
	onGoToQuestion: (index: number) => void;
}

export function QuestionNavigation({
	questions,
	currentQuestionIndex,
	onGoToQuestion,
}: QuestionNavigationProps) {
	return (
		<div className="mb-6">
			<h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-3 px-1">
				Jump to Question
			</h3>
			<div className="flex flex-wrap gap-2">
				{questions.map((q, idx) => (
					<button
						type="button"
						key={q.id}
						onClick={() => onGoToQuestion(idx)}
						className={`w-10 h-10 p-0 rounded-xl font-bold border-2 transition-all ${
							currentQuestionIndex === idx
								? 'border-brand-blue bg-brand-blue text-white'
								: 'border-zinc-200 dark:border-zinc-700 text-muted-foreground hover:border-brand-blue'
						}`}
					>
						{q.questionNumber}
					</button>
				))}
			</div>
		</div>
	);
}

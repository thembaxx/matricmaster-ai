import { Button } from '@/components/ui/button';

export function QuestionJumpNav({
	questions,
	currentQuestionIndex,
	onGoToQuestion,
}: {
	questions: Array<{ id: string; questionNumber: string | number }>;
	currentQuestionIndex: number;
	onGoToQuestion: (index: number) => void;
}) {
	if (questions.length === 0) return null;

	return (
		<div className="mb-6">
			<h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-3 px-1">
				Jump to Question
			</h3>
			<div className="flex flex-wrap gap-2">
				{questions.map((q, idx) => (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						key={q.id}
						onClick={() => onGoToQuestion(idx)}
						className={`w-10 h-10 p-0 rounded-xl font-bold border-2 ${
							currentQuestionIndex === idx
								? 'border-brand-blue bg-brand-blue text-white'
								: 'border-zinc-200 dark:border-zinc-700 text-muted-foreground hover:border-brand-blue'
						}`}
					>
						{q.questionNumber}
					</Button>
				))}
			</div>
		</div>
	);
}

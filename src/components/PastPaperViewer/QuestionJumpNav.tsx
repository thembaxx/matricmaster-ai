'use client';

import { Button } from '@/components/ui/button';

interface Question {
	id: string;
	questionNumber: string | number;
}

interface QuestionJumpNavProps {
	questions: Question[];
	currentQuestionIndex: number;
	onGoToQuestion: (index: number) => void;
}

export function QuestionJumpNav({
	questions,
	currentQuestionIndex,
	onGoToQuestion,
}: QuestionJumpNavProps) {
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
						className={`w-10 h-10 p-0 rounded-xl font-bold border-2 transition-all ${
							currentQuestionIndex === idx
								? 'border-brand-blue bg-brand-blue text-white'
								: 'border-border text-muted-foreground hover:border-brand-blue'
						}`}
					>
						{q.questionNumber}
					</Button>
				))}
			</div>
		</div>
	);
}

import type { PracticeProblem } from './PracticeQuestion';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface PracticeAnswersListProps {
	problems: PracticeProblem[];
	answers: Record<string, string>;
	answerStates: Record<string, AnswerState>;
}

export function PracticeAnswersList({ problems, answers, answerStates }: PracticeAnswersListProps) {
	return (
		<div className="space-y-4 text-left mt-6">
			{problems.map((problem, index) => (
				<div
					key={problem.id}
					className={`p-4 rounded-lg border ${
						answerStates[problem.id] === 'correct'
							? 'border-green-500 bg-green-50'
							: 'border-red-500 bg-red-50'
					}`}
				>
					<p className="font-medium">
						{index + 1}. {problem.question}
					</p>
					<p className="text-sm mt-1">
						<span className="text-muted-foreground">Your answer:</span>{' '}
						<span
							className={answerStates[problem.id] === 'correct' ? 'text-green-600' : 'text-red-600'}
						>
							{answers[problem.id] || 'No answer'}
						</span>
					</p>
					{answerStates[problem.id] === 'incorrect' && (
						<p className="text-sm">
							<span className="text-muted-foreground">Correct answer:</span>{' '}
							<span className="text-green-600">{problem.answer}</span>
						</p>
					)}
				</div>
			))}
		</div>
	);
}

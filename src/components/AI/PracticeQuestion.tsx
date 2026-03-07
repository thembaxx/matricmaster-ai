import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface PracticeProblem {
	id: string;
	question: string;
	type: 'multiple-choice' | 'short-answer' | 'step-by-step';
	options?: string[];
	answer: string;
	explanation: string;
}

interface PracticeQuestionProps {
	problem: PracticeProblem;
	answer: string | undefined;
	showExplanation: boolean;
	onAnswerSelect: (answer: string) => void;
}

export function PracticeQuestion({
	problem,
	answer,
	showExplanation,
	onAnswerSelect,
}: PracticeQuestionProps) {
	const questionId = useId();
	const getDifficultyColor = (type: string) => {
		switch (type) {
			case 'multiple-choice':
				return 'bg-green-100 text-green-800';
			case 'short-answer':
				return 'bg-yellow-100 text-yellow-800';
			case 'step-by-step':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Badge className={getDifficultyColor(problem.type)}>{problem.type.replace('-', ' ')}</Badge>
			</div>

			<div className="p-4 bg-muted rounded-lg">
				<p className="font-medium text-lg">{problem.question}</p>
			</div>

			{problem.type === 'multiple-choice' && problem.options && (
				<RadioGroup value={answer || ''} onValueChange={onAnswerSelect} disabled={showExplanation}>
					{problem.options.map((option, index) => (
						<div
							key={option}
							className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
								showExplanation && option === problem.answer
									? 'border-green-500 bg-green-50'
									: showExplanation && answer === option && option !== problem.answer
										? 'border-red-500 bg-red-50'
										: answer === option
											? 'border-primary bg-primary/5'
											: 'hover:bg-muted/50'
							}`}
						>
							<RadioGroupItem value={option} id={`option-${index}`} />
							<Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
								{option}
							</Label>
							{showExplanation && option === problem.answer && (
								<CheckCircle className="h-5 w-5 text-green-500" />
							)}
							{showExplanation && answer === option && option !== problem.answer && (
								<XCircle className="h-5 w-5 text-red-500" />
							)}
						</div>
					))}
				</RadioGroup>
			)}

			{problem.type === 'short-answer' && (
				<div className="space-y-2">
					<Label htmlFor={`short-answer-${questionId}`}>Your Answer</Label>
					<Input
						id={`short-answer-${questionId}`}
						value={answer || ''}
						onChange={(e) => onAnswerSelect(e.target.value)}
						placeholder="TextT your answer..."
						disabled={showExplanation}
					/>
					{showExplanation && (
						<p className="text-sm">
							<span className="text-muted-foreground">Correct answer: </span>
							<span className="text-green-600 font-medium">{problem.answer}</span>
						</p>
					)}
				</div>
			)}

			{problem.type === 'step-by-step' && (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						This is a step-by-step problem. Try to solve it, then check the solution.
					</p>
					<Input
						value={answer || ''}
						onChange={(e) => onAnswerSelect(e.target.value)}
						placeholder="TextT your final answer..."
						disabled={showExplanation}
					/>
				</div>
			)}

			{showExplanation && (
				<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
					<p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Explanation:</p>
					<p className="text-sm text-blue-700 dark:text-blue-400">{problem.explanation}</p>
				</div>
			)}
		</div>
	);
}

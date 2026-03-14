import { CheckmarkCircle02Icon as CheckCircle, Clock01Icon as Clock, IdeaIcon as Lightbulb } from 'hugeicons-react';
import { Button } from '@/components/ui/button';

interface PracticeCompleteProps {
	correctCount: number;
	totalProblems: number;
	showAllAnswers: boolean;
	onToggleAnswers: () => void;
	onReset: () => void;
}

export function PracticeComplete({
	correctCount,
	totalProblems,
	showAllAnswers,
	onToggleAnswers,
	onReset,
}: PracticeCompleteProps) {
	const CurrentIcon =
		correctCount === totalProblems
			? CheckCircle
			: correctCount >= totalProblems / 2
				? Lightbulb
				: Clock;

	const getMessage = () => {
		if (correctCount === totalProblems) return 'Perfect score! 🎉';
		if (correctCount >= totalProblems / 2) return 'Good job! Keep practicing!';
		return 'Keep learning!';
	};

	return (
		<div className="text-center py-8 space-y-6">
			<div className="flex justify-center">
				<CurrentIcon
					className={`h-16 w-16 stroke-[3] ${
						correctCount === totalProblems
							? 'text-green-500'
							: correctCount >= totalProblems / 2
								? 'text-yellow-500'
								: 'text-orange-500'
					}`}
				/>
			</div>
			<div>
				<h3 className="text-xl font-bold">{getMessage()}</h3>
				<p className="text-muted-foreground">
					You got {correctCount} out of {totalProblems} correct
				</p>
			</div>
			<div className="flex gap-3 justify-center">
				<Button variant="outline" onClick={onToggleAnswers}>
					{showAllAnswers ? 'Hide' : 'Show'} all answers
				</Button>
				<Button onClick={onReset}>Try again</Button>
			</div>
		</div>
	);
}

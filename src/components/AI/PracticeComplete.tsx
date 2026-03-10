import { CheckmarkCircle02Icon, Clock01Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
	const getIcon = () => {
		if (correctCount === totalProblems) return CheckmarkCircle02Icon;
		if (correctCount >= totalProblems / 2) return Idea01Icon;
		return Clock01Icon;
	};

	const getMessage = () => {
		if (correctCount === totalProblems) return 'Perfect Score! 🎉';
		if (correctCount >= totalProblems / 2) return 'Good Job! Keep Practicing!';
		return 'Keep Learning!';
	};

	const icon = getIcon();

	return (
		<div className="text-center py-8 space-y-6">
			<div className="flex justify-center">
				<HugeiconsIcon
					icon={icon}
					className={`h-16 w-16 ${
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
					{showAllAnswers ? 'Hide' : 'Show'} All Answers
				</Button>
				<Button onClick={onReset}>Try Again</Button>
			</div>
		</div>
	);
}

import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Clock, Lightbulb } from 'lucide-react';
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
	const getIcon = (): LucideIcon => {
		if (correctCount === totalProblems) return CheckCircle;
		if (correctCount >= totalProblems / 2) return Lightbulb;
		return Clock;
	};

	const getMessage = () => {
		if (correctCount === totalProblems) return 'Perfect Score! 🎉';
		if (correctCount >= totalProblems / 2) return 'Good Job! Keep Practicing!';
		return 'Keep Learning!';
	};

	const Icon = getIcon();

	return (
		<div className="text-center py-8 space-y-6">
			<div className="flex justify-center">
				<Icon
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

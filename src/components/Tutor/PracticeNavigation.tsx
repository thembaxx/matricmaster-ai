import { ArrowLeft01Icon as CaretLeft, ArrowRight01Icon as CaretRight } from 'hugeicons-react';
import { Button } from '@/components/ui/button';

interface PracticeNavigationProps {
	currentIndex: number;
	totalProblems: number;
	showExplanation: boolean;
	hasAnswer: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onCheckAnswer: () => void;
}

export function PracticeNavigation({
	currentIndex,
	totalProblems,
	showExplanation,
	hasAnswer,
	onPrevious,
	onNext,
	onCheckAnswer,
}: PracticeNavigationProps) {
	return (
		<div className="flex justify-between items-center pt-4 border-t">
			<Button variant="outline" onClick={onPrevious} disabled={currentIndex === 0}>
				<CaretLeft className="h-4 w-4 mr-1 stroke-[3]" />
				Previous
			</Button>

			{!showExplanation ? (
				<Button onClick={onCheckAnswer} disabled={!hasAnswer}>
					Check answer
				</Button>
			) : (
				<Button onClick={onNext} disabled={currentIndex === totalProblems - 1}>
					Next
					<CaretRight className="h-4 w-4 ml-1 stroke-[3]" />
				</Button>
			)}
		</div>
	);
}

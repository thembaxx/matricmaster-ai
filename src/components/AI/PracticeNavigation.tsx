import { ChevronLeft, ChevronRight } from 'lucide-react';
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
				<ChevronLeft className="h-4 w-4 mr-1" />
				Previous
			</Button>

			{!showExplanation ? (
				<Button onClick={onCheckAnswer} disabled={!hasAnswer}>
					Check Answer
				</Button>
			) : (
				<Button onClick={onNext} disabled={currentIndex === totalProblems - 1}>
					Next
					<ChevronRight className="h-4 w-4 ml-1" />
				</Button>
			)}
		</div>
	);
}

'use client';

import { IdeaIcon as Lightbulb } from 'hugeicons-react';
import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PracticeAnswersList } from './PracticeAnswersList';
import { PracticeComplete } from './PracticeComplete';
import { PracticeNavigation } from './PracticeNavigation';
import type { PracticeProblem } from './PracticeQuestion';
import { PracticeQuestion } from './PracticeQuestion';

interface PracticeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	problems: PracticeProblem[];
	subject?: string;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function PracticeModal({ open, onOpenChange, problems, subject }: PracticeModalProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({});
	const [showExplanation, setShowExplanation] = useState(false);
	const [showAllAnswers, setShowAllAnswers] = useState(false);

	const currentProblem = problems[currentIndex];
	const progress = ((currentIndex + 1) / problems.length) * 100;
	const correctCount = Object.values(answerStates).filter((s) => s === 'correct').length;
	const isComplete = Object.keys(answerStates).length === problems.length;

	const handleAnswerSelect = (answer: string) => {
		setAnswers((prev) => ({ ...prev, [currentProblem.id]: answer }));
	};

	const handleCheckAnswer = () => {
		const userAnswer = answers[currentProblem.id];
		if (!userAnswer) return;

		const isCorrect =
			userAnswer.toLowerCase().trim() === currentProblem.answer.toLowerCase().trim();
		setAnswerStates((prev) => ({
			...prev,
			[currentProblem.id]: isCorrect ? 'correct' : 'incorrect',
		}));
		setShowExplanation(true);
	};

	const handleNext = () => {
		if (currentIndex < problems.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setShowExplanation(false);
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setShowExplanation(false);
		}
	};

	const handleReset = () => {
		setCurrentIndex(0);
		setAnswers({});
		setAnswerStates({});
		setShowExplanation(false);
		setShowAllAnswers(false);
	};

	if (!currentProblem) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5 text-brand-amber stroke-[3]" />
								Practice problems
							</DialogTitle>
							<DialogDescription>
								{subject && <span className="capitalize">{subject}</span>}
								{!isComplete
									? ` • Question ${currentIndex + 1} of ${problems.length}`
									: ' • Complete!'}
							</DialogDescription>
						</div>
						{isComplete && (
							<div className="text-right">
								<p className="text-2xl font-bold text-primary">
									{correctCount}/{problems.length}
								</p>
								<p className="text-xs text-muted-foreground">Correct</p>
							</div>
						)}
					</div>
				</DialogHeader>

				<div className="space-y-4">
					<Progress value={progress} className="h-2" />

					{isComplete ? (
						<>
							<PracticeComplete
								correctCount={correctCount}
								totalProblems={problems.length}
								showAllAnswers={showAllAnswers}
								onToggleAnswers={() => setShowAllAnswers(!showAllAnswers)}
								onReset={handleReset}
							/>
							{showAllAnswers && (
								<PracticeAnswersList
									problems={problems}
									answers={answers}
									answerStates={answerStates}
								/>
							)}
						</>
					) : (
						<>
							<PracticeQuestion
								problem={currentProblem}
								answer={answers[currentProblem.id]}
								showExplanation={showExplanation}
								onAnswerSelect={handleAnswerSelect}
							/>
							<PracticeNavigation
								currentIndex={currentIndex}
								totalProblems={problems.length}
								showExplanation={showExplanation}
								hasAnswer={!!answers[currentProblem.id]}
								onPrevious={handlePrevious}
								onNext={handleNext}
								onCheckAnswer={handleCheckAnswer}
							/>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

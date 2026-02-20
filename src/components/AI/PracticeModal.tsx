'use client';

import {
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	Lightbulb,
	XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PracticeProblem {
	id: string;
	question: string;
	type: 'multiple-choice' | 'short-answer' | 'step-by-step';
	options?: string[];
	answer: string;
	explanation: string;
}

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

	const isComplete = Object.keys(answerStates).length === problems.length;

	if (!currentProblem) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5 text-brand-amber" />
								Practice Problems
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
						<div className="text-center py-8 space-y-6">
							<div className="flex justify-center">
								{correctCount === problems.length ? (
									<CheckCircle className="h-16 w-16 text-green-500" />
								) : correctCount >= problems.length / 2 ? (
									<Lightbulb className="h-16 w-16 text-yellow-500" />
								) : (
									<Clock className="h-16 w-16 text-orange-500" />
								)}
							</div>
							<div>
								<h3 className="text-xl font-bold">
									{correctCount === problems.length
										? 'Perfect Score! 🎉'
										: correctCount >= problems.length / 2
											? 'Good Job! Keep Practicing!'
											: 'Keep Learning!'}
								</h3>
								<p className="text-muted-foreground">
									You got {correctCount} out of {problems.length} correct
								</p>
							</div>
							<div className="flex gap-3 justify-center">
								<Button variant="outline" onClick={() => setShowAllAnswers(!showAllAnswers)}>
									<Eye className="h-4 w-4 mr-2" />
									{showAllAnswers ? 'Hide' : 'Show'} All Answers
								</Button>
								<Button onClick={handleReset}>Try Again</Button>
							</div>

							{showAllAnswers && (
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
													className={
														answerStates[problem.id] === 'correct'
															? 'text-green-600'
															: 'text-red-600'
													}
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
							)}
						</div>
					) : (
						<>
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Badge className={getDifficultyColor(currentProblem.type)}>
										{currentProblem.type.replace('-', ' ')}
									</Badge>
								</div>

								<div className="p-4 bg-muted rounded-lg">
									<p className="font-medium text-lg">{currentProblem.question}</p>
								</div>

								{currentProblem.type === 'multiple-choice' && currentProblem.options && (
									<RadioGroup
										value={answers[currentProblem.id] || ''}
										onValueChange={handleAnswerSelect}
										disabled={showExplanation}
									>
										{currentProblem.options.map((option, index) => (
											<div
												key={option}
												className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
													showExplanation && option === currentProblem.answer
														? 'border-green-500 bg-green-50'
														: showExplanation &&
																answers[currentProblem.id] === option &&
																option !== currentProblem.answer
															? 'border-red-500 bg-red-50'
															: answers[currentProblem.id] === option
																? 'border-primary bg-primary/5'
																: 'hover:bg-muted/50'
												}`}
											>
												<RadioGroupItem value={option} id={`option-${index}`} />
												<Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
													{option}
												</Label>
												{showExplanation && option === currentProblem.answer && (
													<CheckCircle className="h-5 w-5 text-green-500" />
												)}
												{showExplanation &&
													answers[currentProblem.id] === option &&
													option !== currentProblem.answer && (
														<XCircle className="h-5 w-5 text-red-500" />
													)}
											</div>
										))}
									</RadioGroup>
								)}

								{currentProblem.type === 'short-answer' && (
									<div className="space-y-2">
										<Label htmlFor="short-answer">Your Answer</Label>
										<Input
											id="short-answer"
											value={answers[currentProblem.id] || ''}
											onChange={(e) => handleAnswerSelect(e.target.value)}
											placeholder="Type your answer..."
											disabled={showExplanation}
										/>
										{showExplanation && (
											<p className="text-sm">
												<span className="text-muted-foreground">Correct answer: </span>
												<span className="text-green-600 font-medium">{currentProblem.answer}</span>
											</p>
										)}
									</div>
								)}

								{currentProblem.type === 'step-by-step' && (
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">
											This is a step-by-step problem. Try to solve it, then check the solution.
										</p>
										<Input
											value={answers[currentProblem.id] || ''}
											onChange={(e) => handleAnswerSelect(e.target.value)}
											placeholder="Type your final answer..."
											disabled={showExplanation}
										/>
									</div>
								)}

								{showExplanation && (
									<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
										<p className="font-medium text-blue-800 dark:text-blue-300 mb-2">
											Explanation:
										</p>
										<p className="text-sm text-blue-700 dark:text-blue-400">
											{currentProblem.explanation}
										</p>
									</div>
								)}
							</div>

							<div className="flex justify-between items-center pt-4 border-t">
								<Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
									<ChevronLeft className="h-4 w-4 mr-1" />
									Previous
								</Button>

								{!showExplanation ? (
									<Button onClick={handleCheckAnswer} disabled={!answers[currentProblem.id]}>
										Check Answer
									</Button>
								) : (
									<Button onClick={handleNext} disabled={currentIndex === problems.length - 1}>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PracticeModal;

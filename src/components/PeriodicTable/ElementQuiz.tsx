'use client';

import { AnimatePresence, motion as m } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { QuizQuestion } from '@/constants/periodic-table';
import { cn } from '@/lib/utils';

interface ElementQuizProps {
	quizQuestions: QuizQuestion[];
	currentQuestion: number;
	selectedAnswer: number | null;
	showExplanation: boolean;
	quizScore: { correct: number; total: number };
	onSelectAnswer: (index: number) => void;
	onNextQuestion: () => void;
	onExit: () => void;
}

export function ElementQuiz({
	quizQuestions,
	currentQuestion,
	selectedAnswer,
	showExplanation,
	quizScore,
	onSelectAnswer,
	onNextQuestion,
	onExit,
}: ElementQuizProps) {
	const isLastQuestion = currentQuestion >= quizQuestions.length - 1;

	return (
		<>
			<header className="px-4 sm:px-6 pt-6 pb-3 shrink-0 max-w-2xl mx-auto w-full">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-xl font-black tracking-normal">Element Quiz</h1>
						<p className="text-sm text-muted-foreground">
							Question {currentQuestion + 1} of {quizQuestions.length}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-right">
							<p className="text-xs text-muted-foreground">Score</p>
							<p className="text-lg font-black">
								{quizScore.correct}/{quizScore.total}
							</p>
						</div>
						<Button variant="outline" size="sm" onClick={onExit} className="rounded-full font-bold">
							Exit
						</Button>
					</div>
				</div>
				<div className="w-full bg-muted rounded-full h-2 mb-2">
					<div
						className="bg-primary rounded-full h-2 transition-all"
						style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
					/>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-4 py-6 pb-32 max-w-2xl mx-auto w-full">
					<AnimatePresence mode="wait" initial={false}>
						<m.div
							key={currentQuestion}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							<div className="p-6 bg-card rounded-2xl border shadow-sm">
								<h2 className="text-lg font-bold mb-4">
									{quizQuestions[currentQuestion].question}
								</h2>
								<RadioGroup
									value={selectedAnswer?.toString()}
									onValueChange={(val) => onSelectAnswer(Number.parseInt(val, 10))}
									className="space-y-3"
								>
									{quizQuestions[currentQuestion].options.map((option, optIdx) => (
										<div
											key={`option-${option}-${optIdx}`}
											className={cn(
												'flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer',
												showExplanation
													? optIdx === quizQuestions[currentQuestion].correctAnswer
														? 'bg-success/20 border-success'
														: selectedAnswer === optIdx
															? 'bg-destructive/20 border-destructive'
															: 'border-border bg-muted/30'
													: selectedAnswer === optIdx
														? 'border-primary bg-primary/10'
														: 'border-border hover:border-primary/50'
											)}
										>
											<RadioGroupItem value={optIdx.toString()} id={`quiz-opt-${optIdx}`} />
											<Label
												htmlFor={`quiz-opt-${optIdx}`}
												className="flex-1 cursor-pointer font-medium"
											>
												{option}
											</Label>
										</div>
									))}
								</RadioGroup>
								{showExplanation && (
									<div
										className={cn(
											'mt-4 p-4 rounded-xl text-sm',
											selectedAnswer === quizQuestions[currentQuestion].correctAnswer
												? 'bg-success/20 text-success'
												: 'bg-destructive/20 text-destructive'
										)}
									>
										<p className="font-bold mb-1">
											{selectedAnswer === quizQuestions[currentQuestion].correctAnswer
												? 'Correct!'
												: 'Incorrect'}
										</p>
										<p>{quizQuestions[currentQuestion].explanation}</p>
									</div>
								)}
								{showExplanation && (
									<Button onClick={onNextQuestion} className="w-full mt-4 rounded-full font-bold">
										{isLastQuestion ? 'See Results' : 'Next Question'}
									</Button>
								)}
							</div>
						</m.div>
					</AnimatePresence>
				</main>
			</ScrollArea>
		</>
	);
}

interface QuizResultsProps {
	score: { correct: number; total: number };
	onRestart: () => void;
	onExit: () => void;
}

export function QuizResults({ score, onRestart, onExit }: QuizResultsProps) {
	const percentage = Math.round((score.correct / score.total) * 100);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
			<div className="text-center space-y-6 max-w-md">
				<div className="text-6xl">{percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}</div>
				<h2 className="text-3xl font-black">Quiz Complete!</h2>
				<div className="p-6 bg-card rounded-2xl border space-y-4">
					<div>
						<p className="text-muted-foreground text-sm">Your Score</p>
						<p className="text-5xl font-black tabular-nums">
							{score.correct}/{score.total}
						</p>
						<p className="text-2xl font-bold text-primary tabular-nums">{percentage}%</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
						<div className="text-center">
							<p className="text-success font-bold text-xl tabular-nums">{score.correct}</p>
							<p className="text-muted-foreground text-xs">Correct</p>
						</div>
						<div className="text-center">
							<p className="text-destructive font-bold text-xl tabular-nums">
								{score.total - score.correct}
							</p>
							<p className="text-muted-foreground text-xs">Incorrect</p>
						</div>
					</div>
				</div>
				<div className="flex gap-4">
					<Button onClick={onRestart} className="flex-1 rounded-full font-bold">
						Try Again
					</Button>
					<Button onClick={onExit} variant="outline" className="flex-1 rounded-full font-bold">
						Back to Table
					</Button>
				</div>
			</div>
		</div>
	);
}

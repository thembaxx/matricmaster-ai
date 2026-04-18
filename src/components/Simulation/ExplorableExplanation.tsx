'use client';

import { AnimatePresence, motion as m } from 'motion/react';
import { useCallback, useState } from 'react';
import { DURATION } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface ExplorablePart {
	id: string;
	label: string;
	explanation: string;
	quiz: { question: string; options: string[]; answer: number }[];
}

interface ExplorableExplanationProps {
	diagramType: string;
	parts: ExplorablePart[];
	onExplore?: (partId: string) => void;
	children: React.ReactNode;
}

export function ExplorableExplanation({
	diagramType,
	parts,
	onExplore,
	children,
}: ExplorableExplanationProps) {
	const [activePart, setActivePart] = useState<ExplorablePart | null>(null);
	const [mode, setMode] = useState<'explain' | 'quiz'>('explain');
	const [quizIndex, setQuizIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [correctCount, setCorrectCount] = useState(0);

	const handlePartClick = useCallback(
		(partId: string) => {
			const part = parts.find((p) => p.id === partId);
			if (part) {
				setActivePart(part);
				setMode('explain');
				setQuizIndex(0);
				setSelectedAnswer(null);
				setCorrectCount(0);
				onExplore?.(partId);
			}
		},
		[parts, onExplore]
	);

	const handleStartQuiz = useCallback(() => {
		setMode('quiz');
		setQuizIndex(0);
		setSelectedAnswer(null);
		setCorrectCount(0);
	}, []);

	const handleAnswer = useCallback(
		(index: number) => {
			if (selectedAnswer !== null) return;
			setSelectedAnswer(index);
			if (activePart?.quiz[quizIndex]?.answer === index) {
				setCorrectCount((c) => c + 1);
			}
		},
		[selectedAnswer, activePart, quizIndex]
	);

	const handleNextQuestion = useCallback(() => {
		if (quizIndex < (activePart?.quiz.length ?? 0) - 1) {
			setQuizIndex((i) => i + 1);
			setSelectedAnswer(null);
		}
	}, [quizIndex, activePart]);

	const handleClose = useCallback(() => {
		setActivePart(null);
		setMode('explain');
		setQuizIndex(0);
		setSelectedAnswer(null);
		setCorrectCount(0);
	}, []);

	return (
		<div className="relative">
			<div className="explorable-diagram" data-diagram-type={diagramType}>
				{typeof children === 'object' && children !== null
					? (() => {
							const childArray = Array.isArray(children) ? children : [children];
							return childArray.map((child, _i) => {
								if (child && typeof child === 'object' && 'props' in child) {
									const existingOnClick = child.props.onClick;
									const partId = child.props['data-part-id'] as string | undefined;
									return {
										...child,
										props: {
											...child.props,
											onClick: (e: React.MouseEvent) => {
												existingOnClick?.(e);
												if (partId) handlePartClick(partId);
											},
											className: cn(
												child.props.className,
												partId && 'cursor-pointer hover:opacity-80 transition-opacity'
											),
										},
									};
								}
								return child;
							});
						})()
					: children}
			</div>

			<AnimatePresence>
				{activePart && (
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: DURATION.quick }}
						className="mt-3 rounded-2xl border border-border/30 bg-card p-4 shadow-lg"
					>
						<div className="flex items-center justify-between mb-2">
							<h4 className="font-[family-name:var(--font-playfair)] text-sm font-bold">
								{activePart.label}
							</h4>
							<button
								type="button"
								onClick={handleClose}
								className="text-muted-foreground hover:text-foreground text-xs"
							>
								Close
							</button>
						</div>

						{mode === 'explain' && (
							<div className="space-y-3">
								<p className="text-xs text-muted-foreground leading-relaxed">
									{activePart.explanation}
								</p>
								{activePart.quiz.length > 0 && (
									<button
										type="button"
										onClick={handleStartQuiz}
										className="text-xs text-primary hover:underline"
									>
										Quick quiz ({activePart.quiz.length} questions)
									</button>
								)}
							</div>
						)}

						{mode === 'quiz' && activePart.quiz[quizIndex] && (
							<div className="space-y-3">
								<div className="text-xs text-muted-foreground">
									Question {quizIndex + 1} of {activePart.quiz.length}
								</div>
								<p className="text-xs font-medium">{activePart.quiz[quizIndex].question}</p>
								<div className="space-y-1.5">
									{activePart.quiz[quizIndex].options.map((option, idx) => {
										const isCorrect = activePart.quiz[quizIndex].answer === idx;
										const isSelected = selectedAnswer === idx;
										return (
											<button
												key={idx}
												type="button"
												onClick={() => handleAnswer(idx)}
												disabled={selectedAnswer !== null}
												className={cn(
													'w-full text-left px-3 py-2 rounded-xl text-xs transition-colors border',
													selectedAnswer === null
														? 'border-border/30 hover:bg-secondary/50'
														: isCorrect
															? 'border-green-500/50 bg-green-500/10 text-green-700'
															: isSelected
																? 'border-destructive/50 bg-destructive/10 text-destructive'
																: 'border-border/30 opacity-50'
												)}
											>
												{option}
											</button>
										);
									})}
								</div>

								{selectedAnswer !== null && (
									<div className="flex items-center justify-between">
										<span className="text-[10px] text-muted-foreground">
											{correctCount} correct
										</span>
										{quizIndex < activePart.quiz.length - 1 ? (
											<button
												type="button"
												onClick={handleNextQuestion}
												className="text-xs text-primary hover:underline"
											>
												Next
											</button>
										) : (
											<span className="text-xs text-muted-foreground">Quiz complete</span>
										)}
									</div>
								)}
							</div>
						)}
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export type { ExplorableExplanationProps, ExplorablePart };

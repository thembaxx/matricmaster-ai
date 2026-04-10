'use client';

import {
	CancelIcon,
	CheckmarkCircle02Icon,
	CodeCircleIcon,
	EyeIcon,
	Idea01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CommonQuestion } from '@/content/common-questions';
import { cn } from '@/lib/utils';

interface QuestionDialogProps {
	question: CommonQuestion;
	dialogOpen: boolean;
	setDialogOpen: (open: boolean) => void;
	selectedAnswer: string | null;
	onSelectAnswer: (answerId: string) => void;
	showAnswer: boolean;
	onCheckAnswer: () => void;
	showHint: boolean;
	onToggleHint: () => void;
}

export function QuestionDialog({
	question,
	dialogOpen,
	setDialogOpen,
	selectedAnswer,
	onSelectAnswer,
	showAnswer,
	onCheckAnswer,
	showHint,
	onToggleHint,
}: QuestionDialogProps) {
	return (
		<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-background rounded-3xl p-6 shadow-soft-lg z-50 animate-in zoom-in-95 fade-in">
					<div className="space-y-6">
						<div className="flex items-start gap-3">
							<div
								className={cn(
									'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
									question.bgColor
								)}
							>
								<FluentEmoji type="3d" emoji={question.fluentEmoji} size={20} className="w-5 h-5" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex flex-wrap items-center gap-2 mb-1">
									<span className={cn('text-xs font-medium', question.color)}>
										{question.subjectLabel}
									</span>
									<span className="text-xs text-muted-foreground">•</span>
									<span className="text-xs text-muted-foreground">{question.topic}</span>
								</div>
								<p className="text-sm font-medium text-muted-foreground">
									Grade {question.grades.join(', ')} • {question.difficulty}
								</p>
							</div>
							<Dialog.Close asChild>
								<Button variant="ghost" size="icon" className="rounded-full shrink-0">
									<HugeiconsIcon icon={CodeCircleIcon} className="w-5 h-5" />
								</Button>
							</Dialog.Close>
						</div>

						<div className="p-5 bg-muted/30 rounded-2xl">
							<p className="text-xl font-question leading-relaxed">{question.question}</p>
						</div>

						<div className="space-y-3">
							{question.options.map((option) => {
								const isSelected = selectedAnswer === option.id;
								const isCorrectOption = option.id === question.correctAnswer;

								return (
									<Button
										key={option.id}
										type="button"
										variant="ghost"
										disabled={showAnswer}
										onClick={() => onSelectAnswer(option.id)}
										className={cn(
											'w-full flex items-center gap-4 p-4 h-auto rounded-xl border-2 text-left',
											showAnswer
												? isCorrectOption
													? 'bg-tiimo-green/10 border-tiimo-green'
													: isSelected && !isCorrectOption
														? 'bg-destructive/10 border-destructive'
														: 'bg-card border-border/50'
												: isSelected
													? 'bg-tiimo-lavender/10 border-tiimo-lavender'
													: 'bg-card border-border/50 hover:border-tiimo-lavender/30'
										)}
									>
										<div
											className={cn(
												'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-medium',
												showAnswer
													? isCorrectOption
														? 'bg-tiimo-green text-white'
														: isSelected && !isCorrectOption
															? 'bg-destructive text-white'
															: 'bg-muted text-muted-foreground'
													: isSelected
														? 'bg-tiimo-lavender text-white'
														: 'bg-muted text-muted-foreground'
											)}
										>
											{showAnswer ? (
												isCorrectOption ? (
													<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
												) : isSelected ? (
													<HugeiconsIcon icon={CancelIcon} className="w-5 h-5" />
												) : (
													option.id
												)
											) : (
												option.id
											)}
										</div>
										<span
											className={cn(
												'flex-1 font-question text-sm md:text-base',
												showAnswer && !isCorrectOption && isSelected && 'text-muted-foreground'
											)}
										>
											{option.text}
										</span>
									</Button>
								);
							})}
						</div>

						<div className="flex flex-wrap gap-3">
							{!showAnswer && (
								<Button
									onClick={onCheckAnswer}
									disabled={!selectedAnswer}
									className="rounded-full gap-2"
								>
									<HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
									Check answer
								</Button>
							)}
							<Button variant="outline" onClick={onToggleHint} className="rounded-full gap-2">
								<HugeiconsIcon icon={Idea01Icon} className="w-4 h-4" />
								{showHint ? 'Hide hint' : 'Show hint'}
							</Button>
						</div>

						<AnimatePresence>
							{showHint && (
								<m.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									className="overflow-hidden"
								>
									<Card className="p-4 bg-amber-500/10 border-amber-500/30 rounded-xl">
										<p className="text-sm text-amber-700 dark:text-amber-400">{question.hint}</p>
									</Card>
								</m.div>
							)}
						</AnimatePresence>

						<AnimatePresence>
							{showAnswer && selectedAnswer && (
								<m.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={cn(
										'p-4 rounded-xl border-2',
										selectedAnswer === question.correctAnswer
											? 'bg-tiimo-green/10 border-tiimo-green/30'
											: 'bg-destructive/10 border-destructive/30'
									)}
								>
									<p
										className={cn(
											'font-medium',
											selectedAnswer === question.correctAnswer
												? 'text-tiimo-green'
												: 'text-destructive'
										)}
									>
										{selectedAnswer === question.correctAnswer
											? 'Correct! Well done!'
											: `Incorrect. The correct answer is ${question.correctAnswer}.`}
									</p>
								</m.div>
							)}
						</AnimatePresence>

						<div className="pt-4 border-t">
							<AIExplanation
								question={question.question}
								subject={question.subjectLabel}
								correctAnswer={question.options.find((o) => o.id === question.correctAnswer)?.text}
							/>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

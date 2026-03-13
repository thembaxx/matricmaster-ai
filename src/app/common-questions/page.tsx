'use client';

import {
	CancelIcon,
	CheckmarkCircle02Icon,
	CodeCircleIcon,
	EyeIcon,
	Idea01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	COMMON_QUESTIONS,
	type CommonQuestion,
	SUBJECTS,
	type SubjectId,
} from '@/constants/common-questions';
import { cn } from '@/lib/utils';

export default function CommonQuestionsPage() {
	const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
	const [selectedQuestion, setSelectedQuestion] = useState<CommonQuestion | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [showHint, setShowHint] = useState(false);

	const filteredQuestions =
		selectedSubject === 'all'
			? COMMON_QUESTIONS
			: COMMON_QUESTIONS.filter((q) => q.subject === selectedSubject);

	const handleQuestionClick = (question: CommonQuestion) => {
		setSelectedQuestion(question);
		setSelectedAnswer(null);
		setShowAnswer(false);
		setShowHint(false);
		setDialogOpen(true);
	};

	const handleSelectAnswer = (answerId: string) => {
		if (!showAnswer) {
			setSelectedAnswer(answerId);
		}
	};

	const handleCheckAnswer = () => {
		setShowAnswer(true);
	};

	return (
		<div className="min-h-screen bg-background pb-40">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold mb-2">Common exam questions</h1>
					<p className="text-sm text-muted-foreground mb-6">
						Practice frequently asked questions from past NSC papers
					</p>

					{/* Subject Filter */}
					<div className="flex flex-wrap gap-2">
						<Button
							variant={selectedSubject === 'all' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedSubject('all')}
							className="rounded-full"
						>
							All subjects
						</Button>
						{SUBJECTS.map((subject) => (
							<Button
								key={subject.id}
								variant={selectedSubject === subject.id ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSelectedSubject(subject.id)}
								className="rounded-full gap-2"
							>
								<HugeiconsIcon icon={subject.icon} className="w-4 h-4" />
								{subject.label}
							</Button>
						))}
					</div>
				</div>
			</header>

			{/* Questions List */}
			<main className="px-6 py-6 max-w-4xl mx-auto">
				<p className="text-sm text-muted-foreground mb-4">{filteredQuestions.length} questions</p>

				<div className="space-y-4">
					{filteredQuestions.map((question, index) => (
						<m.div
							key={question.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.03 }}
						>
							<Card
								className="p-5 cursor-pointer hover:shadow-lg transition-all rounded-2xl border bg-card shadow-sm"
								onClick={() => handleQuestionClick(question)}
							>
								<div className="flex items-start gap-4">
									<div
										className={cn(
											'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
											question.bgColor
										)}
									>
										<HugeiconsIcon icon={question.icon} className="w-6 h-6 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className={cn('text-xs font-medium', question.color)}>
												{question.subjectLabel}
											</span>
											<span className="text-xs text-muted-foreground">•</span>
											<span className="text-xs text-muted-foreground">{question.topic}</span>
										</div>
										<p className="text-sm font-medium line-clamp-2 mb-2">{question.question}</p>
										<div className="flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<span className="font-medium">Grade</span> {question.grades.join(', ')}
											</span>
											<span className="flex items-center gap-1">
												<span className="font-medium">Years:</span> {question.years.join(', ')}
											</span>
										</div>
									</div>
								</div>
							</Card>
						</m.div>
					))}
				</div>
			</main>

			{/* Dialog */}
			<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
					<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-background rounded-3xl p-6 shadow-2xl z-50 animate-in zoom-in-95 fade-in">
						{selectedQuestion && (
							<div className="space-y-6">
								{/* Question Header */}
								<div className="flex items-start gap-3">
									<div
										className={cn(
											'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
											selectedQuestion.bgColor
										)}
									>
										<HugeiconsIcon icon={selectedQuestion.icon} className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2 mb-1">
											<span className={cn('text-xs font-medium', selectedQuestion.color)}>
												{selectedQuestion.subjectLabel}
											</span>
											<span className="text-xs text-muted-foreground">•</span>
											<span className="text-xs text-muted-foreground">
												{selectedQuestion.topic}
											</span>
										</div>
										<p className="text-sm font-medium text-muted-foreground">
											Grade {selectedQuestion.grades.join(', ')} • {selectedQuestion.difficulty}
										</p>
									</div>
									<Dialog.Close asChild>
										<Button variant="ghost" size="icon" className="rounded-full shrink-0">
											<HugeiconsIcon icon={CodeCircleIcon} className="w-5 h-5" />
										</Button>
									</Dialog.Close>
								</div>

								{/* Question */}
								<div className="p-5 bg-muted/30 rounded-2xl">
									<p className="text-lg font-medium leading-relaxed">{selectedQuestion.question}</p>
								</div>

								{/* Options */}
								<div className="space-y-3">
									{selectedQuestion.options.map((option) => {
										const isSelected = selectedAnswer === option.id;
										const isCorrectOption = option.id === selectedQuestion.correctAnswer;

										return (
											<button
												key={option.id}
												type="button"
												disabled={showAnswer}
												onClick={() => handleSelectAnswer(option.id)}
												className={cn(
													'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
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
														'flex-1 font-medium',
														showAnswer && !isCorrectOption && isSelected && 'text-muted-foreground'
													)}
												>
													{option.text}
												</span>
											</button>
										);
									})}
								</div>

								{/* Actions */}
								<div className="flex flex-wrap gap-3">
									{!showAnswer && (
										<Button
											onClick={handleCheckAnswer}
											disabled={!selectedAnswer}
											className="rounded-full gap-2"
										>
											<HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
											Check answer
										</Button>
									)}
									<Button
										variant="outline"
										onClick={() => setShowHint(!showHint)}
										className="rounded-full gap-2"
									>
										<HugeiconsIcon icon={Idea01Icon} className="w-4 h-4" />
										{showHint ? 'Hide hint' : 'Show hint'}
									</Button>
								</div>

								{/* Hint */}
								<AnimatePresence>
									{showHint && (
										<m.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className="overflow-hidden"
										>
											<Card className="p-4 bg-amber-500/10 border-amber-500/30 rounded-xl">
												<p className="text-sm text-amber-700 dark:text-amber-400">
													{selectedQuestion.hint}
												</p>
											</Card>
										</m.div>
									)}
								</AnimatePresence>

								{/* Result */}
								<AnimatePresence>
									{showAnswer && selectedAnswer && (
										<m.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className={cn(
												'p-4 rounded-xl border-2',
												selectedAnswer === selectedQuestion.correctAnswer
													? 'bg-tiimo-green/10 border-tiimo-green/30'
													: 'bg-destructive/10 border-destructive/30'
											)}
										>
											<p
												className={cn(
													'font-medium',
													selectedAnswer === selectedQuestion.correctAnswer
														? 'text-tiimo-green'
														: 'text-destructive'
												)}
											>
												{selectedAnswer === selectedQuestion.correctAnswer
													? 'Correct! Well done!'
													: `Incorrect. The correct answer is ${selectedQuestion.correctAnswer}.`}
											</p>
										</m.div>
									)}
								</AnimatePresence>

								{/* AI Explanation */}
								<div className="pt-4 border-t">
									<AIExplanation
										question={selectedQuestion.question}
										correctAnswer={
											selectedQuestion.options.find((o) => o.id === selectedQuestion.correctAnswer)
												?.text
										}
									/>
								</div>
							</div>
						)}
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}

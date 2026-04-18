'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { QuizQuestion } from '@/content/questions/quiz/types';
import { DURATION, EASING } from '@/lib/animation-presets';
import { useKnowledgeDecayStore } from '@/stores/useKnowledgeDecayStore';

interface RefresherQuizProps {
	topic: string;
	questions: QuizQuestion[];
	onComplete: () => void;
}

export function RefresherQuiz({ topic, questions, onComplete }: RefresherQuizProps) {
	const [currentIdx, setCurrentIdx] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [score, setScore] = useState(0);
	const markReviewed = useKnowledgeDecayStore((s) => s.markReviewed);

	const quizQuestions = questions.slice(0, 3);
	const currentQuestion = quizQuestions[currentIdx];

	if (!currentQuestion) {
		markReviewed(topic, score / quizQuestions.length);
		return (
			<Card className="mx-auto max-w-md">
				<CardContent className="flex flex-col items-center gap-3 py-6">
					<p className="text-sm font-medium">refresher complete</p>
					<p className="font-mono text-xs text-muted-foreground">
						{score}/{quizQuestions.length}
					</p>
					<Button size="sm" onClick={onComplete}>
						done
					</Button>
				</CardContent>
			</Card>
		);
	}

	const handleAnswer = (answerId: string) => {
		if (showFeedback) return;
		setSelectedAnswer(answerId);
		const correct = answerId === currentQuestion.correctAnswer;
		if (correct) setScore((prev) => prev + 1);
		setShowFeedback(true);
	};

	const handleNext = () => {
		if (currentIdx >= quizQuestions.length - 1) {
			const finalScore = score + (selectedAnswer === currentQuestion.correctAnswer ? 0 : 0);
			markReviewed(topic, finalScore / quizQuestions.length);
			onComplete();
			return;
		}
		setCurrentIdx((prev) => prev + 1);
		setSelectedAnswer(null);
		setShowFeedback(false);
	};

	return (
		<Card className="mx-auto max-w-md">
			<CardContent className="space-y-4 pt-5">
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">refresher: {topic.toLowerCase()}</span>
					<span className="font-mono text-xs text-muted-foreground">
						{currentIdx + 1}/{quizQuestions.length}
					</span>
				</div>

				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={currentIdx}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
					>
						<p className="text-sm font-medium leading-relaxed">{currentQuestion.question}</p>

						<div className="mt-3 space-y-2">
							{currentQuestion.options.map((option) => {
								const isSelected = selectedAnswer === option.id;
								const isCorrectOption = option.id === currentQuestion.correctAnswer;

								let className =
									'w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-colors border-border bg-background';
								if (showFeedback && isCorrectOption) {
									className =
										'w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-colors border-primary bg-primary text-primary-foreground';
								} else if (showFeedback && isSelected && !isCorrectOption) {
									className =
										'w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-colors border-red-500 bg-red-500/10 text-red-600';
								}

								return (
									<button
										key={option.id}
										type="button"
										disabled={showFeedback}
										onClick={() => handleAnswer(option.id)}
										className={className}
									>
										<span className="font-mono mr-2 text-muted-foreground">{option.id}.</span>
										{option.text}
									</button>
								);
							})}
						</div>

						{showFeedback && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="mt-3 space-y-2"
							>
								<p className="text-xs text-muted-foreground">{currentQuestion.hint}</p>
								<Button size="sm" onClick={handleNext}>
									{currentIdx >= quizQuestions.length - 1 ? 'finish' : 'next'}
								</Button>
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { QuizQuestion } from '@/content/questions/quiz/types';
import { BossFightHUD } from './BossFightHUD';
import { MasteryBadge } from './MasteryBadge';

interface BossFightExamProps {
	subject: string;
	onComplete: (score: number) => void;
}

const BOSS_NAMES: Record<string, string> = {
	Mathematics: 'the calculus colossus',
	'Physical Sciences': 'the physics phantom',
	Chemistry: 'the chemical chimera',
	'Life Sciences': 'the biology behemoth',
	Geography: 'the terrain titan',
	Accounting: 'the ledger leviathan',
};

const QUESTIONS_PER_STAGE = 4;
const MAX_LIVES = 3;
const SECONDS_PER_QUESTION = 20;

const generateMockQuestions = (subject: string): QuizQuestion[] => {
	const mockQuestions: QuizQuestion[] = [
		{
			id: '1',
			type: 'mcq',
			question: `Sample question 1 for ${subject}`,
			options: [
				{ id: 'a', text: 'Option A' },
				{ id: 'b', text: 'Option B' },
				{ id: 'c', text: 'Option C' },
				{ id: 'd', text: 'Option D' },
			],
			correctAnswer: 'a',
			hint: 'Think carefully',
			topic: subject.toLowerCase(),
			subtopic: 'general',
			difficulty: 'medium',
		},
		{
			id: '2',
			type: 'mcq',
			question: `Sample question 2 for ${subject}`,
			options: [
				{ id: 'a', text: 'Option A' },
				{ id: 'b', text: 'Option B' },
				{ id: 'c', text: 'Option C' },
				{ id: 'd', text: 'Option D' },
			],
			correctAnswer: 'b',
			hint: 'Consider the basics',
			topic: subject.toLowerCase(),
			subtopic: 'general',
			difficulty: 'medium',
		},
		{
			id: '3',
			type: 'mcq',
			question: `Sample question 3 for ${subject}`,
			options: [
				{ id: 'a', text: 'Option A' },
				{ id: 'b', text: 'Option B' },
				{ id: 'c', text: 'Option C' },
				{ id: 'd', text: 'Option D' },
			],
			correctAnswer: 'c',
			hint: 'Look for patterns',
			topic: subject.toLowerCase(),
			subtopic: 'general',
			difficulty: 'medium',
		},
	];
	return mockQuestions;
};

export function BossFightExam({ subject, onComplete }: BossFightExamProps) {
	const questions = generateMockQuestions(subject);
	const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
	const [lives, setLives] = useState(MAX_LIVES);
	const [bossHp, setBossHp] = useState(questions.length);
	const [score, setScore] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [isDefeated, setIsDefeated] = useState(false);
	const [timer, setTimer] = useState(SECONDS_PER_QUESTION);

	const totalStages = Math.ceil(questions.length / QUESTIONS_PER_STAGE);
	const currentStage = Math.floor(currentQuestionIdx / QUESTIONS_PER_STAGE) + 1;
	const bossName = BOSS_NAMES[subject] || 'the exam dragon';

	const currentQuestion = questions[currentQuestionIdx];

	const handleTimeUp = useCallback(() => {
		if (showFeedback || isDefeated) return;
		setLives((prev) => {
			const newLives = prev - 1;
			if (newLives <= 0) setIsDefeated(true);
			return newLives;
		});
		setShowFeedback(true);
		setIsCorrect(false);
	}, [showFeedback, isDefeated]);

	useEffect(() => {
		if (showFeedback || isDefeated || !currentQuestion) return;

		const interval = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [showFeedback, isDefeated, handleTimeUp, currentQuestion]);

	const handleAnswer = (answerId: string) => {
		if (showFeedback || isDefeated) return;

		setSelectedAnswer(answerId);
		const correct = answerId === currentQuestion.correctAnswer;
		setIsCorrect(correct);
		setShowFeedback(true);

		if (correct) {
			setScore((prev) => prev + 1);
			setBossHp((prev) => Math.max(0, prev - 1));
		} else {
			setLives((prev) => {
				const newLives = prev - 1;
				if (newLives <= 0) {
					setTimeout(() => setIsDefeated(true), 800);
				}
				return newLives;
			});
		}
	};

	const handleNext = () => {
		if (isDefeated) {
			onComplete(score);
			return;
		}

		if (currentQuestionIdx >= questions.length - 1 || bossHp <= 0) {
			onComplete(score);
			return;
		}

		setCurrentQuestionIdx((prev) => prev + 1);
		setSelectedAnswer(null);
		setShowFeedback(false);
		setTimer(SECONDS_PER_QUESTION);
	};

	if (bossHp <= 0 && !isDefeated) {
		return (
			<Card className="mx-auto max-w-lg">
				<CardContent className="py-8">
					<MasteryBadge
						subject={subject}
						score={score}
						totalQuestions={questions.length}
						onShare={() => {}}
						onClose={() => onComplete(score)}
					/>
				</CardContent>
			</Card>
		);
	}

	if (isDefeated) {
		return (
			<Card className="mx-auto max-w-lg">
				<CardContent className="flex flex-col items-center gap-4 py-8">
					<motion.div
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="text-4xl"
					>
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="text-red-500"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z" />
						</svg>
					</motion.div>
					<h3 className="font-heading text-lg font-bold">boss defeated you</h3>
					<p className="text-xs text-muted-foreground">
						you scored {score}/{questions.length} - study up and try again
					</p>
					<div className="flex gap-3">
						<Button size="sm" onClick={() => onComplete(score)}>
							see results
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!currentQuestion) return null;

	return (
		<div className="mx-auto max-w-lg space-y-4">
			<BossFightHUD
				bossHp={bossHp}
				bossMaxHp={questions.length}
				lives={lives}
				stage={currentStage}
				totalStages={totalStages}
				timer={timer}
				bossName={bossName}
			/>

			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={currentQuestionIdx}
					initial={{ x: 50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -50, opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<Card>
						<CardContent className="space-y-4 pt-5">
							<div className="text-xs text-muted-foreground">
								question {currentQuestionIdx + 1} of {questions.length}
							</div>

							<p className="text-sm font-medium leading-relaxed">{currentQuestion.question}</p>

							<div className="space-y-2">
								{currentQuestion.options.map((option) => {
									let variant: 'outline' | 'default' | 'destructive' = 'outline';
									if (showFeedback && selectedAnswer === option.id) {
										variant = isCorrect ? 'default' : 'destructive';
									}
									if (showFeedback && option.id === currentQuestion.correctAnswer && !isCorrect) {
										variant = 'default';
									}

									return (
										<motion.button
											key={option.id}
											type="button"
											disabled={showFeedback}
											onClick={() => handleAnswer(option.id)}
											className={`w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-colors ${
												variant === 'default'
													? 'border-primary bg-primary text-primary-foreground'
													: variant === 'destructive'
														? 'border-red-500 bg-red-500/10 text-red-600'
														: 'border-border bg-background hover:bg-muted'
											} ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
											whileTap={!showFeedback ? { scale: 0.98 } : undefined}
										>
											<span className="font-mono mr-2 text-muted-foreground">{option.id}.</span>
											{option.text}
										</motion.button>
									);
								})}
							</div>

							<AnimatePresence>
								{showFeedback && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										className="overflow-hidden"
									>
										<div
											className={`rounded-xl p-3 text-xs ${
												isCorrect
													? 'bg-green-500/10 text-green-700 dark:text-green-400'
													: 'bg-red-500/10 text-red-700 dark:text-red-400'
											}`}
										>
											<p className="font-medium">
												{isCorrect ? 'correct attack!' : 'the boss strikes back!'}
											</p>
											{!isCorrect && (
												<p className="mt-1 text-muted-foreground">{currentQuestion.hint}</p>
											)}
										</div>
										<div className="mt-3 flex justify-end">
											<Button size="sm" onClick={handleNext}>
												{currentQuestionIdx >= questions.length - 1 || bossHp <= 1
													? 'finish fight'
													: 'next question'}
											</Button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</CardContent>
					</Card>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

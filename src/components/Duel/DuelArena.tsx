'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDuelStore } from '@/stores/useDuelStore';

export function DuelArena() {
	const router = useRouter();
	const { activeDuel, submitAnswer, endDuel } = useDuelStore();
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [timeLeft, setTimeLeft] = useState(15);

	const handleNextQuestion = useCallback(() => {
		if (!activeDuel) return;
		if (currentQuestion < activeDuel.questions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
			setTimeLeft(15);
		} else {
			endDuel();
			router.push('/duel/results');
		}
	}, [activeDuel, currentQuestion, endDuel, router]);

	const handleTimeout = useCallback(() => {
		if (!activeDuel) return;
		const question = activeDuel.questions[currentQuestion];
		submitAnswer(question.id, 'wrong');
		handleNextQuestion();
	}, [activeDuel, currentQuestion, submitAnswer, handleNextQuestion]);

	useEffect(() => {
		if (!activeDuel) {
			router.push('/duel');
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					handleTimeout();
					return 15;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [activeDuel, handleTimeout, router.push]);

	if (!activeDuel) return null;

	const handleAnswer = (answer: string) => {
		const question = activeDuel.questions[currentQuestion];
		submitAnswer(question.id, answer);
		handleNextQuestion();
	};

	const question = activeDuel.questions[currentQuestion];

	return (
		<div className="min-h-screen bg-background p-4 sm:p-6">
			<div className="max-w-2xl mx-auto">
				{/* Scores */}
				<div className="flex justify-between items-center mb-6">
					<div className="text-center">
						<p className="text-sm text-muted-foreground">you</p>
						<p className="text-2xl font-bold">{activeDuel.playerScore}</p>
					</div>
					<div className="text-center">
						<p className="text-sm text-muted-foreground">vs</p>
						<p className="text-lg font-medium">{activeDuel.opponentName}</p>
					</div>
					<div className="text-center">
						<p className="text-sm text-muted-foreground">opponent</p>
						<p className="text-2xl font-bold">{activeDuel.opponentScore}</p>
					</div>
				</div>

				{/* Timer */}
				<div className="text-center mb-6">
					<div
						className={`text-3xl font-mono ${timeLeft <= 5 ? 'text-red-500' : 'text-foreground'}`}
					>
						{timeLeft}s
					</div>
				</div>

				{/* Question */}
				<m.div
					key={currentQuestion}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					className="bg-card rounded-2xl border border-border/30 p-6 shadow-lg mb-6"
				>
					<h3 className="text-lg font-semibold mb-4">{question.question}</h3>
					<div className="grid grid-cols-2 gap-3">
						{['a', 'b', 'c', 'd'].map((option) => (
							<Button
								key={option}
								variant="outline"
								onClick={() => handleAnswer(option)}
								className="h-12"
							>
								{option.toUpperCase()}
							</Button>
						))}
					</div>
				</m.div>

				{/* Progress */}
				<div className="text-center text-sm text-muted-foreground">
					question {currentQuestion + 1} of {activeDuel.questions.length}
				</div>
			</div>
		</div>
	);
}

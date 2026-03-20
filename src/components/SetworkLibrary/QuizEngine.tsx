'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { QuizQuestion } from '@/data/setworks/types';

interface QuizEngineProps {
	questions: QuizQuestion[];
}

export function QuizEngine({ questions }: QuizEngineProps) {
	const [current, setCurrent] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [showResult, setShowResult] = useState(false);

	const question = questions[current];
	const isCorrect = selected === question.correctAnswer;

	const handleSelect = (index: number) => {
		if (showResult) return;
		setSelected(index);
	};

	const handleCheck = () => {
		setShowResult(true);
	};

	const handleNext = () => {
		setSelected(null);
		setShowResult(false);
		setCurrent((c) => (c + 1) % questions.length);
	};

	if (questions.length === 0) {
		return <p className="text-muted-foreground">No quiz questions available.</p>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between text-sm text-muted-foreground">
				<span>
					Question {current + 1} of {questions.length}
				</span>
				<span className="capitalize">{question.difficulty}</span>
			</div>

			<Card className="p-6">
				<h3 className="font-bold text-lg mb-4">{question.question}</h3>

				<div className="space-y-2">
					{question.options.map((option, i) => (
						<Button
							key={`option-${i}`}
							type="button"
							variant="ghost"
							onClick={() => handleSelect(i)}
							disabled={showResult}
							className={`w-full p-3 h-auto text-left rounded-lg border transition-colors ${
								selected === i
									? 'border-primary bg-primary/10'
									: 'border-border hover:border-primary/50'
							} ${
								showResult && i === question.correctAnswer
									? 'border-green-500 bg-green-50 dark:bg-green-900/20'
									: ''
							} ${
								showResult && selected === i && !isCorrect
									? 'border-red-500 bg-red-50 dark:bg-red-900/20'
									: ''
							}
							`}
						>
							{option}
						</Button>
					))}
				</div>

				{showResult && (
					<div
						className={`mt-4 p-3 rounded-lg ${
							isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
						}`}
					>
						<p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
						<p className="text-sm">{question.explanation}</p>
					</div>
				)}
			</Card>

			<div className="flex gap-2">
				{!showResult ? (
					<Button onClick={handleCheck} disabled={selected === null}>
						Check Answer
					</Button>
				) : (
					<Button onClick={handleNext}>Next Question</Button>
				)}
			</div>
		</div>
	);
}

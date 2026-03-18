'use client';

import { useCallback, useState } from 'react';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { getStrugglingConcepts, recordStruggle, updateConfidence } from '@/services/buddyActions';

interface QuizQuestion {
	id: string;
	topic: string;
	options: Array<{ id: string; text: string }>;
	correctAnswer: string;
}

interface UseQuizCheckOptions {
	quiz: {
		title: string;
		questions: QuizQuestion[];
	};
	currentQuestion: QuizQuestion;
	currentSubject: string;
	elapsedSeconds: number;
	onNavigate: () => void;
	onComplete: () => void;
}

export function useQuizCheck({
	quiz,
	currentQuestion,
	currentSubject,
	elapsedSeconds,
	onNavigate,
	onComplete,
}: UseQuizCheckOptions) {
	const [isChecked, setIsChecked] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [score, setScore] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [showStruggleAlert, setShowStruggleAlert] = useState(false);
	const [currentStruggleCount, setCurrentStruggleCount] = useState(0);

	const { completeQuiz, isCompleting } = useQuizCompletion();

	const handleCheck = useCallback(
		async (selectedOption: string | null, mode: 'test' | 'practice') => {
			if (isChecked) {
				if (/* currentQuestionIndex */ 0 < quiz.questions.length - 1) {
					setIsChecked(false);
					setIsCorrect(null);
					onNavigate();
				} else {
					const finalScore = score + (isCorrect ? 1 : 0);
					await completeQuiz({
						subjectId: 1,
						topic: quiz.title,
						totalQuestions: quiz.questions.length,
						correctAnswers: finalScore,
						marksEarned: finalScore * 10,
						durationMinutes: Math.ceil(elapsedSeconds / 60),
						difficulty: 'medium',
						sessionType: mode,
					});
					onComplete();
				}
				return;
			}

			const options = currentQuestion.options.map((o) => ({
				id: o.id,
				label: o.text,
				isCorrect: o.id === currentQuestion.correctAnswer,
			}));

			const correct = options.find((o) => o.id === selectedOption)?.isCorrect || false;
			setIsCorrect(correct);
			if (correct) {
				setScore((prev) => prev + 1);
				setCorrectCount((prev) => prev + 1);
			} else {
				setIncorrectCount((prev) => prev + 1);
			}
			setIsChecked(true);

			if (currentQuestion?.topic) {
				try {
					await updateConfidence(currentQuestion.topic, currentSubject, correct);
					await recordQuestionAttempt(currentQuestion.id, currentQuestion.topic, correct);
					setDifficulty(await getAdaptiveDifficultyServer());
					if (!correct) {
						await recordStruggle(currentQuestion.topic);
						const struggles = await getStrugglingConcepts();
						const thisStruggle = struggles.find((s) => s.concept === currentQuestion.topic);
						if (thisStruggle && thisStruggle.struggleCount >= 2) {
							setCurrentStruggleCount(thisStruggle.struggleCount);
							setShowStruggleAlert(true);
						}
					}
				} catch (error) {
					console.debug('Failed to track progress:', error);
				}
			}
		},
		[
			isChecked,
			quiz,
			isCorrect,
			score,
			elapsedSeconds,
			currentQuestion,
			currentSubject,
			completeQuiz,
			onNavigate,
			onComplete,
		]
	);

	const resetQuestion = useCallback(() => {
		setIsChecked(false);
		setIsCorrect(null);
	}, []);

	return {
		isChecked,
		isCorrect,
		score,
		correctCount,
		incorrectCount,
		difficulty,
		showStruggleAlert,
		currentStruggleCount,
		isCompleting,
		handleCheck,
		resetQuestion,
		setShowStruggleAlert,
	};
}

import { useCallback, useRef, useState } from 'react';

export interface QuizOption {
	id: string;
	text: string;
}

export interface QuizQuestion {
	id: string;
	question: string;
	questionImage?: string;
	options: QuizOption[];
	correctAnswer: string;
	hint: string;
	diagram?: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizState {
	quizId: string;
	title: string;
	subject: string;
	questions: QuizQuestion[];
}

export interface SelectedAnswer {
	questionId: string;
	selectedOption: string | null;
	isCorrect: boolean | null;
}

export interface QuizStateReturn {
	currentQuestionIndex: number;
	currentQuestion: QuizQuestion | null;
	selectedAnswer: string | null;
	isChecked: boolean;
	isCorrect: boolean | null;
	elapsedSeconds: number;
	elapsedFormatted: string;
	score: number;
	correctCount: number;
	incorrectCount: number;
	unansweredCount: number;
	progress: number;
	isFirstQuestion: boolean;
	isLastQuestion: boolean;
	mode: 'test' | 'practice';
	answers: Map<string, SelectedAnswer>;
	formatTime: (seconds: number) => string;
	nextQuestion: () => void;
	prevQuestion: () => void;
	goToQuestion: (index: number) => void;
	selectAnswer: (optionId: string) => void;
	checkAnswer: () => boolean;
	resetQuestion: () => void;
	setMode: (mode: 'test' | 'practice') => void;
	getQuestionStatus: (index: number) => 'correct' | 'incorrect' | 'unanswered' | 'current';
	isQuestionAnswered: (questionId: string) => boolean;
}

export interface UseQuizStateOptions {
	quiz: QuizState;
	startImmediately?: boolean;
}

export function useQuizState({
	quiz,
	startImmediately = true,
}: UseQuizStateOptions): QuizStateReturn {
	const startTimeRef = useRef<number | null>(startImmediately ? Date.now() : null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [score, setScore] = useState(0);
	const [mode, setMode] = useState<'test' | 'practice'>('test');
	const [answers, setAnswers] = useState<Map<string, SelectedAnswer>>(new Map());

	const currentQuestion = quiz.questions[currentQuestionIndex] ?? null;

	const existingAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;
	const currentSelectedAnswer = existingAnswer?.selectedOption ?? null;
	const currentIsChecked = existingAnswer?.selectedOption !== null;
	const currentIsCorrect = existingAnswer?.isCorrect ?? null;

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const initializedRef = useRef(false);

	if (typeof window !== 'undefined' && startImmediately && !initializedRef.current) {
		initializedRef.current = true;
		if (!startTimeRef.current) {
			startTimeRef.current = Date.now();
		}
		timerRef.current = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000));
		}, 1000);
	}

	const formatTime = useCallback((seconds: number): string => {
		return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
	}, []);

	const correctCount = Array.from(answers.values()).filter((a) => a.isCorrect === true).length;
	const incorrectCount = Array.from(answers.values()).filter((a) => a.isCorrect === false).length;
	const unansweredCount = quiz.questions.length - answers.size;
	const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

	const nextQuestion = useCallback(() => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	}, [currentQuestionIndex, quiz.questions.length]);

	const prevQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	}, [currentQuestionIndex]);

	const goToQuestion = useCallback(
		(index: number) => {
			if (index >= 0 && index < quiz.questions.length) {
				setCurrentQuestionIndex(index);
			}
		},
		[quiz.questions.length]
	);

	const selectAnswer = useCallback(
		(optionId: string) => {
			if (!currentQuestion) return;
			setAnswers((prev) => {
				const updated = new Map(prev);
				updated.set(currentQuestion.id, {
					questionId: currentQuestion.id,
					selectedOption: optionId,
					isCorrect: null,
				});
				return updated;
			});
		},
		[currentQuestion]
	);

	const checkAnswer = useCallback((): boolean => {
		if (!currentQuestion || currentSelectedAnswer === null) return false;

		const correct = currentSelectedAnswer === currentQuestion.correctAnswer;

		setAnswers((prev) => {
			const updated = new Map(prev);
			updated.set(currentQuestion.id, {
				questionId: currentQuestion.id,
				selectedOption: currentSelectedAnswer,
				isCorrect: correct,
			});
			return updated;
		});

		if (correct) {
			setScore((prev) => prev + 1);
		}

		return correct;
	}, [currentQuestion, currentSelectedAnswer]);

	const resetQuestion = useCallback(() => {
		if (!currentQuestion) return;
		setAnswers((prev) => {
			const updated = new Map(prev);
			updated.delete(currentQuestion.id);
			return updated;
		});
	}, [currentQuestion]);

	const getQuestionStatus = useCallback(
		(index: number): 'correct' | 'incorrect' | 'unanswered' | 'current' => {
			if (index === currentQuestionIndex) return 'current';
			const question = quiz.questions[index];
			const answer = answers.get(question.id);
			if (!answer || answer.selectedOption === null) return 'unanswered';
			return answer.isCorrect ? 'correct' : 'incorrect';
		},
		[currentQuestionIndex, answers, quiz.questions]
	);

	const isQuestionAnswered = useCallback(
		(questionId: string): boolean => {
			const answer = answers.get(questionId);
			return answer?.selectedOption !== null;
		},
		[answers]
	);

	return {
		currentQuestionIndex,
		currentQuestion,
		selectedAnswer: currentSelectedAnswer,
		isChecked: currentIsChecked,
		isCorrect: currentIsCorrect,
		elapsedSeconds,
		elapsedFormatted: formatTime(elapsedSeconds),
		score,
		correctCount,
		incorrectCount,
		unansweredCount,
		progress,
		isFirstQuestion: currentQuestionIndex === 0,
		isLastQuestion: currentQuestionIndex === quiz.questions.length - 1,
		mode,
		answers,
		formatTime,
		nextQuestion,
		prevQuestion,
		goToQuestion,
		selectAnswer,
		checkAnswer,
		resetQuestion,
		setMode,
		getQuestionStatus,
		isQuestionAnswered,
	};
}

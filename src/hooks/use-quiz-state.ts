import { useCallback, useEffect, useRef, useState } from 'react';

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
	const startTimeRef = useRef<number | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [score, setScore] = useState(0);
	const [mode, setMode] = useState<'test' | 'practice'>('test');
	const [answers, setAnswers] = useState<Map<string, SelectedAnswer>>(new Map());

	const currentQuestion = quiz.questions[currentQuestionIndex] ?? null;

	useEffect(() => {
		if (startImmediately && !startTimeRef.current) {
			startTimeRef.current = Date.now();
		}
	}, [startImmediately]);

	useEffect(() => {
		if (!startTimeRef.current) return;

		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const formatTime = useCallback((seconds: number): string => {
		return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
	}, []);

	const correctCount = Array.from(answers.values()).filter((a) => a.isCorrect === true).length;
	const incorrectCount = Array.from(answers.values()).filter((a) => a.isCorrect === false).length;
	const unansweredCount = quiz.questions.length - answers.size;
	const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

	const resetQuestionState = useCallback(() => {
		const existingAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;
		if (existingAnswer) {
			setSelectedAnswer(existingAnswer.selectedOption);
			setIsChecked(existingAnswer.selectedOption !== null);
			setIsCorrect(existingAnswer.isCorrect);
		} else {
			setSelectedAnswer(null);
			setIsChecked(false);
			setIsCorrect(null);
		}
	}, [currentQuestion, answers]);

	const nextQuestion = useCallback(() => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			resetQuestionState();
		}
	}, [currentQuestionIndex, quiz.questions.length, resetQuestionState]);

	const prevQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			resetQuestionState();
		}
	}, [currentQuestionIndex, resetQuestionState]);

	const goToQuestion = useCallback(
		(index: number) => {
			if (index >= 0 && index < quiz.questions.length) {
				setCurrentQuestionIndex(index);
				resetQuestionState();
			}
		},
		[quiz.questions.length, resetQuestionState]
	);

	const selectAnswer = useCallback((optionId: string) => {
		setSelectedAnswer(optionId);
	}, []);

	const checkAnswer = useCallback((): boolean => {
		if (!currentQuestion || selectedAnswer === null) return false;

		const correct = selectedAnswer === currentQuestion.correctAnswer;

		setIsCorrect(correct);
		setIsChecked(true);

		if (correct) {
			setScore((prev) => prev + 1);
		}

		setAnswers((prev) => {
			const updated = new Map(prev);
			updated.set(currentQuestion.id, {
				questionId: currentQuestion.id,
				selectedOption: selectedAnswer,
				isCorrect: correct,
			});
			return updated;
		});

		return correct;
	}, [currentQuestion, selectedAnswer]);

	const resetQuestion = useCallback(() => {
		setSelectedAnswer(null);
		setIsChecked(false);
		setIsCorrect(null);
	}, []);

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

	useEffect(() => {
		resetQuestionState();
	}, [resetQuestionState]);

	return {
		currentQuestionIndex,
		currentQuestion,
		selectedAnswer,
		isChecked,
		isCorrect,
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

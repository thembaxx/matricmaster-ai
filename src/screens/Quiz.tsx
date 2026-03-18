'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { QuizContent } from '@/components/Quiz/QuizContent';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { isQuotaError } from '@/lib/ai/quota-error';
import {
	getAdaptiveHint,
	getStrugglingConcepts,
	recordStruggle,
	updateConfidence,
} from '@/services/buddyActions';

interface QuizProps {
	quizId?: string;
}

export default function Quiz({ quizId: initialQuizId }: QuizProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const urlQuizId = searchParams.get('id');
	const quizId = initialQuizId || urlQuizId || 'math-p1-2023-nov';

	const startTimeRef = useRef<number>(Date.now());
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const [score, setScore] = useState(0);
	const [mode, setMode] = useState<'test' | 'practice'>('test');
	const [showSubjectSelector, setShowSubjectSelector] = useState(false);
	const [currentSubject, setCurrentSubject] = useState('');
	const [adaptiveHint, setAdaptiveHint] = useState<string | null>(null);
	const [showStruggleAlert, setShowStruggleAlert] = useState(false);
	const [currentStruggleCount, setCurrentStruggleCount] = useState(0);
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);

	const { completeQuiz, isCompleting } = useQuizCompletion();
	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[currentQuestionIndex];

	useEffect(() => {
		if (quiz?.subject && !currentSubject) setCurrentSubject(quiz.subject);
	}, [quiz, currentSubject]);

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		async function loadHint() {
			if (!currentQuestion?.topic) return;
			try {
				const hint = await getAdaptiveHint(currentQuestion.topic);
				setAdaptiveHint(hint);
			} catch (error) {
				if (isQuotaError(error)) triggerQuotaError();
			}
		}
		loadHint();
	}, [currentQuestion?.topic, triggerQuotaError]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		setShowStruggleAlert(false);
	}, []);

	const options = currentQuestion.options.map((o) => ({
		id: o.id,
		label: o.text,
		isCorrect: o.id === currentQuestion.correctAnswer,
	}));

	const handleCheck = useCallback(async () => {
		if (isChecked) {
			if (currentQuestionIndex < quiz.questions.length - 1) {
				setCurrentQuestionIndex((prev) => prev + 1);
				setSelectedOption(null);
				setIsChecked(false);
				setIsCorrect(null);
				setShowHint(false);
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
				router.push('/lesson-complete');
			}
			return;
		}

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
	}, [
		isChecked,
		currentQuestionIndex,
		quiz,
		selectedOption,
		isCorrect,
		score,
		elapsedSeconds,
		mode,
		options,
		currentQuestion,
		currentSubject,
		completeQuiz,
		router,
	]);

	const handleSubjectChange = (subject: string) => {
		setCurrentSubject(subject);
		const firstQuiz = Object.entries(QUIZ_DATA).find(([, q]) => q.subject === subject);
		if (firstQuiz) router.push(`/quiz?id=${firstQuiz[0]}`);
		setShowSubjectSelector(false);
	};

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<QuizContent
						quiz={quiz}
						currentQuestionIndex={currentQuestionIndex}
						selectedOption={selectedOption}
						isChecked={isChecked}
						isCorrect={isCorrect}
						elapsedSeconds={elapsedSeconds}
						showHint={showHint}
						score={score}
						mode={mode}
						currentSubject={currentSubject}
						showSubjectSelector={showSubjectSelector}
						adaptiveHint={adaptiveHint}
						showStruggleAlert={showStruggleAlert}
						currentStruggleCount={currentStruggleCount}
						difficulty={difficulty}
						correctCount={correctCount}
						incorrectCount={incorrectCount}
						isCompleting={isCompleting}
						onSelectOption={setSelectedOption}
						onToggleHint={() => setShowHint(!showHint)}
						onCheck={handleCheck}
						onModeChange={setMode}
						onShowSubjectSelector={() => setShowSubjectSelector(true)}
						onSubjectChange={handleSubjectChange}
						onCloseSubjectSelector={() => setShowSubjectSelector(false)}
						onDismissStruggle={() => setShowStruggleAlert(false)}
						onExit={() => router.push('/dashboard')}
					/>
				</div>
			</FocusContent>
		</div>
	);
}

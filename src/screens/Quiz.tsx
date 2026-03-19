'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { QuizContent } from '@/components/Quiz/QuizContent';
import { WeakTopicAlert } from '@/components/Quiz/WeakTopicAlert';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { useAiContext } from '@/hooks/useAiContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import {
	getAdaptiveHint,
	getStrugglingConcepts,
	recordStruggle,
	updateConfidence,
} from '@/services/buddyActions';
import type { WeakTopicAlert as WeakTopicAlertType } from '@/types/adaptive-learning';

interface QuizProps {
	quizId?: string;
}

interface TopicStats {
	topic: string;
	correct: number;
	total: number;
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
	const [showStruggleAlert, setShowStruggleAlert] = useState(false);
	const [currentStruggleCount, setCurrentStruggleCount] = useState(0);
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);
	const [topicStats, setTopicStats] = useState<Map<string, TopicStats>>(new Map());
	const [weakTopicAlert, setWeakTopicAlert] = useState<WeakTopicAlertType | null>(null);
	const [showWeakAlert, setShowWeakAlert] = useState(false);

	const { completeQuiz, isCompleting } = useQuizCompletion();
	const { setContext, clearContext } = useAiContext();
	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[currentQuestionIndex];

	useEffect(() => {
		setContext({
			type: 'quiz',
			subject: currentSubject || quiz.subject,
			topic: currentQuestion?.topic,
			questionId: currentQuestion?.id,
			lastUpdated: Date.now(),
		});
		return () => clearContext();
	}, [currentSubject, currentQuestion, quiz.subject, setContext, clearContext]);

	// Adaptive hint query - use query data directly
	const { data: hintData } = useQuery({
		queryKey: ['adaptive-hint', currentQuestion?.topic],
		queryFn: async () => {
			if (!currentQuestion?.topic) return null;
			try {
				return await getAdaptiveHint(currentQuestion.topic);
			} catch (error) {
				if (isQuotaError(error)) triggerQuotaError();
				return null;
			}
		},
		enabled: !!currentQuestion?.topic,
		retry: false,
	});

	// Use query data directly for adaptive hint
	const adaptiveHint = hintData ?? null;

	// Timer - KEEP: This is a legitimate timer effect
	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
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

				const results = Array.from(topicStats.values()).map((stat) => ({
					topic: stat.topic,
					subject: currentSubject || quiz.subject,
					subjectId: 1,
					score: stat.total > 0 ? stat.correct / stat.total : 0,
					totalQuestions: stat.total,
					correctAnswers: stat.correct,
				}));

				if (isCorrect !== null) {
					const lastTopic = currentQuestion?.topic;
					if (lastTopic) {
						const existing = topicStats.get(lastTopic) || {
							topic: lastTopic,
							correct: 0,
							total: 0,
						};
						results.push({
							topic: lastTopic,
							subject: currentSubject || quiz.subject,
							subjectId: 1,
							score: (existing.correct + (isCorrect ? 1 : 0)) / (existing.total + 1),
							totalQuestions: existing.total + 1,
							correctAnswers: existing.correct + (isCorrect ? 1 : 0),
						});
					}
				}

				try {
					const response = await fetch('/api/adaptive-learning/process', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ quizId, results }),
					});

					if (response.ok) {
						const data = await response.json();
						if (data.alerts && data.alerts.length > 0) {
							setWeakTopicAlert(data.alerts[0]);
							setShowWeakAlert(true);
						}
					}
				} catch (error) {
					console.debug('Failed to process adaptive learning:', error);
				}

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
			setTopicStats((prev) => {
				const updated = new Map(prev);
				const existing = updated.get(currentQuestion.topic) || {
					topic: currentQuestion.topic,
					correct: 0,
					total: 0,
				};
				updated.set(currentQuestion.topic, {
					topic: currentQuestion.topic,
					correct: existing.correct + (correct ? 1 : 0),
					total: existing.total + 1,
				});
				return updated;
			});

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
		topicStats,
		quizId,
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
					{showWeakAlert && weakTopicAlert && (
						<div className="mb-6">
							<WeakTopicAlert
								topic={weakTopicAlert.topic}
								subject={weakTopicAlert.subject}
								score={weakTopicAlert.score}
								onDismiss={() => setShowWeakAlert(false)}
							/>
						</div>
					)}
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
			<ContextualAIBubble />
		</div>
	);
}

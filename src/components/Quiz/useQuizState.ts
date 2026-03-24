'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import type { ShortAnswerQuestion } from '@/constants/quiz/types';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { useAiContext } from '@/hooks/useAiContext';
import { useEdgeCaseDetection } from '@/hooks/useEdgeCaseDetection';
import { useWrongAnswerPipeline } from '@/hooks/useWrongAnswerPipeline';
import { isQuotaError } from '@/lib/ai/quota-error';
import { gradeShortAnswer, type WeakTopic } from '@/lib/quiz-grader';
import { quizReducer } from '@/lib/quiz-reducer';
import {
	getAdaptiveHint,
	getStrugglingConcepts,
	recordStruggle,
	updateConfidence,
} from '@/services/buddyActions';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import { initialQuizState } from '@/types/quiz';

interface UseQuizStateProps {
	quizId: string;
}

export function useQuizState({ quizId }: UseQuizStateProps) {
	const router = useRouter();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const startTimeRef = useRef<number>(Date.now());
	const [state, dispatch] = useReducer(quizReducer, initialQuizState);
	const addMistake = useQuizResultStore((s) => s.addMistake);

	const { completeQuiz, isCompleting } = useQuizCompletion();
	const { setContext, clearContext } = useAiContext();
	const { processWrongAnswer, autoGenerationEnabled } = useWrongAnswerPipeline();
	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[state.currentQuestionIndex];

	// Study plan update state
	const [studyPlanUpdate, setStudyPlanUpdate] = useState<{
		weakTopics: WeakTopic[];
		adjustment: {
			topicsPrioritized: string[];
			difficultyAdjustments: Array<{
				topic: string;
				newDifficulty: 'easier' | 'harder' | 'same';
				reason: string;
			}>;
			focusAreasUpdated: boolean;
			sessionsReordered: boolean;
		};
	} | null>(null);

	const {
		isModalOpen,
		currentEdgeCase,
		currentEdgeCaseType,
		closeModal,
		handleAction,
		recordQuestionAnswer,
		recordHintUsage,
	} = useEdgeCaseDetection({
		userId: 'anonymous',
		sessionId: quizId,
		enableAutoMonitoring: true,
	});

	useEffect(() => {
		setContext({
			type: 'quiz',
			subject: state.currentSubject || quiz.subject,
			topic: currentQuestion?.topic,
			questionId: currentQuestion?.id,
			lastUpdated: Date.now(),
		});
		return () => clearContext();
	}, [state.currentSubject, currentQuestion, quiz.subject, setContext, clearContext]);

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

	const adaptiveHint = hintData ?? null;

	useEffect(() => {
		const timer = setInterval(() => {
			dispatch({
				type: 'SET_ELAPSED',
				payload: Math.floor((Date.now() - startTimeRef.current) / 1000),
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const options =
		currentQuestion.type === 'mcq' || !currentQuestion.type
			? currentQuestion.options.map((o) => ({
					id: o.id,
					label: o.text,
					isCorrect: o.id === currentQuestion.correctAnswer,
				}))
			: [];

	const handleSubjectChange = useCallback(
		(subject: string) => {
			dispatch({ type: 'SET_SUBJECT', payload: subject });
			const firstQuiz = Object.entries(QUIZ_DATA).find(([, q]) => q.subject === subject);
			if (firstQuiz) router.push(`/quiz?id=${firstQuiz[0]}`);
			dispatch({ type: 'TOGGLE_SUBJECT_SELECTOR', payload: false });
		},
		[router]
	);

	const handleToggleHint = useCallback(() => {
		dispatch({ type: 'TOGGLE_HINT' });
		recordHintUsage();
	}, [recordHintUsage]);

	const handleCheck = useCallback(async () => {
		if (state.isChecked) {
			if (state.currentQuestionIndex < quiz.questions.length - 1) {
				dispatch({ type: 'SET_QUESTION_INDEX', payload: state.currentQuestionIndex + 1 });
				dispatch({ type: 'RESET_ANSWER_STATE' });
			} else {
				const finalScore = state.score + (state.isCorrect ? 1 : 0);

				const results = Array.from(state.topicStats.values()).map((stat) => ({
					topic: stat.topic,
					subject: state.currentSubject || quiz.subject,
					subjectId: 1,
					score: stat.total > 0 ? stat.correct / stat.total : 0,
					totalQuestions: stat.total,
					correctAnswers: stat.correct,
				}));

				if (state.isCorrect !== null) {
					const lastTopic = currentQuestion?.topic;
					if (lastTopic) {
						const existing = state.topicStats.get(lastTopic) || {
							topic: lastTopic,
							correct: 0,
							total: 0,
						};
						results.push({
							topic: lastTopic,
							subject: state.currentSubject || quiz.subject,
							subjectId: 1,
							score: (existing.correct + (state.isCorrect ? 1 : 0)) / (existing.total + 1),
							totalQuestions: existing.total + 1,
							correctAnswers: existing.correct + (state.isCorrect ? 1 : 0),
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
							dispatch({ type: 'SET_WEAK_TOPIC_ALERT', payload: data.alerts[0] });
							dispatch({ type: 'TOGGLE_WEAK_ALERT', payload: true });
						}
					}
				} catch (error) {
					console.debug('Failed to process adaptive learning:', error);
				}

				// Process quiz result for study plan adjustment
				try {
					const topicStatsArray = Array.from(state.topicStats.values());
					const quizResultForAnalysis = {
						quizId,
						subject: state.currentSubject || quiz.subject,
						topics: topicStatsArray.map((stat) => ({
							topic: stat.topic,
							correct: stat.correct,
							total: stat.total,
						})),
						totalTimeSeconds: state.elapsedSeconds,
					};

					const studyPlanResponse = await fetch('/api/study-plan/adjust', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							weakTopics: [], // Will be detected server-side
							quizId,
							quizResultForAnalysis,
						}),
					});

					if (studyPlanResponse.ok) {
						const studyPlanData = await studyPlanResponse.json();
						if (studyPlanData.success && studyPlanData.adjustment) {
							setStudyPlanUpdate({
								weakTopics: studyPlanData.weakTopics || [],
								adjustment: studyPlanData.adjustment,
							});
						}
					}
				} catch (error) {
					console.debug('Failed to process study plan adjustment:', error);
				}

				await completeQuiz({
					subjectId: 1,
					topic: quiz.title,
					totalQuestions: quiz.questions.length,
					correctAnswers: finalScore,
					marksEarned: finalScore * 10,
					durationMinutes: Math.ceil(state.elapsedSeconds / 60),
					difficulty: 'medium',
					sessionType: state.mode,
				});
				router.push('/lesson-complete');
			}
			return;
		}

		const isShortAnswer = currentQuestion.type === 'shortAnswer';

		if (isShortAnswer && 'correctAnswer' in currentQuestion) {
			dispatch({ type: 'SET_GRADING', payload: true });
			const result = await gradeShortAnswer(
				state.answerText,
				currentQuestion as ShortAnswerQuestion
			);
			dispatch({
				type: 'SET_SHORT_ANSWER_RESULT',
				payload: {
					score: result.score,
					maxScore: result.maxScore,
					feedback: result.feedback,
					isCorrect: result.isCorrect,
				},
			});
			if (result.isCorrect) {
				dispatch({ type: 'INCREMENT_CORRECT' });
			} else {
				dispatch({ type: 'INCREMENT_INCORRECT' });
			}
			if (currentQuestion.topic) {
				dispatch({
					type: 'UPDATE_TOPIC_STATS',
					payload: { topic: currentQuestion.topic, correct: result.isCorrect ? 1 : 0 },
				});

				if (!result.isCorrect && autoGenerationEnabled) {
					const shortAnswerQuestion = currentQuestion as ShortAnswerQuestion;
					const wrongAnswer = {
						questionId: shortAnswerQuestion.id,
						questionText: shortAnswerQuestion.question,
						correctAnswer: shortAnswerQuestion.correctAnswer,
						userAnswer: state.answerText,
						explanation: result.feedback,
						topic: shortAnswerQuestion.topic,
						subject: state.currentSubject || quiz.subject,
						difficulty: 'medium' as const,
					};

					addMistake({
						questionId: currentQuestion.id,
						topic: currentQuestion.topic,
						subject: state.currentSubject || quiz.subject,
					});

					processWrongAnswer(wrongAnswer);
				}

				try {
					await updateConfidence(currentQuestion.topic, state.currentSubject, result.isCorrect);
				} catch (error) {
					console.debug('Failed to update confidence:', error);
				}

				recordQuestionAnswer(result.isCorrect, false);
			}
			return;
		}

		const selectedOption = options.find((o) => o.id === state.selectedOption);
		const correct = selectedOption?.isCorrect || false;
		const userAnswer = selectedOption?.label || '';
		const correctOption = options.find((o) => o.isCorrect);
		dispatch({ type: 'CHECK_ANSWER', payload: correct });

		if (correct) {
			dispatch({ type: 'INCREMENT_CORRECT' });
		} else {
			dispatch({ type: 'INCREMENT_INCORRECT' });
		}

		if (currentQuestion?.topic) {
			dispatch({
				type: 'UPDATE_TOPIC_STATS',
				payload: { topic: currentQuestion.topic, correct: correct ? 1 : 0 },
			});

			if (!correct && autoGenerationEnabled) {
				const quizQuestion = currentQuestion as {
					id: string;
					question: string;
					topic: string;
					difficulty: 'easy' | 'medium' | 'hard';
					options: { id: string; text: string }[];
				};
				const wrongAnswer = {
					questionId: quizQuestion.id,
					questionText: quizQuestion.question,
					correctAnswer: correctOption?.label || '',
					userAnswer,
					topic: quizQuestion.topic,
					subject: state.currentSubject || quiz.subject,
					difficulty: quizQuestion.difficulty,
				};

				addMistake({
					questionId: currentQuestion.id,
					topic: currentQuestion.topic,
					subject: state.currentSubject || quiz.subject,
				});

				processWrongAnswer(wrongAnswer);
			}

			try {
				await Promise.all([
					updateConfidence(currentQuestion.topic, state.currentSubject, correct),
					recordQuestionAttempt(currentQuestion.id, currentQuestion.topic, correct),
				]);
				const newDifficulty = await getAdaptiveDifficultyServer();
				dispatch({ type: 'SET_DIFFICULTY', payload: newDifficulty });
				if (!correct) {
					await recordStruggle(currentQuestion.topic);
					const struggles = await getStrugglingConcepts();
					const thisStruggle = struggles.find((s) => s.concept === currentQuestion.topic);
					if (thisStruggle && thisStruggle.struggleCount >= 2) {
						dispatch({
							type: 'SET_STRUGGLE_ALERT',
							payload: { show: true, count: thisStruggle.struggleCount },
						});
					}
				}
			} catch (error) {
				console.debug('Failed to track progress:', error);
			}

			recordQuestionAnswer(correct, false);
		}
	}, [
		state.isChecked,
		state.currentQuestionIndex,
		quiz,
		state.selectedOption,
		state.isCorrect,
		state.score,
		state.elapsedSeconds,
		state.mode,
		currentQuestion,
		state.currentSubject,
		completeQuiz,
		router,
		state.topicStats,
		quizId,
		options,
		state.answerText,
		addMistake,
		processWrongAnswer,
		autoGenerationEnabled,
		recordQuestionAnswer,
	]);

	// Dismiss study plan update notification
	const dismissStudyPlanUpdate = useCallback(() => {
		setStudyPlanUpdate(null);
	}, []);

	// Navigate to study plan page
	const viewStudyPlan = useCallback(() => {
		router.push('/study-plan');
	}, [router]);

	return {
		state,
		dispatch,
		quiz,
		currentQuestion,
		adaptiveHint,
		options,
		isCompleting,
		isModalOpen,
		currentEdgeCase,
		currentEdgeCaseType,
		closeModal,
		handleAction,
		handleSubjectChange,
		handleToggleHint,
		handleCheck,
		// Study plan integration
		studyPlanUpdate,
		dismissStudyPlanUpdate,
		viewStudyPlan,
	};
}

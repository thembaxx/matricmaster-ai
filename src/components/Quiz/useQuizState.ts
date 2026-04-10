'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getMistakeContentRecommendations } from '@/actions/mistake-to-study-plan';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import { QUESTIONS_DATA as QUIZ_DATA } from '@/content/questions';
import type { ShortAnswerQuestion } from '@/content/questions/quiz/types';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { useAiContext } from '@/hooks/useAiContext';
import { useEdgeCaseDetection } from '@/hooks/useEdgeCaseDetection';
import { useKnowledgeGapSynergy } from '@/hooks/useKnowledgeGapSynergy';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
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
import { completeQuizOffline } from '@/services/offlineQuizSync';
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
	const { isOnline } = useNetworkStatus();

	const { completeQuiz, isCompleting } = useQuizCompletion();
	const { setContext, clearContext } = useAiContext();
	const { processWrongAnswer, autoGenerationEnabled } = useWrongAnswerPipeline();
	const { analyzeQuizResults } = useKnowledgeGapSynergy();

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
			if (isOnline || state.mode === 'practice') {
				dispatch({
					type: 'SET_ELAPSED',
					payload: Math.floor((Date.now() - startTimeRef.current) / 1000),
				});
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [isOnline, state.mode]);

	const options =
		currentQuestion.type === 'mcq' || !currentQuestion.type
			? currentQuestion.options.map((o) => ({
					id: o.id,
					label: o.text,
					isCorrect: o.id === currentQuestion.correctAnswer,
				}))
			: [];

	const handleSetConfidence = useCallback((level: 'low' | 'medium' | 'high') => {
		dispatch({ type: 'SET_CONFIDENCE', payload: level });
	}, []);

	const handleInteractiveChange = useCallback(
		(answer: Record<string, string> | string[] | null) => {
			dispatch({ type: 'SET_INTERACTIVE_ANSWER', payload: answer });
		},
		[]
	);

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

				// Save completion to IndexedDB for offline sync
				const sessionId = `${quizId}-${Date.now()}`;
				await completeQuizOffline(
					sessionId,
					quizId,
					quiz.subject,
					quiz.questions.length,
					finalScore,
					Math.round((finalScore / quiz.questions.length) * 100),
					state.elapsedSeconds * 1000
				);

				// BRIDGE TO MASTERY LOGIC
				const mistakes = Array.from(state.topicStats.values())
					.filter((stat) => stat.correct < stat.total)
					.map((stat) => ({
						topic: stat.topic,
						subject: state.currentSubject || quiz.subject,
						questionId: 'session-summary',
					}));

				let recommendations: any[] = [];
				if (mistakes.length > 0) {
					try {
						recommendations = await getMistakeContentRecommendations(mistakes);
					} catch (error) {
						console.debug('Failed to fetch recommendations:', error);
					}
				}

				// Analyze Knowledge Gaps for Adaptive Remediation
				try {
					await analyzeQuizResults(
						quiz.questions.map((q, i) => ({
							id: q.id,
							topic: q.topic,
							subject: quiz.subject,
							isCorrect:
								i === state.currentQuestionIndex
									? (state.isCorrect ?? false)
									: (state.topicStats.get(q.topic || 'General')?.correct ?? 0) > 0, // This is a simplification, state should ideally track all per-question
						})),
						{ correct: finalScore, total: quiz.questions.length }
					);
				} catch (error) {
					console.debug('Failed to analyze knowledge gaps:', error);
				}

				dispatch({ type: 'SET_QUIZ_FINISHED', payload: { recommendations } });
			}
			return;
		}

		const isShortAnswer = currentQuestion.type === 'shortAnswer';
		const isDiagramFill = currentQuestion.type === 'diagramFill';
		const isChronologicalSort = currentQuestion.type === 'chronologicalSort';

		if (isDiagramFill && 'correctAnswer' in currentQuestion) {
			const userMapping = state.interactiveAnswer as Record<string, string> | null;
			const correctMapping = (currentQuestion as any).correctAnswer as Record<string, string>;
			const isCorrectAnswer =
				userMapping &&
				Object.keys(correctMapping).every(
					(zoneId) => userMapping[zoneId] === correctMapping[zoneId]
				);
			dispatch({ type: 'CHECK_ANSWER', payload: !!isCorrectAnswer });
			if (isCorrectAnswer) {
				dispatch({ type: 'INCREMENT_CORRECT' });
			} else {
				dispatch({ type: 'INCREMENT_INCORRECT' });
			}
			if (currentQuestion.topic) {
				dispatch({
					type: 'UPDATE_TOPIC_STATS',
					payload: { topic: currentQuestion.topic, correct: isCorrectAnswer ? 1 : 0 },
				});
				recordQuestionAnswer(!!isCorrectAnswer, false);
			}
			return;
		}

		if (isChronologicalSort && 'correctOrder' in currentQuestion) {
			const userOrder = state.interactiveAnswer as string[] | null;
			const correctOrder = (currentQuestion as any).correctOrder as string[];
			const isCorrectAnswer = userOrder && correctOrder.every((id, idx) => userOrder[idx] === id);
			dispatch({ type: 'CHECK_ANSWER', payload: !!isCorrectAnswer });
			if (isCorrectAnswer) {
				dispatch({ type: 'INCREMENT_CORRECT' });
			} else {
				dispatch({ type: 'INCREMENT_INCORRECT' });
			}
			if (currentQuestion.topic) {
				dispatch({
					type: 'UPDATE_TOPIC_STATS',
					payload: { topic: currentQuestion.topic, correct: isCorrectAnswer ? 1 : 0 },
				});
				recordQuestionAnswer(!!isCorrectAnswer, false);
			}
			return;
		}

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

		if (!correct && state.confidenceLevel === 'high') {
			dispatch({ type: 'SET_CONFIDENT_ERROR', payload: true });
		}

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
		state.topicStats,
		quizId,
		options,
		state.answerText,
		addMistake,
		processWrongAnswer,
		autoGenerationEnabled,
		recordQuestionAnswer,
		state.interactiveAnswer,
		state.confidenceLevel,
		analyzeQuizResults,
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
		handleSetConfidence,
		handleInteractiveChange,
		studyPlanUpdate,
		dismissStudyPlanUpdate,
		viewStudyPlan,
	};
}

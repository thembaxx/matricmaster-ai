'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useReducer, useRef } from 'react';
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

type QuizState = {
	currentQuestionIndex: number;
	selectedOption: string | null;
	isChecked: boolean;
	isCorrect: boolean | null;
	elapsedSeconds: number;
	showHint: boolean;
	score: number;
	mode: 'test' | 'practice';
	showSubjectSelector: boolean;
	currentSubject: string;
	showStruggleAlert: boolean;
	currentStruggleCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
	correctCount: number;
	incorrectCount: number;
	topicStats: Map<string, TopicStats>;
	weakTopicAlert: WeakTopicAlertType | null;
	showWeakAlert: boolean;
};

type QuizAction =
	| { type: 'SET_QUESTION_INDEX'; payload: number }
	| { type: 'SET_OPTION'; payload: string | null }
	| { type: 'CHECK_ANSWER'; payload: boolean }
	| { type: 'RESET_ANSWER_STATE' }
	| { type: 'SET_ELAPSED'; payload: number }
	| { type: 'TOGGLE_HINT' }
	| { type: 'SET_MODE'; payload: 'test' | 'practice' }
	| { type: 'TOGGLE_SUBJECT_SELECTOR'; payload: boolean }
	| { type: 'SET_SUBJECT'; payload: string }
	| { type: 'SET_STRUGGLE_ALERT'; payload: { show: boolean; count: number } }
	| { type: 'SET_DIFFICULTY'; payload: 'easy' | 'medium' | 'hard' }
	| { type: 'UPDATE_CORRECT_COUNT'; payload: number }
	| { type: 'UPDATE_INCORRECT_COUNT'; payload: number }
	| { type: 'UPDATE_TOPIC_STATS'; payload: { topic: string; correct: number } }
	| { type: 'SET_WEAK_TOPIC_ALERT'; payload: WeakTopicAlertType | null }
	| { type: 'TOGGLE_WEAK_ALERT'; payload: boolean }
	| { type: 'INCREMENT_CORRECT' }
	| { type: 'INCREMENT_INCORRECT' };

const initialState: QuizState = {
	currentQuestionIndex: 0,
	selectedOption: null,
	isChecked: false,
	isCorrect: null,
	elapsedSeconds: 0,
	showHint: false,
	score: 0,
	mode: 'test',
	showSubjectSelector: false,
	currentSubject: '',
	showStruggleAlert: false,
	currentStruggleCount: 0,
	difficulty: 'medium',
	correctCount: 0,
	incorrectCount: 0,
	topicStats: new Map(),
	weakTopicAlert: null,
	showWeakAlert: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
	switch (action.type) {
		case 'SET_QUESTION_INDEX':
			return { ...state, currentQuestionIndex: action.payload };
		case 'SET_OPTION':
			return { ...state, selectedOption: action.payload };
		case 'CHECK_ANSWER':
			return { ...state, isChecked: true, isCorrect: action.payload };
		case 'RESET_ANSWER_STATE':
			return { ...state, selectedOption: null, isChecked: false, isCorrect: null, showHint: false };
		case 'SET_ELAPSED':
			return { ...state, elapsedSeconds: action.payload };
		case 'TOGGLE_HINT':
			return { ...state, showHint: !state.showHint };
		case 'SET_MODE':
			return { ...state, mode: action.payload };
		case 'TOGGLE_SUBJECT_SELECTOR':
			return { ...state, showSubjectSelector: action.payload };
		case 'SET_SUBJECT':
			return { ...state, currentSubject: action.payload };
		case 'SET_STRUGGLE_ALERT':
			return {
				...state,
				showStruggleAlert: action.payload.show,
				currentStruggleCount: action.payload.count,
			};
		case 'SET_DIFFICULTY':
			return { ...state, difficulty: action.payload };
		case 'UPDATE_CORRECT_COUNT':
			return { ...state, correctCount: action.payload };
		case 'UPDATE_INCORRECT_COUNT':
			return { ...state, incorrectCount: action.payload };
		case 'UPDATE_TOPIC_STATS': {
			const newTopicStats = new Map(state.topicStats);
			const existing = newTopicStats.get(action.payload.topic) || {
				topic: action.payload.topic,
				correct: 0,
				total: 0,
			};
			newTopicStats.set(action.payload.topic, {
				topic: action.payload.topic,
				correct: existing.correct + action.payload.correct,
				total: existing.total + 1,
			});
			return { ...state, topicStats: newTopicStats };
		}
		case 'SET_WEAK_TOPIC_ALERT':
			return { ...state, weakTopicAlert: action.payload };
		case 'TOGGLE_WEAK_ALERT':
			return { ...state, showWeakAlert: action.payload };
		case 'INCREMENT_CORRECT':
			return { ...state, score: state.score + 1, correctCount: state.correctCount + 1 };
		case 'INCREMENT_INCORRECT':
			return { ...state, incorrectCount: state.incorrectCount + 1 };
		default:
			return state;
	}
}

function QuizInner({ quizId: initialQuizId }: QuizProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const urlQuizId = searchParams.get('id');
	const quizId = initialQuizId || urlQuizId || 'math-p1-2023-nov';

	const startTimeRef = useRef<number>(Date.now());
	const [state, dispatch] = useReducer(quizReducer, initialState);

	const { completeQuiz, isCompleting } = useQuizCompletion();
	const { setContext, clearContext } = useAiContext();
	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[state.currentQuestionIndex];

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

	const options = currentQuestion.options.map((o) => ({
		id: o.id,
		label: o.text,
		isCorrect: o.id === currentQuestion.correctAnswer,
	}));

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

		const correct = options.find((o) => o.id === state.selectedOption)?.isCorrect || false;
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
	]);

	const handleSubjectChange = (subject: string) => {
		dispatch({ type: 'SET_SUBJECT', payload: subject });
		const firstQuiz = Object.entries(QUIZ_DATA).find(([, q]) => q.subject === subject);
		if (firstQuiz) router.push(`/quiz?id=${firstQuiz[0]}`);
		dispatch({ type: 'TOGGLE_SUBJECT_SELECTOR', payload: false });
	};

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{state.showWeakAlert && state.weakTopicAlert && (
						<div className="mb-6">
							<WeakTopicAlert
								topic={state.weakTopicAlert.topic}
								subject={state.weakTopicAlert.subject}
								score={state.weakTopicAlert.score}
								onDismiss={() => dispatch({ type: 'TOGGLE_WEAK_ALERT', payload: false })}
							/>
						</div>
					)}
					<QuizContent
						quiz={quiz}
						currentQuestionIndex={state.currentQuestionIndex}
						selectedOption={state.selectedOption}
						isChecked={state.isChecked}
						isCorrect={state.isCorrect}
						elapsedSeconds={state.elapsedSeconds}
						showHint={state.showHint}
						score={state.score}
						mode={state.mode}
						currentSubject={state.currentSubject}
						showSubjectSelector={state.showSubjectSelector}
						adaptiveHint={adaptiveHint}
						showStruggleAlert={state.showStruggleAlert}
						currentStruggleCount={state.currentStruggleCount}
						difficulty={state.difficulty}
						correctCount={state.correctCount}
						incorrectCount={state.incorrectCount}
						isCompleting={isCompleting}
						onSelectOption={(opt) => dispatch({ type: 'SET_OPTION', payload: opt })}
						onToggleHint={() => dispatch({ type: 'TOGGLE_HINT' })}
						onCheck={handleCheck}
						onModeChange={(m) => dispatch({ type: 'SET_MODE', payload: m })}
						onShowSubjectSelector={() =>
							dispatch({ type: 'TOGGLE_SUBJECT_SELECTOR', payload: true })
						}
						onSubjectChange={handleSubjectChange}
						onCloseSubjectSelector={() =>
							dispatch({ type: 'TOGGLE_SUBJECT_SELECTOR', payload: false })
						}
						onDismissStruggle={() =>
							dispatch({ type: 'SET_STRUGGLE_ALERT', payload: { show: false, count: 0 } })
						}
						onExit={() => router.push('/dashboard')}
					/>
				</div>
			</FocusContent>
			<ContextualAIBubble />
		</div>
	);
}

function QuizSkeleton() {
	return (
		<div className="min-h-screen bg-background flex">
			<div className="flex-1 p-8">
				<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
					<div className="h-8 bg-muted rounded w-1/4" />
					<div className="h-64 bg-muted rounded-lg" />
					<div className="space-y-3">
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Quiz(props: QuizProps) {
	return (
		<Suspense fallback={<QuizSkeleton />}>
			<QuizInner {...props} />
		</Suspense>
	);
}

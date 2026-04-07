'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { EdgeCaseHandler } from '@/components/EdgeCase/EdgeCaseHandler';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { QuizContent } from '@/components/Quiz/QuizContent';
import { useQuizState } from '@/components/Quiz/useQuizState';
import { WeakTopicAlert } from '@/components/Quiz/WeakTopicAlert';
import { QuizRecoveryDialog } from '@/components/ui/QuizRecoveryDialog';
import {
	registerOnlineListener,
	saveQuizAnswer,
	syncAllPendingData,
} from '@/services/offlineQuizSync';
import { useQuizAutoSave } from '@/stores/useQuizAutoSaveStore';

interface QuizInnerProps {
	quizId?: string;
}

function QuizInner({ quizId: initialQuizId }: QuizInnerProps) {
	const searchParams = useSearchParams();
	const urlQuizId = searchParams.get('id');
	const quizId = initialQuizId || urlQuizId || 'math-p1-2023-nov';

	const {
		state,
		dispatch,
		quiz,
		adaptiveHint,
		isCompleting,
		isModalOpen,
		currentEdgeCase,
		currentEdgeCaseType,
		closeModal,
		handleAction,
		handleSubjectChange,
		handleToggleHint,
		handleCheck,
	} = useQuizState({ quizId });

	const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const {
		savedQuizState,
		showRecoveryDialog,
		checkForRecovery,
		dismissRecovery,
		confirmRecovery,
		saveQuizState: storeSaveQuiz,
		clearSavedQuiz,
	} = useQuizAutoSave();

	const getQuizStateForSave = useCallback(
		() => ({
			quizId,
			currentQuestionIndex: state.currentQuestionIndex,
			selectedOption: state.selectedOption,
			answerText: state.answerText,
			isChecked: state.isChecked,
			elapsedSeconds: state.elapsedSeconds,
			mode: state.mode,
			currentSubject: state.currentSubject,
			score: state.score,
			correctCount: state.correctCount,
			incorrectCount: state.incorrectCount,
			topicStats: Array.from(state.topicStats.entries()).map(([topic, stats]) => ({
				topic,
				correct: stats.correct,
				total: stats.total,
			})),
			questionCount: quiz.questions.length,
		}),
		[
			quizId,
			state.currentQuestionIndex,
			state.selectedOption,
			state.answerText,
			state.isChecked,
			state.elapsedSeconds,
			state.mode,
			state.currentSubject,
			state.score,
			state.correctCount,
			state.incorrectCount,
			quiz.questions.length,
			state.topicStats.entries,
		]
	);

	useEffect(() => {
		checkForRecovery();
	}, [checkForRecovery]);

	useEffect(() => {
		if (autoSaveIntervalRef.current) {
			clearInterval(autoSaveIntervalRef.current);
		}

		autoSaveIntervalRef.current = setInterval(() => {
			storeSaveQuiz(getQuizStateForSave());
		}, 10000);

		return () => {
			if (autoSaveIntervalRef.current) {
				clearInterval(autoSaveIntervalRef.current);
			}
		};
	}, [getQuizStateForSave, storeSaveQuiz]);

	// Sync pending offline data when back online
	const syncPendingDataRef = useRef<() => void>(() => {});
	useEffect(() => {
		const cleanup = registerOnlineListener(async (online) => {
			if (online) {
				await syncAllPendingData();
			}
		});
		syncPendingDataRef.current = cleanup;
		return cleanup;
	}, []);

	// Warn before leaving with unsaved progress
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (state.currentQuestionIndex > 0 && !state.isChecked) {
				e.preventDefault();
				return 'You have unsaved answers. Are you sure you want to leave?';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [state.currentQuestionIndex, state.isChecked]);

	const handleSelectOption = useCallback(
		(opt: string | null) => {
			dispatch({ type: 'SET_OPTION', payload: opt });
			storeSaveQuiz(getQuizStateForSave());

			// Immediately save answer to IndexedDB for offline sync
			const currentQuestion = quiz.questions[state.currentQuestionIndex];
			if (currentQuestion && opt) {
				// Check if question has correctAnswer (not all question types do, e.g., matching)
				const hasCorrectAnswer = 'correctAnswer' in currentQuestion;
				const isCorrect = hasCorrectAnswer ? opt === currentQuestion.correctAnswer : true;

				saveQuizAnswer(`${quizId}-${Date.now()}`, quizId, quiz.subject, {
					questionId: currentQuestion.id,
					selectedOption: opt,
					isCorrect,
					timeSpentMs: 0,
					answeredAt: new Date().toISOString(),
				}).catch((err) => console.debug('Failed to save answer to IndexedDB:', err));
			}
		},
		[dispatch, storeSaveQuiz, getQuizStateForSave, quiz, state.currentQuestionIndex, quizId]
	);

	const handleAnswerTextChange = useCallback(
		(text: string) => {
			dispatch({ type: 'SET_ANSWER_TEXT', payload: text });
			storeSaveQuiz(getQuizStateForSave());
		},
		[dispatch, storeSaveQuiz, getQuizStateForSave]
	);

	const handleNavigateToQuestion = useCallback(
		(index: number) => {
			dispatch({ type: 'SET_QUESTION_INDEX', payload: index });
			storeSaveQuiz(getQuizStateForSave());
		},
		[dispatch, storeSaveQuiz, getQuizStateForSave]
	);

	const handleRecoveryConfirm = useCallback(() => {
		if (savedQuizState) {
			dispatch({ type: 'SET_QUESTION_INDEX', payload: savedQuizState.currentQuestionIndex });
			dispatch({ type: 'SET_OPTION', payload: savedQuizState.selectedOption });
			dispatch({ type: 'SET_ANSWER_TEXT', payload: savedQuizState.answerText });
			dispatch({ type: 'SET_ELAPSED', payload: savedQuizState.elapsedSeconds });
			dispatch({ type: 'SET_MODE', payload: savedQuizState.mode });
			dispatch({ type: 'SET_SUBJECT', payload: savedQuizState.currentSubject });
			dispatch({ type: 'UPDATE_CORRECT_COUNT', payload: savedQuizState.correctCount });
			dispatch({ type: 'UPDATE_INCORRECT_COUNT', payload: savedQuizState.incorrectCount });
			if (savedQuizState.topicStats.length > 0) {
				const topicStatsMap = new Map(
					savedQuizState.topicStats.map((s) => [
						s.topic,
						{ topic: s.topic, correct: s.correct, total: s.total },
					])
				);
				dispatch({ type: 'LOAD_TOPIC_STATS', payload: topicStatsMap });
			}
		}
		confirmRecovery();
	}, [savedQuizState, dispatch, confirmRecovery]);

	const handleRecoveryDismiss = useCallback(() => {
		clearSavedQuiz();
		dismissRecovery();
	}, [clearSavedQuiz, dismissRecovery]);

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
						quizId={quizId}
						quiz={quiz}
						currentQuestionIndex={state.currentQuestionIndex}
						selectedOption={state.selectedOption}
						answerText={state.answerText}
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
						isGrading={state.isGrading}
						shortAnswerFeedback={state.shortAnswerFeedback}
						onSelectOption={handleSelectOption}
						onAnswerTextChange={handleAnswerTextChange}
						onToggleHint={handleToggleHint}
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
						onExit={() => window.history.back()}
						onNavigateToQuestion={handleNavigateToQuestion}
					/>
				</div>
			</FocusContent>
			<ContextualAIBubble />
			<EdgeCaseHandler
				isOpen={isModalOpen}
				edgeCase={currentEdgeCase}
				edgeCaseType={currentEdgeCaseType || 'COMPLETE_FAILURE'}
				onClose={closeModal}
				onAction={handleAction}
			/>
			<QuizRecoveryDialog
				isOpen={showRecoveryDialog}
				savedState={savedQuizState}
				onConfirm={handleRecoveryConfirm}
				onDismiss={handleRecoveryDismiss}
			/>
		</div>
	);
}

function QuizSkeleton() {
	return (
		<div className="min-h-screen bg-background flex">
			<div className="flex-1 p-12">
				<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
					<div className="h-8 bg-muted rounded-md w-1/4" />
					<div className="h-64 bg-muted rounded-xl" />
					<div className="space-y-3">
						<div className="h-12 bg-muted rounded-md" />
						<div className="h-12 bg-muted rounded-md" />
						<div className="h-12 bg-muted rounded-md" />
						<div className="h-12 bg-muted rounded-md" />
					</div>
				</div>
			</div>
		</div>
	);
}

interface QuizProps {
	quizId?: string;
}

export default function Quiz(props: QuizProps) {
	return (
		<ViewTransition default="none" enter="vt-nav-forward" exit="vt-nav-back">
			<Suspense fallback={<QuizSkeleton />}>
				<QuizInner {...props} />
			</Suspense>
		</ViewTransition>
	);
}

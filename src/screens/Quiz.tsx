'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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

import { quizContentResolver } from '@/services/content-resolver';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import Link from 'next/link';

interface QuizInnerProps {
	quizId?: string;
	subject?: string;
	category?: string;
}

function QuizInner({ quizId: initialQuizId, subject: pathSubject, category: pathCategory }: QuizInnerProps) {
	const searchParams = useSearchParams();
	const urlQuizId = searchParams.get('id');
	const urlSubject = searchParams.get('subject');
	const urlCategory = searchParams.get('category');

	const subject = pathSubject || urlSubject;
	const category = pathCategory || urlCategory;

	const { data: resolvedData, isLoading: isResolving } = useQuery({
		queryKey: ['resolve-quiz', initialQuizId, urlQuizId, subject, category],
		queryFn: () => quizContentResolver.resolveQuiz({
			subject: subject as any,
			category: category || undefined
		}),
	});

	const quizId = initialQuizId || urlQuizId || resolvedData?.quiz?.id || 'math-p1-2023-nov';

	if (isResolving) return <QuizSkeleton />;

	if (resolvedData?.status === 'empty') {
		return (
			<div className="min-h-screen bg-background flex">
				<TimelineSidebar />
				<FocusContent>
					<div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
						<div className="text-6xl">🔍</div>
						<h1 className="text-2xl font-display font-bold">no quizzes found</h1>
						<p className="text-muted-foreground">
							{resolvedData.message || `we couldn't find any quizzes for ${category || subject}`}
						</p>
						<div className="flex justify-center gap-4">
							<Button asChild variant="outline" className="rounded-full">
								<Link href="/quiz">
									<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
									back to subjects
								</Link>
							</Button>
						</div>
					</div>
				</FocusContent>
			</div>
		);
	}

	return <QuizStateWrapper key={quizId} quizId={quizId} />;
}

function QuizStateWrapper({ quizId }: { quizId: string }) {
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
		handleSetConfidence,
		handleInteractiveChange,
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
			dispatch({ type: 'SET_MACHINE_STATE', payload: 'ANSWER' });
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
						interactiveAnswer={state.interactiveAnswer}
						onInteractiveChange={handleInteractiveChange}
						confidenceLevel={state.confidenceLevel}
						onSetConfidence={handleSetConfidence}
						isConfidentError={state.isConfidentError}
						onDismissConfidentError={() =>
							dispatch({ type: 'SET_CONFIDENT_ERROR', payload: false })
						}
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
	subject?: string;
	category?: string;
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

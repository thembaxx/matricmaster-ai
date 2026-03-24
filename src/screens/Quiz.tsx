'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { EdgeCaseHandler } from '@/components/EdgeCase/EdgeCaseHandler';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { QuizContent } from '@/components/Quiz/QuizContent';
import { useQuizState } from '@/components/Quiz/useQuizState';
import { WeakTopicAlert } from '@/components/Quiz/WeakTopicAlert';

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
						onSelectOption={(opt) => dispatch({ type: 'SET_OPTION', payload: opt })}
						onAnswerTextChange={(text) => dispatch({ type: 'SET_ANSWER_TEXT', payload: text })}
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

interface QuizProps {
	quizId?: string;
}

export default function Quiz(props: QuizProps) {
	return (
		<Suspense fallback={<QuizSkeleton />}>
			<QuizInner {...props} />
		</Suspense>
	);
}

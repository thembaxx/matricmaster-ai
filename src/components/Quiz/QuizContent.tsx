'use client';

import { AnimatePresence, motion as m } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MathInputField } from '@/components/MathKeyboard';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { AnswerBreakdown } from '@/components/Quiz/AnswerBreakdown';
import { ConfidenceSelector } from '@/components/Quiz/ConfidenceSelector';
import { DifficultyIndicator } from '@/components/Quiz/DifficultyIndicator';
import { FlaggedReviewPanel } from '@/components/Quiz/FlaggedReviewPanel';
import { MathKeyboard } from '@/components/Quiz/MathKeyboard';
import { MisconceptionDialogue } from '@/components/Quiz/MisconceptionDialogue';
import { QuestionCard } from '@/components/Quiz/QuestionCard';
import { QuestionExtras } from '@/components/Quiz/QuestionExtras';
import { QuizFooter } from '@/components/Quiz/QuizFooter';
import { QuizProgress } from '@/components/Quiz/QuizProgress';
import { QuizProgressDashboard } from '@/components/Quiz/QuizProgressDashboard';
import { ShortAnswerInput } from '@/components/Quiz/ShortAnswerInput';
import { SubjectSelector } from '@/components/Quiz/SubjectSelector';
import type {
	AnyQuizQuestion,
	ChronologicalSortQuestion,
	DiagramFillQuestion,
	ShortAnswerQuestion,
} from '@/content/questions/quiz/types';
import { useMathKeyboard } from '@/hooks/use-math-keyboard';
import { DURATION, EASING } from '@/lib/animation-presets';
import { useAdaptiveDifficulty } from '@/stores/useAdaptiveDifficultyStore';
import { useQuestionFlagStore } from '@/stores/useQuestionFlagStore';
import { useUserLearningProfileStore } from '@/stores/useUserLearningProfileStore';
import type { ConfidenceLevel } from '@/types/quiz';
import { DraggableDiagram } from './DraggableDiagram';
import { QuizTimer } from './QuizTimer';
import { QuizToolbar } from './QuizToolbar';
import { ShortAnswerFeedback } from './ShortAnswerFeedback';
import { TimelineSorter } from './TimelineSorter';

interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

interface QuizContentProps {
	quizId: string;
	quiz: {
		title: string;
		subject: string;
		session: string;
		year: number;
		questions: AnyQuizQuestion[];
	};
	currentQuestionIndex: number;
	selectedOption: string | null;
	answerText: string;
	isChecked: boolean;
	isCorrect: boolean | null;
	elapsedSeconds: number;
	showHint: boolean;
	score: number;
	mode: 'test' | 'practice';
	currentSubject: string;
	showSubjectSelector: boolean;
	adaptiveHint: string | null;
	showStruggleAlert: boolean;
	currentStruggleCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
	correctCount: number;
	incorrectCount: number;
	isCompleting: boolean;
	isGrading: boolean;
	shortAnswerFeedback: string;
	onSelectOption: (id: string | null) => void;
	onAnswerTextChange: (text: string) => void;
	onToggleHint: () => void;
	onCheck: () => void;
	onModeChange: (mode: 'test' | 'practice') => void;
	onShowSubjectSelector: () => void;
	onSubjectChange: (subject: string) => void;
	onCloseSubjectSelector: () => void;
	onDismissStruggle: () => void;
	onExit: () => void;
	onNavigateToQuestion?: (index: number) => void;
	interactiveAnswer: Record<string, string> | string[] | null;
	onInteractiveChange: (answer: Record<string, string> | string[] | null) => void;
	confidenceLevel: ConfidenceLevel | null;
	onSetConfidence: (level: ConfidenceLevel) => void;
	isConfidentError: boolean;
	onDismissConfidentError: () => void;
}

function isShortAnswer(q: AnyQuizQuestion): q is ShortAnswerQuestion {
	return q.type === 'shortAnswer';
}

function isDiagramFill(q: AnyQuizQuestion): q is DiagramFillQuestion {
	return q.type === 'diagramFill';
}

function isChronologicalSort(q: AnyQuizQuestion): q is ChronologicalSortQuestion {
	return q.type === 'chronologicalSort';
}

const questionVariants = {
	initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
	animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, y: -10, filter: 'blur(3px)' },
};

const questionTransition = {
	duration: DURATION.normal,
	ease: EASING.easeOut,
};

export function QuizContent({
	quizId,
	quiz,
	currentQuestionIndex,
	selectedOption,
	answerText,
	isChecked,
	isCorrect,
	elapsedSeconds,
	showHint,
	mode,
	currentSubject,
	showSubjectSelector,
	adaptiveHint,
	showStruggleAlert,
	currentStruggleCount,
	difficulty,
	correctCount,
	incorrectCount,
	isCompleting,
	isGrading,
	shortAnswerFeedback,
	onSelectOption,
	onAnswerTextChange,
	onToggleHint,
	onCheck,
	onModeChange,
	onShowSubjectSelector,
	onSubjectChange,
	onCloseSubjectSelector,
	onDismissStruggle,
	onExit,
	onNavigateToQuestion,
	interactiveAnswer,
	onInteractiveChange,
	confidenceLevel,
	onSetConfidence,
	isConfidentError,
	onDismissConfidentError,
}: QuizContentProps) {
	const {
		showMathKeyboard,
		setShowMathKeyboard,
		mathInput,
		cursorPos,
		handleMathKeyClick,
		handleMathDelete,
		moveCursor,
	} = useMathKeyboard();

	const [showReviewPanel, setShowReviewPanel] = useState(false);

	const { currentDifficulty, adjustDifficulty, getCurrentMetrics, resetMetrics } =
		useAdaptiveDifficulty();

	const [difficultyRecommendation, setDifficultyRecommendation] = useState<string | undefined>();

	const { toggleFlag, getFlaggedQuestions, isFlagged, clearFlags } = useQuestionFlagStore();

	const { profile: userProfile } = useUserLearningProfileStore();

	const currentQuestion = quiz.questions[currentQuestionIndex];
	const isMCQ = !currentQuestion.type || currentQuestion.type === 'mcq';
	const questionKey = currentQuestion.id;

	const flaggedCount = getFlaggedQuestions(quizId).length;
	const currentQuestionFlagged = isFlagged(quizId, questionKey);

	const handleToggleFlag = useCallback(() => {
		toggleFlag(quizId, questionKey);
	}, [quizId, questionKey, toggleFlag]);

	const handleShowReviewPanel = useCallback(() => {
		setShowReviewPanel(true);
	}, []);

	const handleCloseReviewPanel = useCallback(() => {
		setShowReviewPanel(false);
	}, []);

	const handleNavigateToQuestion = useCallback(
		(index: number) => {
			setShowReviewPanel(false);
			onNavigateToQuestion?.(index);
		},
		[onNavigateToQuestion]
	);

	const handleClearAllFlags = useCallback(() => {
		clearFlags(quizId);
	}, [quizId, clearFlags]);

	const flaggedQuestions = getFlaggedQuestions(quizId)
		.map((qId) => {
			const q = quiz.questions.find((que) => que.id === qId);
			return q
				? {
						id: q.id,
						index: quiz.questions.indexOf(q),
						question: q.question,
					}
				: null;
		})
		.filter(Boolean) as Array<{ id: string; index: number; question: string }>;

	const options: QuestionOption[] =
		isMCQ && 'options' in currentQuestion
			? currentQuestion.options.map((o) => ({
					id: o.id,
					label: o.text,
					isCorrect: o.id === currentQuestion.correctAnswer,
				}))
			: [];

	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
	const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
	const showMathKeyboardForSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(
		currentSubject
	);
	const correctAnswerText =
		isMCQ && 'options' in currentQuestion
			? currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)?.text || ''
			: isShortAnswer(currentQuestion)
				? currentQuestion.correctAnswer
				: '';
	const selectedAnswerText =
		selectedOption && isMCQ && 'options' in currentQuestion
			? currentQuestion.options.find((o) => o.id === selectedOption)?.text || null
			: null;

	const hasAnswer = isDiagramFill(currentQuestion)
		? interactiveAnswer !== null &&
			Object.keys(interactiveAnswer as Record<string, string>).length > 0
		: isChronologicalSort(currentQuestion)
			? interactiveAnswer !== null && (interactiveAnswer as string[]).length > 0
			: answerText.trim().length > 0;

	const metricsRef = useRef(false);
	useEffect(() => {
		if (!metricsRef.current) {
			resetMetrics();
			metricsRef.current = true;
		}
	}, [resetMetrics]);

	useEffect(() => {
		if (isChecked && isCorrect !== null) {
			const result = adjustDifficulty(isCorrect);
			setDifficultyRecommendation(result.recommendation);
			if (result.newDifficulty !== currentDifficulty) {
				setTimeout(() => setDifficultyRecommendation(undefined), 3000);
			}
		}
	}, [isChecked, isCorrect, adjustDifficulty, currentDifficulty]);

	return (
		<>
			<QuizToolbar
				mode={mode}
				currentSubject={currentSubject}
				onExit={onExit}
				onModeChange={onModeChange}
				onShowSubjectSelector={onShowSubjectSelector}
				flaggedCount={flaggedCount}
				onShowReviewPanel={handleShowReviewPanel}
			/>

			<QuizTimer elapsedSeconds={elapsedSeconds} />

			<QuizProgressDashboard
				totalQuestions={quiz.questions.length}
				currentQuestion={currentQuestionIndex + 1}
				correctCount={correctCount}
				incorrectCount={incorrectCount}
				elapsedTime={formatTime(elapsedSeconds)}
				difficulty={difficulty}
			/>

			<div className="mb-4">
				<DifficultyIndicator
					currentLevel={currentDifficulty}
					correct={getCurrentMetrics().correct}
					incorrect={getCurrentMetrics().incorrect}
					streakCorrect={getCurrentMetrics().streakCorrect}
					streakIncorrect={getCurrentMetrics().streakIncorrect}
					recommendation={difficultyRecommendation}
					showStats={true}
				/>
			</div>

			<QuizProgress
				currentQuestion={currentQuestionIndex + 1}
				totalQuestions={quiz.questions.length}
				difficulty={currentQuestion.difficulty}
				progressPercent={progressPercent}
			/>

			<div className="h-[calc(100vh-380px)] sm:h-full no-scrollbar pr-4">
				<div className="space-y-8 pb-40">
					<AnimatePresence mode="wait" initial={false}>
						{isMCQ ? (
							<m.div
								key={`mcq-${questionKey}`}
								variants={questionVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={questionTransition}
							>
								<QuestionCard
									question={currentQuestion.question}
									questionKey={questionKey}
									options={options}
									selectedOption={selectedOption}
									isChecked={isChecked}
									onSelect={onSelectOption}
									diagram={'diagram' in currentQuestion ? currentQuestion.diagram : undefined}
									isFlagged={currentQuestionFlagged}
									onToggleFlag={handleToggleFlag}
									confidenceLevel={confidenceLevel}
									onSetConfidence={onSetConfidence}
									isConfidentError={isConfidentError}
									correctAnswerText={correctAnswerText}
									selectedAnswerText={selectedAnswerText ?? ''}
									subject={currentSubject}
									topic={currentQuestion.topic}
									onDismissConfidentError={onDismissConfidentError}
								/>
							</m.div>
						) : isShortAnswer(currentQuestion) ? (
							<m.div
								key={`sa-${questionKey}`}
								variants={questionVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={questionTransition}
								className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-10"
							>
								<div className="mb-6">
									<h2 className="text-xl font-question leading-tight text-foreground">
										{currentQuestion.question}
									</h2>
								</div>
								<ShortAnswerInput
									value={answerText}
									onChange={onAnswerTextChange}
									isChecked={isChecked}
									isCorrect={isCorrect}
									disabled={isCompleting}
								/>
								{!isChecked && (
									<div className="mt-3">
										<ConfidenceSelector
											value={confidenceLevel}
											onChange={onSetConfidence}
											disabled={isChecked}
										/>
									</div>
								)}
								<AnimatePresence>
									{isChecked && isConfidentError && (
										<MisconceptionDialogue
											questionText={currentQuestion.question}
											userAnswer={answerText}
											correctAnswer={correctAnswerText}
											subject={currentSubject}
											topic={currentQuestion.topic}
											onDismiss={onDismissConfidentError}
										/>
									)}
								</AnimatePresence>
							</m.div>
						) : isDiagramFill(currentQuestion) ? (
							<m.div
								key={`df-${questionKey}`}
								variants={questionVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={questionTransition}
								className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-10"
							>
								<div className="mb-6">
									<h2 className="text-xl font-question leading-tight text-foreground">
										{currentQuestion.question}
									</h2>
								</div>
								<DraggableDiagram
									zones={currentQuestion.zones}
									labels={currentQuestion.labels}
									imageUrl={currentQuestion.imageUrl}
									answer={currentQuestion.correctAnswer}
									isChecked={isChecked}
									onChange={(mapping) => onInteractiveChange(mapping)}
								/>
							</m.div>
						) : isChronologicalSort(currentQuestion) ? (
							<m.div
								key={`cs-${questionKey}`}
								variants={questionVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={questionTransition}
								className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-10"
							>
								<div className="mb-6">
									<h2 className="text-xl font-question leading-tight text-foreground">
										{currentQuestion.question}
									</h2>
								</div>
								<TimelineSorter
									events={currentQuestion.events}
									correctOrder={currentQuestion.correctOrder}
									isChecked={isChecked}
									onChange={(order) => onInteractiveChange(order)}
								/>
							</m.div>
						) : null}
					</AnimatePresence>

					{mode === 'practice' && showMathKeyboardForSubject && (
						<MathInputField input={mathInput} cursorPos={cursorPos} onDelete={handleMathDelete} />
					)}

					<AnimatePresence mode="wait" initial={false}>
						<m.div
							key={`extras-${questionKey}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: DURATION.quick }}
						>
							<AIExplanation
								question={currentQuestion.question}
								correctAnswer={correctAnswerText}
								userProfile={userProfile}
								subject={currentSubject}
								topic={currentQuestion.topic}
								enableRealTime={true}
								onRealTimeExplanation={(_explanation, _tips) => {
									// Update user profile with new interaction
									if (userProfile) {
										const store = useUserLearningProfileStore.getState();
										store.addInteraction({
											subject: currentSubject,
											topic: currentQuestion.topic,
											action: 'explanation',
											timestamp: new Date(),
											performance: undefined, // No performance score for explanation
											duration: 0, // Could track time spent reading explanation
										});
									}
								}}
							/>

							<QuestionExtras
								adaptiveHint={adaptiveHint}
								showStruggleAlert={showStruggleAlert}
								currentStruggleCount={currentStruggleCount}
								currentTopic={currentQuestion.topic}
								isChecked={isChecked}
								onDismissStruggle={onDismissStruggle}
							/>
						</m.div>
					</AnimatePresence>

					<AnimatePresence mode="wait" initial={false}>
						{isChecked && isMCQ && (
							<m.div
								key={`breakdown-${questionKey}`}
								initial={{ opacity: 0, y: 12, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -8, scale: 0.98 }}
								transition={{ duration: DURATION.normal, ease: EASING.smooth }}
							>
								<AnswerBreakdown
									correctAnswer={correctAnswerText}
									selectedAnswer={selectedAnswerText}
									isCorrect={isCorrect ?? false}
									topic={currentQuestion.topic}
									question={currentQuestion.question}
									subject={currentSubject}
								/>
							</m.div>
						)}

						{isChecked && isShortAnswer(currentQuestion) && (
							<m.div
								key={`sa-feedback-${questionKey}`}
								initial={{ opacity: 0, y: 12, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -8, scale: 0.98 }}
								transition={{ duration: DURATION.normal, ease: EASING.smooth }}
							>
								<ShortAnswerFeedback
									isCorrect={isCorrect ?? false}
									feedback={shortAnswerFeedback}
									correctAnswer={correctAnswerText}
								/>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="fixed bottom-20 left-0 right-0 flex justify-center z-30 pointer-events-none">
				{mode === 'practice' && showMathKeyboardForSubject && (
					<MathKeyboard
						isOpen={showMathKeyboard}
						onOpenChange={setShowMathKeyboard}
						onKeyClick={handleMathKeyClick}
						onDelete={handleMathDelete}
						moveCursor={moveCursor}
					/>
				)}
			</div>

			<QuizFooter
				isChecked={isChecked}
				isCorrect={isCorrect}
				selectedOption={selectedOption}
				showHint={showHint}
				onToggleHint={onToggleHint}
				onCheck={onCheck}
				onExit={onExit}
				disabled={isCompleting}
				isGrading={isGrading}
				hasAnswer={
					isMCQ
						? selectedOption !== null
						: isDiagramFill(currentQuestion) || isChronologicalSort(currentQuestion)
							? hasAnswer
							: hasAnswer
				}
			/>

			{showSubjectSelector && (
				<SubjectSelector
					currentSubject={currentSubject}
					onSelect={onSubjectChange}
					onClose={onCloseSubjectSelector}
				/>
			)}

			<FlaggedReviewPanel
				flaggedQuestions={flaggedQuestions}
				onNavigateToQuestion={handleNavigateToQuestion}
				onClearAll={handleClearAllFlags}
				isOpen={showReviewPanel}
				onClose={handleCloseReviewPanel}
			/>
		</>
	);
}

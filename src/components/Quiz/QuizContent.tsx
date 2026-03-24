'use client';

import { MathInputField } from '@/components/MathKeyboard';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { AnswerBreakdown } from '@/components/Quiz/AnswerBreakdown';
import { MathKeyboard } from '@/components/Quiz/MathKeyboard';
import { QuestionCard } from '@/components/Quiz/QuestionCard';
import { QuestionExtras } from '@/components/Quiz/QuestionExtras';
import { QuizFooter } from '@/components/Quiz/QuizFooter';
import { QuizProgress } from '@/components/Quiz/QuizProgress';
import { QuizProgressDashboard } from '@/components/Quiz/QuizProgressDashboard';
import { ShortAnswerInput } from '@/components/Quiz/ShortAnswerInput';
import { SubjectSelector } from '@/components/Quiz/SubjectSelector';
import type { AnyQuizQuestion, ShortAnswerQuestion } from '@/constants/quiz/types';
import { useMathKeyboard } from '@/hooks/use-math-keyboard';
import { QuizTimer } from './QuizTimer';
import { QuizToolbar } from './QuizToolbar';
import { ShortAnswerFeedback } from './ShortAnswerFeedback';

interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

interface QuizContentProps {
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
}

function isShortAnswer(q: AnyQuizQuestion): q is ShortAnswerQuestion {
	return q.type === 'shortAnswer';
}

export function QuizContent({
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

	const currentQuestion = quiz.questions[currentQuestionIndex];
	const isMCQ = !currentQuestion.type || currentQuestion.type === 'mcq';

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

	const hasAnswer = answerText.trim().length > 0;

	return (
		<>
			<QuizToolbar
				mode={mode}
				currentSubject={currentSubject}
				onExit={onExit}
				onModeChange={onModeChange}
				onShowSubjectSelector={onShowSubjectSelector}
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

			<QuizProgress
				currentQuestion={currentQuestionIndex + 1}
				totalQuestions={quiz.questions.length}
				difficulty={currentQuestion.difficulty}
				progressPercent={progressPercent}
			/>

			<div className="h-[calc(100vh-380px)] sm:h-full no-scrollbar pr-4">
				<div className="space-y-8 pb-40">
					{isMCQ ? (
						<QuestionCard
							question={currentQuestion.question}
							options={options}
							selectedOption={selectedOption}
							isChecked={isChecked}
							onSelect={onSelectOption}
							diagram={'diagram' in currentQuestion ? currentQuestion.diagram : undefined}
						/>
					) : isShortAnswer(currentQuestion) ? (
						<div className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-10">
							<div className="mb-6">
								<h2 className="text-xl font-semibold leading-tight text-foreground">
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
						</div>
					) : null}

					{mode === 'practice' && showMathKeyboardForSubject && (
						<MathInputField input={mathInput} cursorPos={cursorPos} onDelete={handleMathDelete} />
					)}

					<AIExplanation question={currentQuestion.question} correctAnswer={correctAnswerText} />

					<QuestionExtras
						adaptiveHint={adaptiveHint}
						showStruggleAlert={showStruggleAlert}
						currentStruggleCount={currentStruggleCount}
						currentTopic={currentQuestion.topic}
						isChecked={isChecked}
						onDismissStruggle={onDismissStruggle}
					/>

					{isChecked && isMCQ && (
						<AnswerBreakdown
							correctAnswer={correctAnswerText}
							selectedAnswer={selectedAnswerText}
							isCorrect={isCorrect ?? false}
							topic={currentQuestion.topic}
						/>
					)}

					{isChecked && isShortAnswer(currentQuestion) && (
						<ShortAnswerFeedback
							isCorrect={isCorrect ?? false}
							feedback={shortAnswerFeedback}
							correctAnswer={correctAnswerText}
						/>
					)}
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
				hasAnswer={isMCQ ? selectedOption !== null : hasAnswer}
			/>

			{showSubjectSelector && (
				<SubjectSelector
					currentSubject={currentSubject}
					onSelect={onSubjectChange}
					onClose={onCloseSubjectSelector}
				/>
			)}
		</>
	);
}

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
import { SubjectSelector } from '@/components/Quiz/SubjectSelector';
import { Button } from '@/components/ui/button';
import { useMathKeyboard } from '@/hooks/use-math-keyboard';

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
		questions: Array<{
			question: string;
			options: Array<{ id: string; text: string }>;
			correctAnswer: string;
			difficulty: string;
			topic: string;
			diagram?: string;
		}>;
	};
	currentQuestionIndex: number;
	selectedOption: string | null;
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
	onSelectOption: (id: string | null) => void;
	onToggleHint: () => void;
	onCheck: () => void;
	onModeChange: (mode: 'test' | 'practice') => void;
	onShowSubjectSelector: () => void;
	onSubjectChange: (subject: string) => void;
	onCloseSubjectSelector: () => void;
	onDismissStruggle: () => void;
	onExit: () => void;
}

export function QuizContent({
	quiz,
	currentQuestionIndex,
	selectedOption,
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
	onSelectOption,
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
	const options: QuestionOption[] = currentQuestion.options.map((o) => ({
		id: o.id,
		label: o.text,
		isCorrect: o.id === currentQuestion.correctAnswer,
	}));

	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
	const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
	const showMathKeyboardForSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(
		currentSubject
	);
	const correctAnswerText =
		currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)?.text || '';
	const selectedAnswerText = selectedOption
		? currentQuestion.options.find((o) => o.id === selectedOption)?.text || null
		: null;

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full"
					onClick={onExit}
					aria-label="Exit quiz"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</Button>
				<div className="flex gap-2">
					<Button
						variant={mode === 'test' ? 'default' : 'outline'}
						size="sm"
						className="rounded-full"
						onClick={() => onModeChange('test')}
					>
						Test
					</Button>
					<Button
						variant={mode === 'practice' ? 'default' : 'outline'}
						size="sm"
						className="rounded-full"
						onClick={() => onModeChange('practice')}
					>
						Practice
					</Button>
				</div>
				<Button variant="ghost" size="sm" className="rounded-full" onClick={onShowSubjectSelector}>
					{currentSubject}
				</Button>
			</div>

			<div className="flex items-center justify-between mb-8">
				<div className="w-14 h-14 bg-subject-math-soft rounded-[1.5rem] flex items-center justify-center">
					<svg
						className="w-8 h-8 text-subject-math"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div className="px-4 py-2 bg-secondary rounded-full shadow-sm">
					<span className="font-mono font-black text-foreground tabular-nums">
						{formatTime(elapsedSeconds)}
					</span>
				</div>
			</div>

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
					<QuestionCard
						question={currentQuestion.question}
						options={options}
						selectedOption={selectedOption}
						isChecked={isChecked}
						onSelect={onSelectOption}
						diagram={currentQuestion.diagram}
					/>

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

					{isChecked && (
						<AnswerBreakdown
							correctAnswer={correctAnswerText}
							selectedAnswer={selectedAnswerText}
							isCorrect={isCorrect ?? false}
							topic={currentQuestion.topic}
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

'use client';

import {
	ArrowLeft01Icon,
	ArrowLeft02Icon,
	ArrowRight01Icon,
	Delete01Icon,
	KeyboardIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getAdaptiveDifficultyServer, recordQuestionAttempt } from '@/actions/spaced-repetition';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { AnswerBreakdown } from '@/components/Quiz/AnswerBreakdown';
import { QuestionCard, type QuestionOption } from '@/components/Quiz/QuestionCardV2';
import { QuizActions } from '@/components/Quiz/QuizActionsV2';
import { QuizHeader } from '@/components/Quiz/QuizHeaderV2';
import { QuizProgressDashboard } from '@/components/Quiz/QuizProgressDashboard';
import { StruggleAlert } from '@/components/StudyBuddy/StruggleAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { isQuotaError } from '@/lib/ai/quota-error';
import { cn } from '@/lib/utils';
import {
	getAdaptiveHint,
	getStrugglingConcepts,
	recordStruggle,
	updateConfidence,
} from '@/services/buddyActions';

interface QuizProps {
	quizId?: string;
}

const SUBJECTS = [
	'Mathematics',
	'Physics',
	'Chemistry',
	'English',
	'History',
	'Economics',
	'Accounting',
];

const SYMBOL_SETS = {
	calculus: [
		{ label: '□/□', value: '/' },
		{ label: '√□', value: 'sqrt(' },
		{ label: 'x^□', value: '^' },
		{ label: '()', value: '(' },
		{ label: '∫', value: '∫' },
		{ label: 'd/dx', value: 'd/dx' },
		{ label: 'lim', value: 'lim' },
		{ label: 'Σ', value: 'Σ' },
		{ label: '∞', value: '∞' },
		{ label: 'π', value: 'π' },
		{ label: 'e', value: 'e' },
	],
	basic: 'abcdefghijklm'.split('').map((s) => ({ label: s, value: s })),
	arithmetic: ['+', '-', '×', '÷', '=', '<', '>', '±', '%'].map((s) => ({ label: s, value: s })),
	greek: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'ω', 'Δ'].map((s) => ({
		label: s,
		value: s,
	})),
};

const playClickSound = () => {
	try {
		const audioCtx = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
		)();
		const oscillator = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
		gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime + 0.1);
	} catch {
		// Audio not supported - silently fail
	}
};

export default function Quiz({ quizId: initialQuizId }: QuizProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const urlQuizId = searchParams.get('id');
	const quizId = initialQuizId || urlQuizId || 'math-p1-2023-nov';

	const startTimeRef = useRef<number>(Date.now());
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const [score, setScore] = useState(0);
	const [mode, setMode] = useState<'test' | 'practice'>('test');
	const [showSubjectSelector, setShowSubjectSelector] = useState(false);
	const [currentSubject, setCurrentSubject] = useState<string>('');

	// Math keyboard state
	const [showMathKeyboard, setShowMathKeyboard] = useState(false);
	const [mathInput, setMathInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);

	// Study Buddy state
	const [adaptiveHint, setAdaptiveHint] = useState<string | null>(null);
	const [showStruggleAlert, setShowStruggleAlert] = useState(false);
	const [currentStruggleCount, setCurrentStruggleCount] = useState(0);

	// Quiz enhancements state
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);

	const { completeQuiz, isCompleting } = useQuizCompletion();

	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[currentQuestionIndex];

	// Initialize subject from quiz
	useEffect(() => {
		if (quiz?.subject && !currentSubject) {
			setCurrentSubject(quiz.subject);
		}
	}, [quiz, currentSubject]);

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Load adaptive hint when question changes
	useEffect(() => {
		async function loadHint() {
			if (!currentQuestion?.topic) return;
			try {
				const hint = await getAdaptiveHint(currentQuestion.topic);
				setAdaptiveHint(hint);
			} catch (error) {
				if (isQuotaError(error)) {
					triggerQuotaError();
				}
				console.debug('Failed to load hint:', error);
			}
		}
		loadHint();
	}, [currentQuestion?.topic, triggerQuotaError]);

	// Reset struggle alert when moving to a new question
	useEffect(() => {
		setShowStruggleAlert(false);
	});

	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

	const options: QuestionOption[] = currentQuestion.options.map((o) => ({
		id: o.id,
		label: o.text,
		isCorrect: o.id === currentQuestion.correctAnswer,
	}));

	const handleCheck = async () => {
		if (isChecked) {
			if (currentQuestionIndex < quiz.questions.length - 1) {
				setCurrentQuestionIndex((prev) => prev + 1);
				setSelectedOption(null);
				setIsChecked(false);
				setIsCorrect(null);
				setShowHint(false);
				setMathInput('');
			} else {
				// Quiz Complete
				const finalScore = score + (isCorrect ? 1 : 0);
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

		// Track confidence and struggles with Study Buddy
		if (currentQuestion?.topic) {
			try {
				await updateConfidence(currentQuestion.topic, currentSubject, correct);

				// Record for spaced repetition
				await recordQuestionAttempt(currentQuestion.id, currentQuestion.topic, correct);

				// Update difficulty based on performance
				const newDifficulty = await getAdaptiveDifficultyServer();
				setDifficulty(newDifficulty);

				if (!correct) {
					await recordStruggle(currentQuestion.topic);
					// Check if should show struggle alert (2+ struggles)
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
	};

	const handleSubjectChange = (subject: string) => {
		setCurrentSubject(subject);
		const firstQuiz = Object.entries(QUIZ_DATA).find(([, q]) => q.subject === subject);
		if (firstQuiz) {
			router.push(`/quiz?id=${firstQuiz[0]}`);
		}
		setShowSubjectSelector(false);
	};

	// Math keyboard handlers
	const handleMathKeyClick = (val: string) => {
		playClickSound();
		const newInput = mathInput.slice(0, cursorPos) + val + mathInput.slice(cursorPos);
		setMathInput(newInput);
		setCursorPos((prev) => prev + val.length);
	};

	const handleMathDelete = () => {
		playClickSound();
		if (cursorPos > 0) {
			const newInput = mathInput.slice(0, cursorPos - 1) + mathInput.slice(cursorPos);
			setMathInput(newInput);
			setCursorPos((prev) => prev - 1);
		}
	};

	const moveCursor = (dir: 'left' | 'right') => {
		playClickSound();
		if (dir === 'left' && cursorPos > 0) setCursorPos((prev) => prev - 1);
		if (dir === 'right' && cursorPos < mathInput.length) setCursorPos((prev) => prev + 1);
	};

	const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
	const showMathKeyboardForSubject =
		currentSubject === 'Mathematics' ||
		currentSubject === 'Physics' ||
		currentSubject === 'Chemistry';

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-between mb-6">
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full"
							onClick={() => router.push('/dashboard')}
						>
							<HugeiconsIcon icon={ArrowLeft02Icon} className="w-6 h-6" />
						</Button>
						<div className="flex gap-2">
							<Button
								variant={mode === 'test' ? 'default' : 'outline'}
								size="sm"
								className="rounded-full"
								onClick={() => setMode('test')}
							>
								Test
							</Button>
							<Button
								variant={mode === 'practice' ? 'default' : 'outline'}
								size="sm"
								className="rounded-full"
								onClick={() => setMode('practice')}
							>
								Practice
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="rounded-full"
							onClick={() => setShowSubjectSelector(true)}
						>
							{currentSubject}
						</Button>
					</div>

					<QuizHeader
						title={quiz.title}
						subtitle={`${quiz.subject} • ${quiz.session} ${quiz.year}`}
						elapsedTime={formatTime(elapsedSeconds)}
					/>

					<div className="mb-6">
						<QuizProgressDashboard
							totalQuestions={quiz.questions.length}
							currentQuestion={currentQuestionIndex + 1}
							correctCount={correctCount}
							incorrectCount={incorrectCount}
							elapsedTime={formatTime(elapsedSeconds)}
							difficulty={difficulty}
						/>
					</div>

					<div className="mb-8">
						<div className="flex justify-between items-center mb-2">
							<span className="text-[10px] font-medium text-muted-foreground">
								Question {currentQuestionIndex + 1} of {quiz.questions.length}
							</span>
							<Badge variant="secondary" className="text-[10px] font-medium rounded-full px-3">
								{currentQuestion.difficulty}
							</Badge>
						</div>
						<Progress value={progressPercent} className="h-2 rounded-full" />
					</div>

					<div className="h-[calc(100vh-380px)] sm:h-full no-scrollbar pr-4">
						<div className="space-y-8 pb-40">
							<QuestionCard
								question={currentQuestion.question}
								options={options}
								selectedOption={selectedOption}
								isChecked={isChecked}
								onSelect={setSelectedOption}
								diagram={currentQuestion.diagram}
							/>

							{mode === 'practice' && showMathKeyboardForSubject && (
								<MathInputField
									input={mathInput}
									cursorPos={cursorPos}
									onDelete={handleMathDelete}
								/>
							)}

							<AIExplanation
								question={currentQuestion.question}
								correctAnswer={
									currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)?.text
								}
							/>

							{adaptiveHint && !isChecked && (
								<Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
									<p className="text-sm text-amber-800 dark:text-amber-200">
										<strong>Hint:</strong> {adaptiveHint}
									</p>
								</Card>
							)}

							{showStruggleAlert && currentQuestion?.topic && (
								<StruggleAlert
									concept={currentQuestion.topic}
									struggleCount={currentStruggleCount}
									onGetHelp={() => setShowStruggleAlert(false)}
								/>
							)}

							{isChecked && (
								<AnswerBreakdown
									correctAnswer={
										currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)
											?.text || ''
									}
									selectedAnswer={
										selectedOption
											? currentQuestion.options.find((o) => o.id === selectedOption)?.text || null
											: null
									}
									isCorrect={isCorrect ?? false}
									topic={currentQuestion.topic}
								/>
							)}
						</div>
					</div>

					<div className="fixed bottom-20 left-0 right-0 flex justify-center z-30 pointer-events-none">
						{mode === 'practice' && showMathKeyboardForSubject && (
							<Sheet open={showMathKeyboard} onOpenChange={setShowMathKeyboard}>
								<SheetTrigger asChild>
									<Button className="bg-card text-foreground shadow-2xl rounded-2xl h-12 px-6 border pointer-events-auto hover:bg-zinc-50 transition-all gap-2">
										<HugeiconsIcon icon={KeyboardIcon} className="w-4 h-4" />
										<span className="font-bold text-sm">Calculator</span>
									</Button>
								</SheetTrigger>
								<SheetContent
									side="bottom"
									className="h-[400px] rounded-t-[2rem] p-0 border-none bg-muted dark:bg-background"
								>
									<SheetTitle>
										<VisuallyHidden>Calculator</VisuallyHidden>
									</SheetTitle>
									<MathKeyboardContent
										onKeyClick={handleMathKeyClick}
										onDelete={handleMathDelete}
										moveCursor={moveCursor}
									/>
								</SheetContent>
							</Sheet>
						)}
					</div>

					<QuizActions
						isChecked={isChecked}
						isCorrect={isCorrect}
						selectedOption={selectedOption}
						showHint={showHint}
						onToggleHint={() => setShowHint(!showHint)}
						onCheck={handleCheck}
						onExit={() => router.push('/dashboard')}
						disabled={isCompleting}
					/>
				</div>

				{/* Subject Selector Modal */}
				{showSubjectSelector && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<button
							type="button"
							className="absolute inset-0 bg-black/50 cursor-default"
							onClick={() => setShowSubjectSelector(false)}
							aria-label="Close modal"
						/>
						<Card className="w-full max-w-md p-6 bg-background relative z-10">
							<h3 className="text-lg font-bold mb-4">Select Subject</h3>
							<div className="grid grid-cols-2 gap-2">
								{SUBJECTS.map((subject) => (
									<Button
										key={subject}
										variant={currentSubject === subject ? 'default' : 'outline'}
										onClick={() => handleSubjectChange(subject)}
										className="rounded-xl"
									>
										{subject}
									</Button>
								))}
							</div>
						</Card>
					</div>
				)}
			</FocusContent>
		</div>
	);
}

function MathInputField({
	input,
	cursorPos,
	onDelete,
}: {
	input: string;
	cursorPos: number;
	onDelete: () => void;
}) {
	return (
		<Card className="p-4 bg-card border-none shadow-md rounded-2xl flex items-center gap-2">
			<div className="flex-1 min-h-[40px] flex items-center px-2 overflow-x-auto">
				<div className="text-lg font-serif text-foreground flex items-center flex-nowrap relative">
					{input.split('').map((char, i) => (
						<span key={i} className="relative whitespace-pre">
							{i === cursorPos && (
								<m.div
									initial={{ opacity: 0 }}
									animate={{ opacity: [1, 0] }}
									transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
									className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-orange-500"
								/>
							)}
							{char}
						</span>
					))}
					{cursorPos === input.length && (
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: [1, 0] }}
							transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
							className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-orange-500"
						/>
					)}
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="shrink-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
				onClick={onDelete}
			>
				<HugeiconsIcon icon={Delete01Icon} className="w-5 h-5" />
			</Button>
		</Card>
	);
}

function MathKeyboardContent({
	onKeyClick,
	onDelete,
	moveCursor,
}: {
	onKeyClick: (val: string) => void;
	onDelete: () => void;
	moveCursor: (dir: 'left' | 'right') => void;
}) {
	return (
		<>
			<div className="w-10 h-1 bg-muted-foreground/20 dark:bg-muted rounded-full mx-auto mt-3 mb-4" />
			<Tabs defaultValue="calculus" className="w-full flex flex-col h-full">
				<TabsList className="bg-transparent border-none w-full px-4 flex justify-between gap-0 h-12">
					{['basic', 'calculus', 'arithmetic', 'greek'].map((tab) => (
						<TabsTrigger
							key={tab}
							value={tab}
							className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-xs text-muted-foreground data-[state=active]:text-foreground"
						>
							{tab}
						</TabsTrigger>
					))}
				</TabsList>

				<div className="flex-1 px-3 py-4 overflow-auto">
					<AnimatePresence mode="wait">
						<TabsContent
							value="calculus"
							className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.calculus.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
							<CalcKey
								label={<HugeiconsIcon icon={Delete01Icon} className="w-5 h-5" />}
								onClick={onDelete}
								className="bg-secondary"
							/>
							<CalcKey
								label={<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />}
								onClick={() => moveCursor('left')}
								className="bg-secondary"
							/>
							<CalcKey
								label={<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />}
								onClick={() => moveCursor('right')}
								className="bg-secondary"
							/>
						</TabsContent>

						<TabsContent value="basic" className="grid grid-cols-4 gap-2 mt-0 h-full content-start">
							{SYMBOL_SETS.basic.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>

						<TabsContent
							value="arithmetic"
							className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.arithmetic.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>

						<TabsContent value="greek" className="grid grid-cols-4 gap-2 mt-0 h-full content-start">
							{SYMBOL_SETS.greek.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>
					</AnimatePresence>
				</div>
			</Tabs>
		</>
	);
}

function CalcKey({
	label,
	onClick,
	className = '',
}: {
	label: React.ReactNode;
	onClick: () => void;
	className?: string;
}) {
	return (
		<m.button
			whileTap={{ scale: 0.9 }}
			transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			onClick={onClick}
			className={cn(
				'h-12 flex items-center justify-center bg-card rounded-xl shadow-sm text-sm font-bold border border-transparent hover:border-amber-500/30 transition-colors',
				className
			)}
		>
			{label}
		</m.button>
	);
}

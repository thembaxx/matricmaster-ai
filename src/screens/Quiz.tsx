'use client';

import { Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { AIExplanation } from '@/components/Quiz/AIExplanation';
import { QuestionCard, type QuestionOption } from '@/components/Quiz/QuestionCardV2';
import { QuizActions } from '@/components/Quiz/QuizActionsV2';
import { QuizHeader } from '@/components/Quiz/QuizHeaderV2';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { cn } from '@/lib/utils';

interface QuizProps {
	quizId?: string;
}

export default function Quiz({ quizId = 'math-p1-2023-nov' }: QuizProps) {
	const router = useRouter();
	const startTimeRef = useRef<number>(Date.now());
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const [score, setScore] = useState(0);

	const { completeQuiz, isCompleting } = useQuizCompletion();

	const quiz = QUIZ_DATA[quizId] || QUIZ_DATA['math-p1-2023-nov'];
	const currentQuestion = quiz.questions[currentQuestionIndex];

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

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
					sessionType: 'test',
				});
				router.push('/lesson-complete');
			}
			return;
		}

		const correct = options.find((o) => o.id === selectedOption)?.isCorrect || false;
		setIsCorrect(correct);
		if (correct) setScore((prev) => prev + 1);
		setIsChecked(true);
	};

	const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<QuizHeader
						title={quiz.title}
						subtitle={`${quiz.subject} • ${quiz.session} ${quiz.year}`}
						elapsedTime={formatTime(elapsedSeconds)}
					/>

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

					<ScrollArea className="h-[calc(100vh-320px)] no-scrollbar pr-4">
						<div className="space-y-8 pb-32">
							<QuestionCard
								question={currentQuestion.question}
								options={options}
								selectedOption={selectedOption}
								isChecked={isChecked}
								onSelect={setSelectedOption}
								diagram={currentQuestion.diagram}
							/>

							<AIExplanation
								question={currentQuestion.question}
								correctAnswer={
									currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)?.text
								}
							/>

							{isChecked && (
								<m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
									<Card
										className={cn(
											'p-6 rounded-[2rem] border-2',
											isCorrect
												? 'bg-success/10 border-success/30'
												: 'bg-destructive/10 border-destructive/30'
										)}
									>
										<div className="flex gap-4">
											<div
												className={cn(
													'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
													isCorrect ? 'bg-success text-white' : 'bg-destructive text-white'
												)}
											>
												<HugeiconsIcon
													icon={isCorrect ? CheckmarkCircle02Icon : Cancel01Icon}
													className="w-6 h-6"
												/>
											</div>
											<div>
												<h4 className="font-semibold text-sm">
													{isCorrect ? 'Brilliant!' : 'Not quite right'}
												</h4>
												<p className="text-sm font-medium opacity-80 mt-1">
													{currentQuestion.hint}
												</p>
											</div>
										</div>
									</Card>
								</m.div>
							)}
						</div>
					</ScrollArea>

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
			</FocusContent>
		</div>
	);
}

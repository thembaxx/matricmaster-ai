'use client';

import { ArrowLeft01Icon as ArrowLeft, ChartPin01Icon as TrendUp } from 'hugeicons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ExpertExplanationCard } from '@/components/Tutor/ExpertExplanationCard';
import {
	getSubjectColor,
	MobileQuizFooter,
	QuizHintCard,
	QuizQuestionCard,
	QuizResultFeedback,
	SubjectFilterPills,
} from '@/components/Quiz';
import { Button } from '@/components/ui/button';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { getExplanation } from '@/services/geminiService';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

export default function InteractiveQuiz({ initialId }: { initialId?: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const paperId = initialId || searchParams.get('id');

	const allSubjects = Object.values(QUIZ_DATA).map((q) => q.subject);
	const uniqueSubjects = Array.from(new Set(allSubjects));

	const [quiz, setQuiz] = useState(QUIZ_DATA['phys-p1-2025-may']);
	const [selectedSubject, setSelectedSubject] = useState<string>(quiz.subject);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [score, setScore] = useState(0);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const startTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (paperId && QUIZ_DATA[paperId]) {
			setQuiz(QUIZ_DATA[paperId]);
			setSelectedSubject(QUIZ_DATA[paperId].subject);
		}
	}, [paperId]);

	const handleSubjectChange = (subject: string) => {
		setSelectedSubject(subject);
		const firstQuizOfSubject = Object.entries(QUIZ_DATA).find(
			([_, quizData]) => quizData.subject === subject
		);
		if (firstQuizOfSubject) {
			setQuiz(firstQuizOfSubject[1]);
			setCurrentQuestionIndex(0);
			setSelectedAnswer(null);
			setShowResult(false);
			setAiExplanation(null);
		}
	};

	const currentQuestion = quiz.questions[currentQuestionIndex];
	const colors = getSubjectColor(quiz.subject);
	const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const explanation = await getExplanation(quiz.subject, currentQuestion.question);
			setAiExplanation(explanation ?? "I'm sorry, I couldn't generate an explanation.");
		} catch (error) {
			console.error('Failed to get expert explanation:', error);
			setAiExplanation("Sorry, I couldn't generate an explanation right now.");
		} finally {
			setIsExplaining(false);
		}
	};

	const handleCheckAnswer = () => {
		if (!selectedAnswer) return;
		const correct = selectedAnswer === currentQuestion.correctAnswer;
		setIsCorrect(correct);
		setShowResult(true);
		if (correct) setScore((prev) => prev + 1);
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowResult(false);
			setAiExplanation(null);
		} else {
			const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
			useQuizResultStore.getState().save({
				correctAnswers: score,
				totalQuestions: quiz.questions.length,
				durationSeconds,
				accuracy: Math.round((score / quiz.questions.length) * 100),
				subjectName: quiz.subject,
				difficulty: 'medium',
				completedAt: new Date(),
			});
			router.push('/lesson-complete');
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (!currentQuestion) return null;

	return (
		<div className="fixed inset-0 flex flex-col w-full min-w-0 bg-background overflow-hidden">
			<header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 ios-glass sticky top-0 z-30 shrink-0 border-b border-border/10">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-3 sm:gap-4 mb-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="rounded-full h-10 w-10 sm:h-11 sm:w-11"
							aria-label="Go back"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-bold text-muted-foreground">
									Question {currentQuestionIndex + 1} of {quiz.questions.length}
								</span>
								<div className="flex items-center gap-2">
									{score > 0 && (
										<span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
											Score: {score}
										</span>
									)}
									<span className="text-xs text-muted-foreground">
										{formatTime(elapsedSeconds)}
									</span>
								</div>
							</div>
							<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
								<div
									className={`h-full transition-all duration-500 ${colors.bg}`}
									style={{ width: `${progress}%` }}
								/>
							</div>
							<span className={`text-[10px] font-bold mt-1 block ${colors.text}`}>
								{currentQuestion.topic}
							</span>
						</div>
					</div>

					<SubjectFilterPills
						subjects={uniqueSubjects}
						selectedSubject={selectedSubject}
						onSelect={handleSubjectChange}
						getColor={(s) => getSubjectColor(s)}
					/>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto w-full scroll-smooth">
				<main className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-2xl mx-auto w-full mobile-safe-bottom lg:pb-12">
					<div className="space-y-6 px-6">
						<div className="flex items-center gap-3">
							<TrendUp className={`w-5 h-5 ${colors.text}`} />
							<h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
								{quiz.title}
							</h3>
						</div>
						<h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
							{currentQuestion.question}
						</h2>

						<QuizQuestionCard
							options={currentQuestion.options}
							selectedAnswer={selectedAnswer}
							correctAnswer={currentQuestion.correctAnswer}
							showResult={showResult}
							colors={colors}
							onSelect={setSelectedAnswer}
						/>
					</div>

					<QuizResultFeedback
						showResult={showResult}
						isCorrect={isCorrect}
						correctAnswer={currentQuestion.correctAnswer}
					/>

					<QuizHintCard hint={currentQuestion.hint} />

					<ExpertExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject={quiz.subject}
					/>
				</main>
			</div>

			<MobileQuizFooter
				showCheckButton={!showResult}
				selectedAnswer={selectedAnswer}
				hasMoreQuestions={currentQuestionIndex < quiz.questions.length - 1}
				primaryColor={`${colors.bg} text-white`}
				shadowColor={colors.shadow}
				onCheck={handleCheckAnswer}
				onNext={handleNextQuestion}
			/>
		</div>
	);
}

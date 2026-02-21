'use client';

import { ArrowLeft, CheckCircle2, Clock, Lightbulb, SkipForward, TrendingUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AIExplanationCard } from '@/components/AI/AIExplanationCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QUIZ_DATA } from '@/constants/quiz-data';
import { saveQuizResult } from '@/lib/quiz-result-store';
import { getExplanation } from '@/services/geminiService';

const getSubjectColor = (subject: string) => {
	switch (subject) {
		case 'Physical Sciences':
			return {
				bg: 'bg-physics',
				text: 'text-physics',
				border: 'border-physics',
				bgSoft: 'bg-physics/5',
				borderSoft: 'hover:border-physics/30',
				shadow: 'shadow-physics/20',
				from: 'from-physics',
				to: 'to-purple-400',
			};
		case 'Mathematics':
			return {
				bg: 'bg-math',
				text: 'text-math',
				border: 'border-math',
				bgSoft: 'bg-math/5',
				borderSoft: 'hover:border-math/30',
				shadow: 'shadow-math/20',
				from: 'from-math',
				to: 'to-blue-400',
			};
		case 'Life Sciences':
			return {
				bg: 'bg-life-sci',
				text: 'text-life-sci',
				border: 'border-life-sci',
				bgSoft: 'bg-life-sci/5',
				borderSoft: 'hover:border-life-sci/30',
				shadow: 'shadow-life-sci/20',
				from: 'from-life-sci',
				to: 'to-emerald-400',
			};
		case 'Accounting':
			return {
				bg: 'bg-accounting',
				text: 'text-accounting',
				border: 'border-accounting',
				bgSoft: 'bg-accounting/5',
				borderSoft: 'hover:border-accounting/30',
				shadow: 'shadow-accounting/20',
				from: 'from-accounting',
				to: 'to-yellow-400',
			};
		case 'English HL':
			return {
				bg: 'bg-english',
				text: 'text-english',
				border: 'border-english',
				bgSoft: 'bg-english/5',
				borderSoft: 'hover:border-english/30',
				shadow: 'shadow-english/20',
				from: 'from-english',
				to: 'to-pink-400',
			};
		case 'Geography':
			return {
				bg: 'bg-geography',
				text: 'text-geography',
				border: 'border-geography',
				bgSoft: 'bg-geography/5',
				borderSoft: 'hover:border-geography/30',
				shadow: 'shadow-geography/20',
				from: 'from-geography',
				to: 'to-cyan-400',
			};
		default:
			return {
				bg: 'bg-zinc-900',
				text: 'text-zinc-600',
				border: 'border-zinc-200',
				bgSoft: 'bg-zinc-50',
				borderSoft: 'hover:border-zinc-300',
				shadow: 'shadow-zinc-900/10',
				from: 'from-zinc-400',
				to: 'to-zinc-500',
			};
	}
};

export default function InteractiveQuiz() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const paperId = searchParams.get('id');

	// Extract unique subjects from QUIZ_DATA
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

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	useEffect(() => {
		if (paperId && QUIZ_DATA[paperId]) {
			setQuiz(QUIZ_DATA[paperId]);
			setSelectedSubject(QUIZ_DATA[paperId].subject);
		}
	}, [paperId]);

	// Filter quiz data by selected subject
	// const filteredQuizzes = Object.entries(QUIZ_DATA)
	// 	.filter(([_, quizData]) => quizData.subject === selectedSubject)
	// 	.map(([key, quizData]) => ({ id: key, ...quizData }));

	const handleSubjectChange = (subject: string) => {
		setSelectedSubject(subject);
		// Find first quiz of selected subject
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

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const explanation = await getExplanation(quiz.subject, currentQuestion.question);
			setAiExplanation(
				explanation ?? "I'm sorry, I couldn't generate an explanation for this question."
			);
		} catch (error) {
			console.error('Failed to get AI explanation:', error);
			setAiExplanation(
				"Sorry, I couldn't generate an explanation right now. Please check your internet connection and try again."
			);
		} finally {
			setIsExplaining(false);
		}
	};

	const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

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
			saveQuizResult({
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

	if (!currentQuestion) return null;

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative overflow-hidden">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4 mb-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="rounded-full"
							aria-label="Go back"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex justify-between items-center mb-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
										Question {currentQuestionIndex + 1} of {quiz.questions.length}
									</span>
									{score > 0 && (
										<Badge
											variant="outline"
											className="text-[10px] font-bold text-brand-green border-brand-green/20 bg-brand-green/5"
										>
											Score: {score}
										</Badge>
									)}
									<Badge
										variant="outline"
										className="text-[10px] font-bold text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
									>
										<Clock className="w-3 h-3 mr-1" />
										{formatTime(elapsedSeconds)}
									</Badge>
								</div>
								<Badge
									variant="secondary"
									className={`text-[10px] font-black uppercase tracking-tighter rounded-full ${colors.bgSoft} ${colors.text}`}
								>
									{currentQuestion.topic}
								</Badge>
							</div>
							<div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
								<div
									className={`h-full transition-all duration-500 ${colors.bg}`}
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Subject Filter Pills */}
					<div className="w-full overflow-x-auto whitespace-nowrap pb-2">
						<div className="flex gap-2 px-1">
							{uniqueSubjects.map((subject) => {
								const subjectColors = getSubjectColor(subject);
								const isSelected = subject === selectedSubject;
								return (
									<button
										type="button"
										key={subject}
										onClick={() => handleSubjectChange(subject)}
										className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
											isSelected
												? `${subjectColors.bg} text-white shadow-md scale-105`
												: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
										}`}
									>
										{subject}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</header>

			<div className="grow overflow-hidden">
				<main className="px-6 py-8 space-y-8 pb-64 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<TrendingUp className={`w-5 h-5 ${colors.text}`} />
							<h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
								{quiz.title}
							</h3>
						</div>
						<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
							{currentQuestion.question}
						</h2>

						<Card className="p-8 bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
							<div
								className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${colors.bgSoft}`}
							/>

							<RadioGroup
								value={selectedAnswer || ''}
								onValueChange={setSelectedAnswer}
								disabled={showResult}
								className="space-y-4 relative z-10"
							>
								{currentQuestion.options.map((option) => (
									<div key={option.id} className="flex items-center">
										<RadioGroupItem value={option.id} id={option.id} className="sr-only" />
										<Label
											htmlFor={option.id}
											className={`flex-1 p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
												selectedAnswer === option.id
													? `${colors.border} ${colors.bgSoft} shadow-md scale-[1.02]`
													: `border-zinc-100 dark:border-zinc-800 ${colors.borderSoft}`
											} ${
												showResult && option.id === currentQuestion.correctAnswer
													? 'border-green-500 bg-green-500/10'
													: showResult &&
															selectedAnswer === option.id &&
															option.id !== currentQuestion.correctAnswer
														? 'border-red-500 bg-red-500/10'
														: ''
											}`}
										>
											<span
												className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
													selectedAnswer === option.id
														? `${colors.bg} text-white`
														: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
												}`}
											>
												{option.id}
											</span>
											<span className="font-bold text-zinc-700 dark:text-zinc-300">
												{option.text}
											</span>
										</Label>
									</div>
								))}
							</RadioGroup>
						</Card>
					</div>

					{/* Feedback / Result */}
					{showResult && (
						<div
							className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-4 ${
								isCorrect
									? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
									: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
										isCorrect
											? 'bg-green-100 dark:bg-green-900/30'
											: 'bg-red-100 dark:bg-red-900/30'
									}`}
								>
									{isCorrect ? (
										<CheckCircle2 className="w-5 h-5 text-green-600" />
									) : (
										<SkipForward className="w-5 h-5 text-red-600" />
									)}
								</div>
								<div>
									<h4
										className={`font-black text-xs uppercase tracking-widest mb-1 ${
											isCorrect
												? 'text-green-900 dark:text-green-100'
												: 'text-red-900 dark:text-red-100'
										}`}
									>
										{isCorrect ? 'Correct! Well done' : 'Not quite right'}
									</h4>
									<p
										className={`text-sm font-medium ${
											isCorrect
												? 'text-green-800/80 dark:text-green-200/80'
												: 'text-red-800/80 dark:text-red-200/80'
										}`}
									>
										{isCorrect
											? 'Excellent understanding of the principles involved.'
											: `The correct answer is ${currentQuestion.correctAnswer}. Let's review the teacher's hint.`}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Hint */}
					<div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start gap-4">
						<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
							<Lightbulb className="w-5 h-5 text-amber-600" />
						</div>
						<div>
							<h4 className="font-black text-amber-900 dark:text-amber-100 text-xs uppercase tracking-widest mb-1">
								Teacher's Hint
							</h4>
							<p className="text-sm text-amber-800/80 dark:text-amber-200/80 font-medium">
								{currentQuestion.hint}
							</p>
						</div>
					</div>

					{/* AI Explanation */}
					<AIExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject={quiz.subject}
					/>
				</main>
			</div>

			{/* Actions Footer */}
			<footer className="absolute bottom-26 left-0 right-0 backdrop-blur-xl z-30">
				<div className="max-w-2xl mx-auto w-full p-6 flex gap-4">
					{!showResult ? (
						<Button
							className="flex-1 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-bold text-sm shadow-xl shadow-zinc-900/10 disabled:opacity-50 transition-all active:scale-95"
							disabled={!selectedAnswer}
							onClick={handleCheckAnswer}
						>
							Check Answer
						</Button>
					) : (
						<Button
							className={`flex-1 h-16 text-white rounded-[2rem] font-bold text-lg shadow-xl transition-all active:scale-95 ${colors.bg} ${colors.shadow}`}
							onClick={handleNextQuestion}
						>
							{currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
						</Button>
					)}
				</div>
			</footer>
		</div>
	);
}

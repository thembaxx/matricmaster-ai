'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, m } from 'framer-motion';
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	Loader2,
	Sparkles,
	TrendingUp,
	XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AIExplanationCard } from '@/components/AI/AIExplanationCard';
import { SafeImage } from '@/components/SafeImage';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import {
	getOptionsByQuestionIdAction,
	getRandomQuestionsAction,
	getRandomQuestionsFromMultipleSubjectsAction,
	getSubjectsAction,
} from '@/lib/db/actions';
import { cn } from '@/lib/utils';
import { getExplanation } from '@/services/geminiService';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

// Types
interface Subject {
	id: number;
	name: string;
	description: string | null;
	curriculumCode: string;
	isActive: boolean;
	createdAt: Date | null;
	updatedAt: Date | null;
}

interface Option {
	id: string;
	questionId: string;
	optionText: string;
	isCorrect: boolean;
	optionLetter: string;
	explanation: string | null;
	isActive: boolean;
	createdAt: Date | null;
}

interface Question {
	id: string;
	subjectId: number;
	questionText: string;
	imageUrl: string | null;
	gradeLevel: number;
	topic: string;
	difficulty: string;
	marks: number;
	hint: string | null; // Hint to help users answer the question
	isActive: boolean;
	createdAt: Date | null;
	updatedAt: Date | null;
	options?: Option[];
}

interface QuizState {
	currentQuestionIndex: number;
	selectedAnswers: Record<string, string>;
	showResults: boolean;
	startTime: number | null;
	endTime: number | null;
	questions: Question[];
	selectedSubjects: number[];
	isMixedMode: boolean;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.5,
			when: 'beforeChildren',
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { duration: 0.3 },
	},
};

const badgeVariants = {
	selected: {
		scale: 1.05,
	},
	unselected: {
		scale: 1,
	},
};

export default function EnhancedTestQuizScreen() {
	const router = useRouter();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [loading, setLoading] = useState(true);
	const [quizState, setQuizState] = useState<QuizState>({
		currentQuestionIndex: 0,
		selectedAnswers: {},
		showResults: false,
		startTime: null,
		endTime: null,
		questions: [],
		selectedSubjects: [],
		isMixedMode: false,
	});
	const [screen, setScreen] = useState<'selection' | 'quiz' | 'results'>('selection');
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);

	const handleExplain = async (subject: string, questionContext: string) => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const explanation = await getExplanation(subject, questionContext);
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

	const loadSubjects = useCallback(async () => {
		try {
			const subjectsData = await getSubjectsAction();
			setSubjects(subjectsData);
		} catch (error) {
			console.error('Failed to load subjects:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadSubjects();
	}, [loadSubjects]);

	const toggleSubject = (subjectId: number) => {
		setQuizState((prev) => {
			const isSelected = prev.selectedSubjects.includes(subjectId);
			const newSelected = isSelected
				? prev.selectedSubjects.filter((id) => id !== subjectId)
				: [...prev.selectedSubjects, subjectId];

			return {
				...prev,
				selectedSubjects: newSelected,
				isMixedMode: newSelected.length > 1,
			};
		});
	};

	const selectRandomSubjects = () => {
		const shuffled = [...subjects].sort(() => 0.5 - Math.random());
		const randomSelection = shuffled
			.slice(0, Math.floor(Math.random() * 3) + 1)
			.map((subject) => subject.id);

		setQuizState((prev) => ({
			...prev,
			selectedSubjects: randomSelection,
			isMixedMode: randomSelection.length > 1,
		}));
	};

	const startQuiz = async () => {
		if (quizState.selectedSubjects.length === 0) return;

		setLoading(true);
		try {
			let questions: Question[] = [];

			if (quizState.isMixedMode) {
				// Mixed mode: get 20 random questions from selected subjects
				questions = await getRandomQuestionsFromMultipleSubjectsAction(
					quizState.selectedSubjects,
					20
				);
			} else {
				// Single subject: get 10 random questions
				questions = await getRandomQuestionsAction(quizState.selectedSubjects[0], 10);
			}

			// Fetch options for each question
			const questionsWithOptions = await Promise.all(
				questions.map(async (question) => {
					const options = await getOptionsByQuestionIdAction(question.id);
					return {
						...question,
						options: options || [],
					};
				})
			);

			setQuizState((prev) => ({
				...prev,
				questions: questionsWithOptions,
				currentQuestionIndex: 0,
				selectedAnswers: {},
				showResults: false,
				startTime: Date.now(),
			}));

			setScreen('quiz');
		} catch (error) {
			console.error('Failed to start quiz:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerSelect = (questionId: string, value: string) => {
		setQuizState((prev) => ({
			...prev,
			selectedAnswers: {
				...prev.selectedAnswers,
				[questionId]: value,
			},
		}));
	};

	const handleNext = () => {
		if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
			setQuizState((prev) => ({
				...prev,
				currentQuestionIndex: prev.currentQuestionIndex + 1,
			}));
		} else {
			finishQuiz();
		}
	};

	const handlePrevious = () => {
		if (quizState.currentQuestionIndex > 0) {
			setQuizState((prev) => ({
				...prev,
				currentQuestionIndex: prev.currentQuestionIndex - 1,
			}));
		}
	};

	const finishQuiz = () => {
		setQuizState((prev) => ({
			...prev,
			showResults: true,
			endTime: Date.now(),
		}));
		setScreen('results');
	};

	const calculateScore = () => {
		return quizState.questions.filter(
			(q) =>
				q.options?.find((opt) => opt.optionLetter === quizState.selectedAnswers[q.id])?.isCorrect
		).length;
	};

	const getGrade = (score: number) => {
		const percentage = (score / quizState.questions.length) * 100;
		if (percentage >= 80) return 'A';
		if (percentage >= 70) return 'B';
		if (percentage >= 60) return 'C';
		if (percentage >= 50) return 'D';
		return 'F';
	};

	const getTimeTaken = () => {
		if (!quizState.startTime || !quizState.endTime) return '0:00';
		const seconds = Math.floor((quizState.endTime - quizState.startTime) / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const resetQuiz = () => {
		setQuizState({
			currentQuestionIndex: 0,
			selectedAnswers: {},
			showResults: false,
			startTime: null,
			endTime: null,
			questions: [],
			selectedSubjects: [],
			isMixedMode: false,
		});
		setScreen('selection');
	};

	if (loading && screen === 'selection') {
		return (
			<div className="flex items-center justify-center h-screen overflow-hidden bg-background">
				<div className="text-center flex flex-col items-center gap-3 mb-20">
					<Spinner className="size-12" />
					<p className="text-zinc-600 dark:text-neutral-400 text-xs">Loading subjects...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative overflow-hidden">
			<BackgroundMesh variant="subtle" />
			<AnimatePresence mode="wait">
				{screen === 'selection' && (
					<m.div
						key="selection"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full justify-center px-6"
					>
						<m.div
							variants={itemVariants}
							className="flex items-center justify-between mb-8 fixed top-6 w-full left-0 px-6 gap-4 z-20"
						>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.back()}
								className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
							>
								<ArrowLeft className="w-6 h-6" />
							</Button>
							<h1 className="text-lg font-medium text-left grow text-foreground opacity-80">
								Select Subjects
							</h1>
						</m.div>

						<m.div
							variants={itemVariants}
							className="grow flex items-center justify-center pt-24 pb-24"
						>
							<Card className="premium-glass border-none p-8 h-auto w-full max-w-lg rounded-[2.5rem]">
								<div className="space-y-8">
									<div>
										<div className="flex items-center gap-3 mb-4">
											<div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
												<CheckCircle2 className="w-5 h-5 text-brand-blue" />
											</div>
											<h2 className="text-xl font-bold text-foreground tracking-tight">
												Choose your subjects
											</h2>
										</div>
										<p className="text-sm font-medium text-muted-foreground mb-4 leading-relaxed">
											{quizState.isMixedMode
												? `Mixed mode: ${quizState.selectedSubjects.length} subjects selected`
												: `Single subject: ${quizState.selectedSubjects.length > 0 ? subjects.find((s) => s.id === quizState.selectedSubjects[0])?.name || 'Unknown' : 'None'} selected`}
										</p>
									</div>

									<div className="flex flex-wrap gap-3">
										{subjects.map((subject) => {
											const isSelected = quizState.selectedSubjects.includes(subject.id);
											return (
												<m.div
													key={subject.id}
													variants={badgeVariants}
													animate={isSelected ? 'selected' : 'unselected'}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
												>
													<Badge
														variant={isSelected ? 'default' : 'outline'}
														className={`cursor-pointer px-3.5 py-1.5 rounded-2xl text-[13px] font-semibold transition-all border-2 ${
															isSelected
																? 'border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
																: 'border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
														}`}
														onClick={() => toggleSubject(subject.id)}
													>
														{subject.name}
													</Badge>
												</m.div>
											);
										})}
									</div>

									<m.div variants={itemVariants} className="pt-2">
										<Button
											variant="secondary"
											size="sm"
											onClick={selectRandomSubjects}
											className="w-full rounded-2xl border border-border hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all text-muted-foreground font-semibold h-12"
										>
											<Sparkles className="w-4 h-4 mr-2" />
											I'm feeling lucky
										</Button>
									</m.div>
								</div>
							</Card>
						</m.div>

						<m.div variants={itemVariants} className="fixed left-0 bottom-8 w-full px-6 z-20">
							<Button
								onClick={startQuiz}
								disabled={quizState.selectedSubjects.length === 0 || loading}
								className="w-full bg-brand-blue hover:bg-brand-blue/90 shadow-xl shadow-brand-blue/20 gap-3 text-white h-16 rounded-[2rem] font-semibold text-base transition-all active:scale-95"
							>
								{loading ? (
									<Loader2 className="w-6 h-6 animate-spin" />
								) : (
									<>
										<Icon
											icon="fluent:play-circle-sparkle-24-filled"
											className="h-6! w-6! shrink-0"
										/>
										Start Quiz
									</>
								)}
							</Button>
						</m.div>
					</m.div>
				)}

				{screen === 'quiz' && (
					<m.div
						key="quiz"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full font-lexend relative"
					>
						{/* Header */}
						<div className="p-4 rounded-2xl relative z-60">
							<header className="ios-glass rounded-2xl border-b border-border shrink-0 sticky top-0 z-30">
								<div className="max-w-2xl mx-auto w-full">
									<div
										className="px-6 pt-12 pb-2 flex items-center justify-between"
										style={{ paddingTop: 'calc(env(safe-area-inset-top, 24px) + 24px)' }}
									>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => router.push('/dashboard')}
											className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
										>
											<ArrowLeft className="w-6 h-6" />
										</Button>
										<div className="text-center">
											<h1 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
												{subjects.find(
													(s) =>
														s.id === quizState.questions[quizState.currentQuestionIndex]?.subjectId
												)?.name || 'Subject'}
											</h1>
											<p className="text-sm font-black text-foreground">
												Question {quizState.currentQuestionIndex + 1} of{' '}
												{quizState.questions.length}
											</p>
										</div>
										<div className="w-10" />
									</div>
									{/* Progress */}
									<div className="px-6 pb-6">
										<div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
											<m.div
												className="absolute top-0 left-0 h-full bg-brand-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)]"
												initial={{ width: 0 }}
												animate={{
													width: `${((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100}%`,
												}}
											/>
										</div>
									</div>
								</div>
							</header>
						</div>

						{quizState.questions.length > 0 && (
							<ScrollArea className="flex-1">
								<m.div
									key={quizState.currentQuestionIndex}
									variants={itemVariants}
									className="flex-1 flex flex-col space-y-6 p-6 pb-32 max-w-2xl mx-auto w-full"
								>
									<div className="py-2 px-2">
										<div className="flex items-center gap-3 mb-2">
											<Badge
												variant="outline"
												className="bg-brand-blue/10 text-brand-blue border-brand-blue/20"
											>
												{quizState.questions[quizState.currentQuestionIndex].topic || 'General'}
											</Badge>
											<div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
												{quizState.questions[quizState.currentQuestionIndex].marks} Marks
											</div>
										</div>
										<h2 className="text-2xl font-medium text-zinc-900 dark:text-white leading-relaxed">
											{quizState.questions[quizState.currentQuestionIndex].questionText}
										</h2>
									</div>

									{/* Image */}
									{quizState.questions[quizState.currentQuestionIndex].imageUrl && (
										<div className="rounded-3xl overflow-hidden bg-card shadow-inner border border-border">
											<SafeImage
												src={quizState.questions[quizState.currentQuestionIndex].imageUrl}
												alt="Question diagram"
												className="w-full h-auto object-contain max-h-80"
											/>
										</div>
									)}

									{/* Hint */}
									{quizState.questions[quizState.currentQuestionIndex].hint && (
										<div className="p-4 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-2xl border border-yellow-500/10 flex gap-3">
											<div className="shrink-0 text-yellow-600 dark:text-yellow-500">
												<Sparkles className="w-5 h-5 fill-current" />
											</div>
											<p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
												{quizState.questions[quizState.currentQuestionIndex].hint}
											</p>
										</div>
									)}

									{/* Options Grid */}
									<div>
										<RadioGroup
											value={
												quizState.selectedAnswers[
													quizState.questions[quizState.currentQuestionIndex].id
												] || ''
											}
											onValueChange={(value) =>
												handleAnswerSelect(
													quizState.questions[quizState.currentQuestionIndex].id,
													value
												)
											}
											className="space-y-3 flex flex-col"
										>
											{quizState.questions[quizState.currentQuestionIndex].options?.map(
												(option) => {
													const selectedId =
														quizState.selectedAnswers[
															quizState.questions[quizState.currentQuestionIndex].id
														] || '';

													const isSelected = selectedId === option.optionLetter; // Value matches optionLetter

													return (
														<m.div key={option.id} whileTap={{ scale: 0.98 }}>
															<RadioGroupItem
																value={option.optionLetter}
																id={option.id}
																className="peer sr-only"
															/>
															<Label
																htmlFor={option.id}
																className={cn(
																	'premium-glass border-none p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 group',
																	isSelected
																		? 'ring-2 ring-brand-blue bg-card dark:bg-card/80'
																		: 'hover:bg-card/80 dark:hover:bg-card/60'
																)}
															>
																<div
																	className={cn(
																		'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors shrink-0',
																		isSelected
																			? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
																			: 'bg-muted text-muted-foreground group-hover:bg-brand-blue/10 group-hover:text-brand-blue'
																	)}
																>
																	{option.optionLetter}
																</div>
																<span className="text-base font-medium text-foreground leading-snug">
																	{option.optionText}
																</span>
																{isSelected && (
																	<div className="ml-auto text-brand-blue">
																		<CheckCircle2 className="w-5 h-5 fill-current" />
																	</div>
																)}
															</Label>

															{/* AI Explanation for selected option (optional feature, kept simple for now) */}
															{isSelected && false && (
																<div className="mt-2 text-xs text-zinc-500 px-4">
																	Show detailed explanation here...
																</div>
															)}
														</m.div>
													);
												}
											)}
										</RadioGroup>
									</div>

									<div className="mt-8">
										<AIExplanationCard
											explanation={aiExplanation}
											isLoading={isExplaining}
											onExplain={() =>
												handleExplain(
													subjects.find(
														(s) =>
															s.id === quizState.questions[quizState.currentQuestionIndex].subjectId
													)?.name || 'General',
													quizState.questions[quizState.currentQuestionIndex].questionText
												)
											}
											subject={
												subjects.find(
													(s) =>
														s.id === quizState.questions[quizState.currentQuestionIndex].subjectId
												)?.name
											}
										/>
									</div>

									{/* Controls */}
									<div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-background via-background to-transparent z-20">
										<div className="max-w-2xl mx-auto flex gap-4">
											<Button
												variant="outline"
												size="sm"
												onClick={handlePrevious}
												disabled={quizState.currentQuestionIndex === 0}
												className="flex-1 h-12 rounded-2xl text-base font-semibold ios-glass"
											>
												Previous
											</Button>

											{quizState.selectedAnswers[
												quizState.questions[quizState.currentQuestionIndex].id
											] && (
												<Button
													size="sm"
													onClick={handleNext}
													className="flex-1 h-12 text-base rounded-2xl font-semibold bg-brand-blue hover:bg-brand-blue/90 text-white shadow-xl shadow-brand-blue/20"
												>
													{quizState.currentQuestionIndex === quizState.questions.length - 1
														? 'Finish'
														: 'Next'}
												</Button>
											)}
										</div>
									</div>
								</m.div>
							</ScrollArea>
						)}
					</m.div>
				)}

				{screen === 'results' && (
					<m.div
						key="results"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full overflow-hidden"
					>
						<ScrollArea className="flex-1">
							<m.div
								variants={itemVariants}
								className="flex-1 flex flex-col items-center p-6 py-12 max-w-md mx-auto w-full"
							>
								<div className="text-center mb-8">
									<div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0 shadow-[0_0_32px_rgba(16,185,129,0.2)]">
										<TrendingUp className="w-12 h-12 text-brand-green" />
									</div>
									<h2 className="text-3xl font-black mb-2 text-foreground tracking-tight">
										Quiz Complete!
									</h2>
									<div className="flex flex-col gap-2 items-center">
										<p className="text-muted-foreground font-medium flex items-center justify-center gap-2 bg-muted py-1 px-4 rounded-full w-fit mx-auto mt-4">
											<Clock className="w-4 h-4" />
											Time taken: {getTimeTaken()}
										</p>
										<Badge
											variant="outline"
											className="text-lg px-4 py-1 border-brand-blue/30 text-brand-blue bg-brand-blue/5"
										>
											Grade: {getGrade(calculateScore())}
										</Badge>
									</div>
								</div>

								<Card className="premium-glass border-none p-8 w-full mb-8 relative overflow-hidden text-center">
									<div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />
									<div className="space-y-2 mb-8">
										<p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
											Your Performance
										</p>
										<div className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
											{Math.round((calculateScore() / quizState.questions.length) * 100)}%
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 rounded-2xl bg-brand-green/10 border border-brand-green/20">
											<div className="text-2xl font-black text-brand-green mb-1">
												{calculateScore()}
											</div>
											<div className="text-xs font-bold text-brand-green/70 uppercase">Correct</div>
										</div>
										<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
											<div className="text-2xl font-black text-red-500 mb-1">
												{quizState.questions.length - calculateScore()}
											</div>
											<div className="text-xs font-bold text-red-500/70 uppercase">Incorrect</div>
										</div>
									</div>
								</Card>

								<div className="w-full space-y-3 mb-8">
									<h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest px-1">
										Review Answers
									</h3>
									{quizState.questions.map((question, index) => {
										const selectedOption = quizState.selectedAnswers[question.id];
										const correctOption = question.options?.find((opt) => opt.isCorrect);
										const isCorrect = selectedOption === correctOption?.optionLetter;

										return (
											<div
												key={question.id}
												className={cn(
													'p-4 rounded-2xl flex items-center justify-between border',
													isCorrect
														? 'bg-green-500/5 border-green-500/10'
														: 'bg-red-500/5 border-red-500/10'
												)}
											>
												<span className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
													Question {index + 1}
												</span>
												{isCorrect ? (
													<CheckCircle2 className="w-5 h-5 text-green-500" />
												) : (
													<XCircle className="w-5 h-5 text-red-500" />
												)}
											</div>
										);
									})}
								</div>

								<div className="flex gap-4 w-full">
									<Button
										variant="outline"
										size="lg"
										onClick={resetQuiz}
										className="flex-1 h-14 rounded-2xl font-bold border-2 border-zinc-200 dark:border-zinc-700"
									>
										New Quiz
									</Button>
									<Button
										size="lg"
										onClick={() => {
											const durationSeconds =
												quizState.startTime && quizState.endTime
													? Math.floor((quizState.endTime - quizState.startTime) / 1000)
													: 0;
											const score = calculateScore();
											const subjectId = quizState.selectedSubjects[0];
											useQuizResultStore.getState().save({
												correctAnswers: score,
												totalQuestions: quizState.questions.length,
												durationSeconds,
												accuracy: Math.round((score / quizState.questions.length) * 100),
												subjectName: subjects.find((s) => s.id === subjectId)?.name || 'Mixed',
												subjectId: quizState.isMixedMode ? undefined : subjectId,
												difficulty: 'medium',
												completedAt: new Date(),
											});
											router.push('/lesson-complete');
										}}
										className="flex-1 h-14 rounded-2xl font-black uppercase tracking-wider bg-brand-amber text-zinc-900 hover:bg-brand-amber/90"
									>
										<Sparkles className="w-4 h-4 mr-2" />
										Claim XP
									</Button>
								</div>
							</m.div>
						</ScrollArea>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

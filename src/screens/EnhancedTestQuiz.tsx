/** biome-ignore-all lint/performance/noImgElement: NN */
'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	Loader2,
	MoreHorizontal,
	Sparkles,
	TrendingUp,
	XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative -mt-20">
			<AnimatePresence mode="wait">
				{screen === 'selection' && (
					<motion.div
						key="selection"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full justify-center"
					>
						<motion.div
							variants={itemVariants}
							className="flex items-center justify-between mb-8 fixed top-6 w-full left-0 px-6 gap-4"
						>
							<Button variant="ghost" size="icon" onClick={() => router.back()} className="p-0">
								<Icon icon="fluent:chevron-left-24-filled" className="w-5! h-5!" />
							</Button>
							<h1 className="text-lg font-bold text-left grow text-zinc-900 dark:text-white">
								Select Subjects
							</h1>
						</motion.div>

						<motion.div
							variants={itemVariants}
							className="grow flex items-center justify-center pt-24"
						>
							<Card className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-6 h-full">
								<div className="space-y-6">
									<div>
										<div className="flex items-center gap-3 mb-4">
											<Icon icon="fluent:checkmark-circle-hint-24-filled" className="w-5 h-5" />
											<h2 className="text-lg font-medium text-zinc-900 dark:text-white/95">
												Choose your subjects:
											</h2>
										</div>
										<p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
											{quizState.isMixedMode
												? `Mixed mode: ${quizState.selectedSubjects.length} subjects selected (${quizState.selectedSubjects.length * 20} questions)`
												: `Single subject: ${quizState.selectedSubjects.length > 0 ? subjects.find((s) => s.id === quizState.selectedSubjects[0])?.name || 'Unknown' : 'None'} selected (10 questions)`}
										</p>
									</div>

									<div className="flex flex-wrap gap-3">
										{subjects.map((subject) => {
											const isSelected = quizState.selectedSubjects.includes(subject.id);
											return (
												<motion.div
													key={subject.id}
													variants={badgeVariants}
													animate={isSelected ? 'selected' : 'unselected'}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
												>
													<Badge
														variant={isSelected ? 'default' : 'outline'}
														className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium ${
															isSelected
																? 'font-semibold bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-indigo-700 text-white'
																: 'bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600'
														}`}
														onClick={() => toggleSubject(subject.id)}
													>
														{subject.name}
													</Badge>
												</motion.div>
											);
										})}
									</div>

									<motion.div variants={itemVariants} className="pt-4">
										<Button
											variant="outline"
											size="sm"
											onClick={selectRandomSubjects}
											className="w-full bg-white/50 dark:bg-zinc-700/50 hover:bg-white/80 dark:hover:bg-zinc-600/80"
										>
											<Icon icon="fa6-solid:dice" className="w-4 h-4 mr-2" />
											Random Selection
										</Button>
									</motion.div>
								</div>
							</Card>
						</motion.div>

						<motion.div variants={itemVariants} className="mt-6 fixed left-0 bottom-6 w-full px-6">
							<Button
								onClick={startQuiz}
								disabled={quizState.selectedSubjects.length === 0 || loading}
								className="w-full bg-brand-blue shadow shadow-brand-blue gap-3 text-white h-14 font-semibold"
							>
								<Icon icon="fluent:play-circle-sparkle-24-filled" className="w-6! h-6!" />
								Start Quiz
							</Button>
						</motion.div>
					</motion.div>
				)}

				{screen === 'quiz' && (
					<motion.div
						key="quiz"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full font-lexend relative"
					>
						{/* Header */}
						<header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 shrink-0">
							<div className="max-w-2xl mx-auto w-full">
								<div className="px-6 pt-12 pb-2 flex items-center justify-between">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => router.push('/dashboard')}
										className="rounded-full"
									>
										<ArrowLeft className="w-6 h-6" />
									</Button>
									<div className="text-center">
										<h1 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
											Mathematics P1
										</h1>
										<p className="text-sm font-black text-zinc-900 dark:text-white">
											Nov 2023 • NSC
										</p>
									</div>
									<Button variant="ghost" size="icon" className="rounded-full">
										<MoreHorizontal className="w-6 h-6" />
									</Button>
								</div>
								{/* Progress */}
								<div className="px-6 pb-6">
									<div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
										<div className="absolute top-0 left-0 h-full w-1/3 bg-brand-green rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
									</div>
									<div className="flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-400 uppercase">
										<span className="flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
											Algebra
										</span>
										<span>Question 3/12</span>
									</div>
								</div>
							</div>
						</header>

						{/* <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setScreen('selection')}
								className="rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm"
							>
								<ArrowLeft className="w-5 h-5" />
							</Button>

							<div className="text-center">
								<h1 className="text-xl font-bold text-zinc-900 dark:text-white">
									Quiz in Progress
								</h1>
								<div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
									<Clock className="w-4 h-4" />
									<span>{getTimeTaken()}</span>
								</div>
							</div>

							<Badge
								variant="secondary"
								className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm"
							>
								{quizState.currentQuestionIndex + 1}/{quizState.questions.length}
							</Badge>
						</motion.div> */}

						{quizState.questions.length > 0 && (
							<motion.div
								key={quizState.currentQuestionIndex}
								variants={itemVariants}
								className="flex-1 flex flex-col space-y-6 p-6"
							>
								<div className="py-6 px-3">
									<h2 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight">
										{
											subjects.find(
												(s) =>
													s.id === quizState.questions[quizState.currentQuestionIndex].subjectId
											)?.name
										}
									</h2>
									<p className="text-xl italic font-serif dark:text-neutral-400">
										{quizState.questions[quizState.currentQuestionIndex].topic}
									</p>
									<Badge
										variant="outline"
										className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
									>
										{quizState.questions[quizState.currentQuestionIndex].marks} marks
									</Badge>
								</div>

								<Card className="flex-1 flex flex-col mb-6">
									<ScrollArea className="flex-1 p-6">
										<div className="mb-6">
											{/* <div className="flex items-center gap-2 mb-3">
												<Badge
													variant="outline"
													className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
												>
													{
														subjects.find(
															(s) =>
																s.id ===
																quizState.questions[quizState.currentQuestionIndex].subjectId
														)?.name
													}
												</Badge>
												<Badge
													variant="outline"
													className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
												>
													{quizState.questions[quizState.currentQuestionIndex].topic}
												</Badge>
												<Badge
													variant="outline"
													className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
												>
													{quizState.questions[quizState.currentQuestionIndex].marks} marks
												</Badge>
											</div> */}

											<h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
												{quizState.questions[quizState.currentQuestionIndex].questionText}
											</h2>

											{quizState.questions[quizState.currentQuestionIndex].hint && (
												<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
													<div className="flex items-start gap-2">
														<span className="text-blue-600 dark:text-blue-400 font-medium">
															💡 Hint:
														</span>
														<span className="text-blue-800 dark:text-blue-200 text-sm">
															{quizState.questions[quizState.currentQuestionIndex].hint}
														</span>
													</div>
												</div>
											)}

											{quizState.questions[quizState.currentQuestionIndex].imageUrl && (
												<div className="mb-4 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
													<img
														src={quizState.questions[quizState.currentQuestionIndex].imageUrl || ''}
														alt="Question diagram"
														className="w-full h-48 object-contain"
													/>
												</div>
											)}
										</div>
									</ScrollArea>
								</Card>

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
										className="space-y-4 flex flex-col"
									>
										{quizState.questions[quizState.currentQuestionIndex].options?.map((option) => {
											const selectedId =
												quizState.selectedAnswers[
													quizState.questions[quizState.currentQuestionIndex].id
												] || '';

											console.log(quizState);

											const isSelected = selectedId === option.id;
											const stateClasses =
												'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-100 dark:border-zinc-800 hover:border-brand-blue/30 hover:shadow-md p-4 rounded-xl flex items-center gap-3';

											return (
												<motion.div
													key={option.id}
													className={cn(
														stateClasses,
														isSelected ? 'border-2 dark:border-zinc-400' : ''
													)}
													whileTap={{ scale: 0.95 }}
												>
													<RadioGroupItem
														value={option.optionLetter}
														id={option.id}
														className="relative"
														//className="mt-1 border-2 border-zinc-300 dark:border-zinc-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
													/>
													<Label
														htmlFor={option.id}
														className="flex-1 text-lg  flex items-center gap-3 leading-relaxed cursor-pointer text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
													>
														<div
															className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold transition-colors ${'bg-zinc-50 dark:bg-zinc-800 text-zinc-200 group-hover:bg-brand-blue/5 group-hover:text-brand-blue'}`}
														>
															{option.optionLetter}
														</div>

														<span className="font-serif italic font-bold">{option.optionText}</span>
													</Label>

													{/* Hint Card */}
													<div className="p-6 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-[2rem] border border-brand-blue/10 flex gap-5 items-start transition-all hover:bg-brand-blue/10">
														<div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-brand-blue/10">
															<Sparkles className="w-6 h-6 text-brand-blue" />
														</div>
														<div className="space-y-1">
															<h4 className="font-black text-brand-blue text-xs uppercase tracking-widest">
																Smart Hint
															</h4>
															<p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
																A local maximum occurs where the function stops increasing and
																starts decreasing. This always happens at a stationary point.
															</p>
														</div>
													</div>

													{/* AI Explanation Toggle */}
													<div className="p-1 bg-linear-to-r from-brand-blue to-brand-green rounded-[2rem]">
														<div className="bg-white dark:bg-zinc-950 rounded-[1.9rem] p-6 space-y-4">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-4">
																	<div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
																		<Sparkles className="w-5 h-5 text-brand-blue" />
																	</div>
																	<div>
																		<h4 className="font-bold text-zinc-900 dark:text-white text-sm">
																			Need a deeper explanation?
																		</h4>
																		<p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
																			Ask MatricMaster AI
																		</p>
																	</div>
																</div>
																<Button
																	size="sm"
																	variant="ghost"
																	className="font-black text-brand-blue hover:bg-brand-blue/5"
																	onClick={() => handleExplain(option.id, option.optionText)}
																	disabled={isExplaining}
																>
																	{isExplaining ? (
																		<Loader2 className="w-4 h-4 animate-spin" />
																	) : (
																		'Explain'
																	)}
																</Button>
															</div>

															{aiExplanation && (
																<div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
																	<p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap">
																		{aiExplanation}
																	</p>
																</div>
															)}
														</div>
													</div>
												</motion.div>
											);
										})}
									</RadioGroup>
								</div>

								<div className="p-6 border-t border-zinc-200 dark:border-zinc-700">
									<div className="flex items-center justify-between gap-4">
										<Button
											variant="outline"
											onClick={handlePrevious}
											disabled={quizState.currentQuestionIndex === 0}
											className="flex-1"
										>
											Previous
										</Button>

										{quizState.selectedAnswers[
											quizState.questions[quizState.currentQuestionIndex].id
										] && (
											<Button
												onClick={handleNext}
												className="flex-1 bg-linear-to-r text-white from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
											>
												{quizState.currentQuestionIndex === quizState.questions.length - 1
													? 'Finish Quiz'
													: 'Next'}
											</Button>
										)}
									</div>
								</div>

								{/* <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-4">
									<Progress
										value={
											((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100
										}
										className="h-2"
									/>
									<div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mt-2">
										<span>Progress</span>
										<span>
											{Math.round(
												((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100
											)}
											%
										</span>
									</div>
								</div> */}
							</motion.div>
						)}
					</motion.div>
				)}

				{screen === 'results' && (
					<motion.div
						key="results"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="flex flex-col h-full"
					>
						<motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setScreen('selection')}
								className="rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm"
							>
								<ArrowLeft className="w-5 h-5" />
							</Button>
							<h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
								Quiz Results
							</h1>
							<div className="w-10" />
						</motion.div>

						<motion.div variants={itemVariants} className="flex-1">
							<Card className="flex-1 flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
								<div className="text-center mb-8">
									<TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-500" />
									<h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
									<p className="text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2">
										<Clock className="w-4 h-4" />
										Time taken: {getTimeTaken()}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
									<Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20">
										<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
											{calculateScore()}/{quizState.questions.length}
										</div>
										<div className="text-sm text-zinc-600 dark:text-zinc-300">Correct Answers</div>
									</Card>

									<Card className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">
										<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
											{getGrade(calculateScore())}
										</div>
										<div className="text-sm text-zinc-600 dark:text-zinc-300">Grade</div>
									</Card>
								</div>

								<div className="w-full max-w-md space-y-3 mb-8">
									{quizState.questions.map((question, index) => {
										const selectedOption = quizState.selectedAnswers[question.id];
										const correctOption = question.options?.find((opt) => opt.isCorrect);
										const isCorrect = selectedOption === correctOption?.optionLetter;

										return (
											<div
												key={question.id}
												className={`p-3 rounded-lg flex items-center justify-between ${
													isCorrect
														? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
														: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
												}`}
											>
												<span className="font-medium">Question {index + 1}</span>
												{isCorrect ? (
													<CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
												) : (
													<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
												)}
											</div>
										);
									})}
								</div>

								<div className="flex gap-4">
									<Button variant="outline" onClick={resetQuiz}>
										New Quiz
									</Button>
									<Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
								</div>
							</Card>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

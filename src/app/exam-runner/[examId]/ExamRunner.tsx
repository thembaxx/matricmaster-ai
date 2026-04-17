'use client';

import {
	ArrowLeft01Icon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ClockIcon,
	FlagIcon,
	HomeIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { SUBJECTS } from '@/content';

interface ExamRunnerProps {
	examId: string;
	userId: string;
	subject: string;
	papers: string[];
	questionCount: number | null;
	timeLimit: number;
	includeWeakTopics: boolean;
}

interface Question {
	id: string;
	question: string;
	options?: string[];
	correctAnswer: string;
	topic?: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

const generateMockQuestions = (subject: string, count: number): Question[] => {
	const subjectQuestions: Record<string, Question[]> = {
		mathematics: Array.from({ length: 50 }, (_, i) => ({
			id: `math-q${i + 1}`,
			question: `Calculate the value of x: ${2 + i} + x = ${10 + i}`,
			options: [`${8 + i}`, `${7 + i}`, `${9 + i}`, `${6 + i}`],
			correctAnswer: `${8 + i}`,
			topic: 'Algebra',
			difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
		})),
		physics: Array.from({ length: 50 }, (_, i) => ({
			id: `phys-q${i + 1}`,
			question: 'What is the SI unit of force?',
			options: ['Newton', 'Joule', 'Watt', 'Pascal'],
			correctAnswer: 'Newton',
			topic: 'Mechanics',
			difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
		})),
	};

	const questions = subjectQuestions[subject] || subjectQuestions.mathematics;
	const shuffled = [...questions].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};

export default function ExamRunner(props: ExamRunnerProps) {
	const {
		examId: _examId,
		userId: _userId,
		subject,
		papers: _papers,
		questionCount,
		timeLimit,
		includeWeakTopics: _includeWeakTopics,
	} = props;
	const router = useRouter();
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
	const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [showResults, setShowResults] = useState(false);

	const subjectData = SUBJECTS[subject as keyof typeof SUBJECTS];

	useEffect(() => {
		const count = questionCount || 30;
		const mockQuestions = generateMockQuestions(subject, count);
		setQuestions(mockQuestions);
	}, [subject, questionCount]);

	useEffect(() => {
		if (timeRemaining <= 0 && !isSubmitted) {
			handleSubmit();
			return;
		}

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleSubmit();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timeRemaining, isSubmitted]);

	const handleSubmit = useCallback(() => {
		setIsSubmitted(true);
		setShowResults(true);
	}, []);

	const handleAnswerSelect = (answer: string) => {
		const question = questions[currentIndex];
		setSelectedAnswer(answer);
		setAnswers((prev) => ({ ...prev, [question.id]: answer }));
	};

	const handleFlag = () => {
		const question = questions[currentIndex];
		setFlaggedQuestions((prev) => {
			const next = new Set(prev);
			if (next.has(question.id)) {
				next.delete(question.id);
			} else {
				next.add(question.id);
			}
			return next;
		});
	};

	const handleExit = () => {
		setShowExitDialog(true);
	};

	const handleConfirmExit = () => {
		router.push('/exam-builder');
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const calculateScore = () => {
		let correct = 0;
		questions.forEach((q) => {
			if (answers[q.id] === q.correctAnswer) {
				correct++;
			}
		});
		return {
			correct,
			total: questions.length,
			percentage: Math.round((correct / questions.length) * 100),
		};
	};

	if (questions.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading exam...</p>
				</div>
			</div>
		);
	}

	if (showResults) {
		const score = calculateScore();
		return (
			<div className="min-h-screen pb-40 pt-8 px-4">
				<div className="max-w-2xl mx-auto space-y-6">
					<Card>
						<CardContent className="p-8 text-center">
							<div className="text-6xl mb-4">
								{score.percentage >= 70 ? '🎉' : score.percentage >= 50 ? '📚' : '💪'}
							</div>
							<h1 className="text-3xl font-display font-bold mb-2">
								{score.percentage >= 70
									? 'Excellent!'
									: score.percentage >= 50
										? 'Good Effort!'
										: 'Keep Practicing!'}
							</h1>
							<p className="text-muted-foreground mb-6">
								You completed the {subjectData?.name || subject} exam
							</p>
							<div className="grid grid-cols-3 gap-4 mb-6">
								<div className="p-4 rounded-lg bg-muted">
									<p className="text-3xl font-bold font-mono">{score.percentage}%</p>
									<p className="text-sm text-muted-foreground">Score</p>
								</div>
								<div className="p-4 rounded-lg bg-muted">
									<p className="text-3xl font-bold font-mono text-green-500">{score.correct}</p>
									<p className="text-sm text-muted-foreground">Correct</p>
								</div>
								<div className="p-4 rounded-lg bg-muted">
									<p className="text-3xl font-bold font-mono text-red-500">
										{score.total - score.correct}
									</p>
									<p className="text-sm text-muted-foreground">Wrong</p>
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="font-semibold text-left">Question Summary</h3>
								<div className="flex flex-wrap gap-2">
									{questions.map((q, i) => (
										<div
											key={q.id}
											className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
												answers[q.id] === q.correctAnswer
													? 'bg-green-500/20 text-green-500'
													: answers[q.id]
														? 'bg-red-500/20 text-red-500'
														: 'bg-muted text-muted-foreground'
											}`}
										>
											{i + 1}
										</div>
									))}
								</div>
							</div>
							<div className="flex gap-4 mt-6">
								<Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
									<HugeiconsIcon icon={HomeIcon} className="mr-2 h-4 w-4" />
									Go Home
								</Button>
								<Button className="flex-1" onClick={() => router.push('/exam-builder')}>
									Practice Again
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentIndex];
	const progress = ((currentIndex + 1) / questions.length) * 100;
	const isFlagged = flaggedQuestions.has(currentQuestion.id);

	return (
		<div className="min-h-screen pb-40">
			<div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
				<div className="max-w-4xl mx-auto px-4 py-3">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="sm" onClick={handleExit}>
								<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
								Exit
							</Button>
							<div>
								<p className="font-semibold">
									{subjectData?.emoji} {subjectData?.name || subject}
								</p>
								<p className="text-sm text-muted-foreground">
									Question {currentIndex + 1} of {questions.length}
								</p>
							</div>
						</div>
						<div
							className={`flex items-center gap-2 px-3 py-1 rounded-full ${
								timeRemaining < 300 ? 'bg-red-500/20 text-red-500' : 'bg-muted'
							}`}
						>
							<HugeiconsIcon icon={ClockIcon} className="w-4 h-4" />
							<span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
						</div>
					</div>
					<Progress value={progress} className="h-2" />
				</div>
			</div>

			<div className="pt-24 px-4">
				<div className="max-w-2xl mx-auto space-y-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{currentQuestion.topic && (
											<>
												<span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-sm">
													{currentQuestion.topic}
												</span>
											</>
										)}
									</span>
									{currentQuestion.difficulty && (
										<span
											className={`px-2 py-0.5 rounded text-sm ${
												currentQuestion.difficulty === 'easy'
													? 'bg-green-500/20 text-green-500'
													: currentQuestion.difficulty === 'medium'
														? 'bg-yellow-500/20 text-yellow-500'
														: 'bg-red-500/20 text-red-500'
											}`}
										>
											{currentQuestion.difficulty}
										</span>
									)}
								</div>
								<Button variant={isFlagged ? 'default' : 'outline'} size="sm" onClick={handleFlag}>
									<HugeiconsIcon icon={FlagIcon} className="mr-2 h-4 w-4" />
									{isFlagged ? 'Flagged' : 'Flag'}
								</Button>
							</div>

							<h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

							{currentQuestion.options && (
								<div className="space-y-3">
									{currentQuestion.options.map((option, i) => (
										<button
											key={i}
											onClick={() => handleAnswerSelect(option)}
											className={`w-full p-4 rounded-lg border text-left transition-colors ${
												selectedAnswer === option
													? 'border-primary bg-primary/10'
													: 'hover:bg-muted'
											}`}
										>
											<span className="font-mono mr-3">{String.fromCharCode(65 + i)}.</span>
											{option}
										</button>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<div className="flex items-center justify-between">
						<Button
							variant="outline"
							disabled={currentIndex === 0}
							onClick={() => setCurrentIndex((prev) => prev - 1)}
						>
							<HugeiconsIcon icon={ArrowLeftIcon} className="mr-2 h-4 w-4" />
							Previous
						</Button>

						<div className="flex gap-1">
							{Array.from({ length: Math.min(5, questions.length) }, (_, i) => {
								const qIndex = Math.max(0, currentIndex - 2) + i;
								if (qIndex >= questions.length) return null;
								const q = questions[qIndex];
								const isAnswered = !!answers[q.id];
								const isCurrent = qIndex === currentIndex;
								return (
									<button
										key={qIndex}
										onClick={() => setCurrentIndex(qIndex)}
										className={`w-8 h-8 rounded-full text-sm ${
											isCurrent
												? 'bg-primary text-primary-foreground'
												: isAnswered
													? 'bg-green-500/20 text-green-500'
													: 'bg-muted'
										}`}
									>
										{qIndex + 1}
									</button>
								);
							})}
						</div>

						{currentIndex < questions.length - 1 ? (
							<Button onClick={() => setCurrentIndex((prev) => prev + 1)}>
								Next
								<HugeiconsIcon icon={ArrowRightIcon} className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Button onClick={handleSubmit}>Submit Exam</Button>
						)}
					</div>

					<p className="text-center text-sm text-muted-foreground">
						{Object.keys(answers).length} of {questions.length} answered
						{flaggedQuestions.size > 0 && ` • ${flaggedQuestions.size} flagged for review`}
					</p>
				</div>
			</div>

			<Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Exit Exam?</DialogTitle>
						<DialogDescription>
							Are you sure you want to exit? Your progress will be lost.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowExitDialog(false)}>
							Continue Exam
						</Button>
						<Button variant="destructive" onClick={handleConfirmExit}>
							Exit Anyway
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

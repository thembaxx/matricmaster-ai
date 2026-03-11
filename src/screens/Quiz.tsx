'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

interface QuizStep {
	id: string;
	emoji: string;
	title: string;
	status: 'completed' | 'current' | 'upcoming';
}

interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

const QUIZ_STEPS: QuizStep[] = [
	{ id: '1', emoji: '📋', title: 'Review', status: 'completed' },
	{ id: '2', emoji: '🧮', title: 'Problem', status: 'current' },
	{ id: '3', emoji: '🎯', title: 'Practice', status: 'upcoming' },
	{ id: '4', emoji: '✅', title: 'Done', status: 'upcoming' },
];

const QUESTION_OPTIONS: QuestionOption[] = [
	{ id: 'A', label: '(1, 0)', isCorrect: false },
	{ id: 'B', label: '(-1, 4)', isCorrect: true },
	{ id: 'C', label: '(0, 2)', isCorrect: false },
	{ id: 'D', label: '(1, 4)', isCorrect: false },
];

export default function Quiz() {
	const router = useRouter();
	const startTimeRef = useRef<number>(Date.now());
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleCheck = () => {
		if (isChecked) {
			if (isCorrect) {
				const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
				useQuizResultStore.getState().save({
					correctAnswers: 1,
					totalQuestions: 1,
					durationSeconds,
					accuracy: 100,
					subjectName: 'Mathematics',
					subjectId: 2,
					difficulty: 'medium',
					topic: 'Algebra',
					completedAt: new Date(),
				});
				router.push('/lesson-complete');
			} else {
				setIsChecked(false);
				setIsCorrect(null);
				setSelectedOption(null);
				setShowExplanation(false);
			}
			return;
		}

		const option = QUESTION_OPTIONS.find((o) => o.id === selectedOption);
		const correct = option?.isCorrect || false;
		setIsCorrect(correct);
		setIsChecked(true);
		if (correct) setShowExplanation(true);
	};

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				{/* Progress Header */}
				<m.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 tiimo-transition"
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="text-2xl">🧮</span>
							<div>
								<h1 className="text-lg font-display font-bold">Calculus</h1>
								<p className="text-sm text-muted-foreground">Mathematics P1 • NSC</p>
							</div>
						</div>
						<span className="font-mono text-muted-foreground">{formatTime(elapsedSeconds)}</span>
					</div>

					{/* Step List */}
					<div className="flex items-center gap-2 mb-4">
						{QUIZ_STEPS.map((step, index) => (
							<m.div
								key={step.id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
								className={cn(
									'flex flex-col items-center gap-1 p-2 rounded-xl flex-1',
									step.status === 'current'
										? 'bg-primary-soft ring-2 ring-primary'
										: step.status === 'completed'
											? 'bg-success-soft'
											: 'bg-muted opacity-50'
								)}
							>
								<span className="text-xl">{step.emoji}</span>
								<span className="text-[10px] font-medium">{step.title}</span>
							</m.div>
						))}
					</div>

					{/* Progress Bar */}
					<div className="h-2 bg-border rounded-full overflow-hidden">
						<m.div
							className="h-full bg-primary rounded-full"
							initial={{ width: 0 }}
							animate={{ width: '50%' }}
							transition={{ duration: 0.5 }}
						/>
					</div>
				</m.header>

				<ScrollArea className="h-[calc(100vh-320px)] no-scrollbar">
					<div className="space-y-6">
						{/* Question Card */}
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
						>
							<div className="tiimo-card p-6 rounded-3xl border border-border shadow-sm">
								<div className="mb-6">
									<span className="inline-block px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
										Local extrema
									</span>
									<h2 className="text-xl font-semibold leading-relaxed">
										Find the coordinates of the local maximum for the function f(x) = x³ - 3x + 2
									</h2>
								</div>

								{/* Graph visualization */}
								<div className="w-full h-48 bg-muted rounded-2xl mb-6 relative overflow-hidden">
									<svg viewBox="0 0 300 150" className="w-full h-full">
										<title>Graph of f(x) = x³ - 3x + 2</title>
										{/* Axes */}
										<line
											x1="150"
											y1="10"
											x2="150"
											y2="140"
											stroke="currentColor"
											strokeWidth="0.5"
											className="text-border"
										/>
										<line
											x1="10"
											y1="75"
											x2="290"
											y2="75"
											stroke="currentColor"
											strokeWidth="0.5"
											className="text-border"
										/>

										{/* Curve */}
										<path
											d="M 40 120 Q 100 20, 150 75 T 260 30"
											fill="none"
											stroke="var(--primary)"
											strokeWidth="3"
											strokeLinecap="round"
										/>

										{/* Max point */}
										<circle cx="110" cy="45" r="5" fill="var(--color-success)" />
										<text x="95" y="35" fontSize="10" className="fill-muted-foreground">
											Max
										</text>
									</svg>
								</div>

								{/* Options */}
								<div className="space-y-3">
									{QUESTION_OPTIONS.map((option, index) => (
										<m.button
											key={option.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											onClick={() => !isChecked && setSelectedOption(option.id)}
											disabled={isChecked}
											className={cn(
												'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all tiimo-press',
												selectedOption === option.id
													? isChecked
														? option.isCorrect
															? 'bg-success-soft border-success'
															: 'bg-destructive-soft border-destructive'
														: 'bg-primary-soft border-primary'
													: isChecked && option.isCorrect
														? 'bg-success-soft border-success'
														: 'bg-card/50 border-border hover:border-primary/50'
											)}
										>
											<div
												className={cn(
													'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors',
													selectedOption === option.id
														? isChecked
															? option.isCorrect
																? 'bg-success text-white'
																: 'bg-destructive text-white'
															: 'bg-primary text-primary-foreground'
														: isChecked && option.isCorrect
															? 'bg-success text-white'
															: 'bg-muted text-muted-foreground'
												)}
											>
												{option.id}
											</div>
											<span className="flex-1 text-left font-medium text-lg">{option.label}</span>

											{isChecked && selectedOption === option.id && (
												<m.span
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													className={cn(
														'text-2xl',
														option.isCorrect ? 'text-success' : 'text-destructive'
													)}
												>
													{option.isCorrect ? '✓' : '✕'}
												</m.span>
											)}
										</m.button>
									))}
								</div>
							</div>
						</m.div>

						{/* Hint */}
						<AnimatePresence>
							{showHint && (
								<m.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									className="bg-priority-medium-soft rounded-2xl p-4 border border-priority-medium/30"
								>
									<div className="flex items-start gap-3">
										<span className="text-2xl">💡</span>
										<div>
											<p className="font-semibold text-priority-medium mb-1">Hint</p>
											<p className="text-sm">
												A local maximum occurs where f'(x) = 0 and f''(x) is negative
											</p>
										</div>
									</div>
								</m.div>
							)}
						</AnimatePresence>

						{/* Explanation */}
						<AnimatePresence>
							{showExplanation && (
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 20 }}
								>
									<div className="tiimo-card p-6 rounded-3xl bg-success-soft border-success/20">
										<div className="flex items-center gap-3 mb-4">
											<span className="text-3xl">🎯</span>
											<div>
												<h3 className="font-bold text-success">Great work!</h3>
												<p className="text-xs text-success/80">Here's why this is correct</p>
											</div>
										</div>
										<div className="space-y-3 text-sm">
											<p>
												To find the local maximum, we first find where the derivative equals zero:
											</p>
											<div className="tiimo-card p-3 rounded-2xl text-center font-mono">
												f'(x) = 3x² - 3 = 0
												<br />
												x² = 1
												<br />x = ±1
											</div>
											<p>Then we check the second derivative: f"(x) = 6x</p>
											<p>At x equals -1: f"(-1) equals -6, so this is a local maximum</p>
										</div>
									</div>
								</m.div>
							)}
						</AnimatePresence>
					</div>
				</ScrollArea>

				{/* Actions */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mt-6 space-y-3"
				>
					{!isChecked ? (
						<>
							<Button
								size="lg"
								className="w-full rounded-2xl h-14 text-lg"
								disabled={!selectedOption}
								onClick={handleCheck}
							>
								Check answer
							</Button>
							<button
								type="button"
								onClick={() => setShowHint(!showHint)}
								className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								{showHint ? 'Hide hint' : 'Need a hint?'}
							</button>
						</>
					) : (
						<div className="flex gap-3">
							<Button
								variant="outline"
								size="lg"
								className="flex-1 rounded-2xl h-14"
								onClick={() => router.push('/dashboard')}
							>
								Exit
							</Button>
							<Button size="lg" className="flex-1 rounded-2xl h-14" onClick={handleCheck}>
								{isCorrect ? 'Continue →' : 'Try again'}
							</Button>
						</div>
					)}
				</m.div>
			</FocusContent>
		</div>
	);
}

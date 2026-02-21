'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ArrowLeft, Clock, HelpCircle, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { saveQuizResult } from '@/lib/quiz-result-store';
import { getExplanation } from '@/services/geminiService';

const options = [
	{ id: 'A', expression: '(1, 0)', isCorrect: false },
	{ id: 'B', expression: '(-1, 4)', isCorrect: true },
	{ id: 'C', expression: '(0, 2)', isCorrect: false },
	{ id: 'D', expression: '(1, 4)', isCorrect: false },
];

export default function Quiz() {
	const router = useRouter();
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [showExplanation, setShowExplanation] = useState(false);
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

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const questionContext =
				'Local Extrema - Find the coordinates of the local maximum for f(x) = x³ - 3x + 2';
			const explanation = await getExplanation('Mathematics', questionContext);
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

	const handleCheck = () => {
		if (isChecked) {
			if (isCorrect) {
				const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
				saveQuizResult({
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

		const option = options.find((o) => o.id === selectedOption);
		const correct = option?.isCorrect || false;
		setIsCorrect(correct);
		setIsChecked(true);
		if (correct) setShowExplanation(true);
	};

	return (
		<div className="flex flex-col h-full bg-background font-lexend relative">
			{/* Header */}
			<header className="bg-card/80 backdrop-blur-xl border-b border-border shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="px-6 pt-12 pb-2 flex items-center justify-between">
						<m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.push('/dashboard')}
								className="rounded-full"
							>
								<ArrowLeft className="w-6 h-6" />
							</Button>
						</m.div>
						<div className="text-center">
							<h1 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
								Mathematics P1
							</h1>
							<p className="text-sm font-black text-foreground">Nov 2023 • NSC</p>
						</div>
						<Badge
							variant="outline"
							className="text-[10px] font-bold text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
						>
							<Clock className="w-3 h-3 mr-1" />
							{formatTime(elapsedSeconds)}
						</Badge>
					</div>
					{/* Progress */}
					<div className="px-6 pb-6">
						<div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
							<m.div
								initial={{ width: '20%' }}
								animate={{ width: '33.3%' }}
								transition={{ duration: 1, type: 'spring' }}
								className="absolute top-0 left-0 h-full bg-brand-green rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
							/>
						</div>
						<div className="flex justify-between items-center text-[10px] font-black tracking-widest text-muted-foreground uppercase">
							<span className="flex items-center gap-1.5">
								<m.span
									animate={{ scale: [1, 1.5, 1] }}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
									className="w-1.5 h-1.5 rounded-full bg-brand-green"
								/>
								Algebra
							</span>
							<span>Question 3/12</span>
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 pb-48 max-w-2xl mx-auto w-full space-y-8">
					<div className="space-y-3">
						<SmoothWords
							as="h2"
							text="Local Extrema"
							className="text-4xl font-black text-foreground leading-tight"
						/>
						<m.p
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="text-muted-foreground font-medium leading-relaxed"
						>
							Find the coordinates of the local maximum for the function graphed below.
						</m.p>
					</div>
					{/* Equation & Graph Card */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Card className="p-8 flex flex-col items-center justify-center bg-card border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

							{/* Math Function */}
							<m.div
								whileHover={{ scale: 1.1 }}
								className="text-2xl font-serif italic font-bold text-foreground mb-6 relative z-10"
							>
								f(x) = x³ - 3x + 2
							</m.div>

							{/* SVG Graph Visualization */}
							<div className="w-full h-48 relative mb-6 z-10 bg-muted/50 rounded-2xl border border-border flex items-center justify-center overflow-hidden">
								<svg viewBox="0 0 200 120" className="w-full h-full p-4">
									<title>Graph of f(x) = x³ - 3x + 2</title>
									<line
										x1="0"
										y1="60"
										x2="200"
										y2="60"
										stroke="currentColor"
										strokeWidth="0.5"
										className="text-border"
									/>
									<line
										x1="100"
										y1="0"
										x2="100"
										y2="120"
										stroke="currentColor"
										strokeWidth="0.5"
										className="text-border"
									/>

									<m.path
										d="M 20 100 Q 60 20 100 60 T 180 20"
										fill="none"
										stroke="var(--primary)"
										strokeWidth="3"
										strokeLinecap="round"
										initial={{ pathLength: 0 }}
										animate={{ pathLength: 1 }}
										transition={{ duration: 2, ease: 'easeInOut' }}
									/>

									<m.circle
										cx="75"
										cy="40"
										r="5"
										fill="#10b981"
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
									/>
									<text
										x="65"
										y="30"
										fontSize="8"
										className="fill-muted-foreground font-black tracking-widest uppercase"
									>
										Max
									</text>
								</svg>
							</div>

							<m.div
								whileHover={{ scale: 1.05 }}
								className="bg-brand-amber/10 text-brand-amber px-6 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest shadow-sm border border-brand-amber/20 relative z-10"
							>
								<Lightbulb className="w-4 h-4 fill-brand-amber" />
								Use f'(x) = 0 to find stationary points
							</m.div>
						</Card>
					</m.div>
					{/* Options Grid */}
					<m.div
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-2 gap-4"
					>
						{options.map((option) => {
							const isSelected = selectedOption === option.id;
							let stateClasses =
								'bg-card text-foreground border-border hover:border-primary/30 hover:shadow-md';

							if (isSelected) {
								if (isChecked) {
									stateClasses = option.isCorrect
										? 'bg-brand-green text-white border-transparent shadow-xl shadow-brand-green/20'
										: 'bg-brand-red text-white border-transparent shadow-xl shadow-brand-red/20';
								} else {
									stateClasses = 'bg-foreground text-background border-transparent shadow-xl';
								}
							}

							return (
								<m.button
									variants={STAGGER_ITEM}
									whileHover={!isChecked ? { scale: 1.02, y: -4 } : {}}
									whileTap={!isChecked ? { scale: 0.98 } : {}}
									type="button"
									key={option.id}
									disabled={isChecked}
									onClick={() => setSelectedOption(option.id)}
									className={`p-6 rounded-[2.5rem] border-2 transition-all h-44 flex flex-col items-center justify-center gap-4 relative group ${stateClasses}`}
								>
									<div
										className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${
											isSelected
												? isChecked
													? 'bg-white/20 text-white'
													: 'bg-background/20 text-foreground'
												: 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
										}`}
									>
										{option.id}
									</div>
									<span className="font-serif italic font-bold text-xl">{option.expression}</span>

									<AnimatePresence>
										{isChecked && isSelected && option.isCorrect && (
											<m.div
												initial={{ scale: 0.95, opacity: 0, rotate: -45 }}
												animate={{ scale: 1, rotate: 0 }}
												className="absolute -top-2 -right-2 w-8 h-8 bg-white text-brand-green rounded-full flex items-center justify-center shadow-lg"
											>
												<Sparkles className="w-4 h-4 fill-brand-green" />
											</m.div>
										)}
									</AnimatePresence>
								</m.button>
							);
						})}
					</m.div>
					{/* Explanation Card (Aha! Moment) */}
					<AnimatePresence>
						{showExplanation && (
							<m.div
								initial={{ opacity: 0, height: 0, y: 20 }}
								animate={{ opacity: 1, height: 'auto', y: 0 }}
								exit={{ opacity: 0, height: 0 }}
							>
								<Card className="p-8 bg-brand-green/5 border-2 border-brand-green/20 rounded-[2.5rem] space-y-6">
									<div className="flex items-center gap-4">
										<m.div
											animate={{ rotate: [0, 15, 0] }}
											transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
											className="w-12 h-12 bg-brand-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20"
										>
											<Sparkles className="w-6 h-6" />
										</m.div>
										<div>
											<h4 className="font-black text-brand-green text-lg">Aha! Moment</h4>
											<p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
												The "Why" behind the math
											</p>
										</div>
									</div>

									<div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
										<p>
											To find the local maximum, we first find where the slope (derivative) is zero:
										</p>
										<div className="bg-card p-4 rounded-2xl font-serif italic text-center text-lg border border-border">
											f'(x) = 3x² - 3 = 0 <br />
											3(x² - 1) = 0 <br />x = 1 or x = -1
										</div>
										<p>
											By checking the second derivative <span className="italic">f''(x) = 6x</span>,
											we see that <span className="italic">f''(-1) = -6</span> (negative), which
											confirms a local maximum at <span className="italic">x = -1</span>.
										</p>
									</div>
								</Card>
							</m.div>
						)}
					</AnimatePresence>
					{/* ... rest of component ... */}
					{/* Hint Card */}
					<AnimatePresence mode="wait">
						{!showExplanation && (
							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-5 items-start transition-all hover:bg-primary/10"
							>
								<div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
									<Sparkles className="w-6 h-6 text-primary" />
								</div>
								<div className="space-y-1">
									<h4 className="font-black text-primary text-xs uppercase tracking-widest">
										Smart Hint
									</h4>
									<p className="text-sm text-muted-foreground font-medium leading-relaxed">
										A local maximum occurs where the function stops increasing and starts
										decreasing. This always happens at a stationary point.
									</p>
								</div>
							</m.div>
						)}
					</AnimatePresence>
					{/* AI Explanation Toggle */}
					<m.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="p-1 bg-linear-to-r from-primary to-brand-green rounded-[2rem]"
					>
						<div className="bg-card rounded-[1.9rem] p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<m.div
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
										className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
									>
										<Sparkles className="w-5 h-5 text-primary" />
									</m.div>
									<div>
										<h4 className="font-bold text-foreground text-sm">
											Need a deeper explanation?
										</h4>
										<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
											Ask MatricMaster AI
										</p>
									</div>
								</div>
								<Button
									size="sm"
									variant="ghost"
									className="font-black text-primary hover:bg-primary/5"
									onClick={handleExplain}
									disabled={isExplaining}
								>
									{isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
								</Button>
							</div>

							<AnimatePresence>
								{aiExplanation && (
									<m.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										className="pt-4 border-t border-border"
									>
										<p className="text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
											{aiExplanation}
										</p>
									</m.div>
								)}
							</AnimatePresence>
						</div>
					</m.div>
				</main>
			</ScrollArea>

			{/* Floating Footer */}
			<m.footer
				initial={{ y: 100 }}
				animate={{ y: 0 }}
				transition={{ type: 'spring', stiffness: 200, damping: 30 }}
				className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl p-8 z-30 border-t border-border"
			>
				<div className="max-w-2xl mx-auto w-full space-y-6">
					<div className="flex justify-between items-center px-2">
						<button
							type="button"
							className="flex items-center gap-2.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-colors"
						>
							<span className="w-5 h-5 bg-muted rounded-lg flex items-center justify-center">
								?
							</span>
							Report Issue
						</button>
						<button
							type="button"
							className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:text-primary/80 transition-colors"
						>
							<HelpCircle className="w-4 h-4" />
							Show Solution
						</button>
					</div>
					<m.div
						whileHover={selectedOption ? { scale: 1.02 } : {}}
						whileTap={selectedOption ? { scale: 0.98 } : {}}
					>
						<Button
							size="lg"
							onClick={handleCheck}
							className={`w-full h-16 rounded-[2rem] text-lg font-black shadow-2xl transition-all ${
								!selectedOption
									? 'bg-muted text-muted-foreground cursor-not-allowed'
									: isChecked
										? isCorrect
											? 'bg-brand-green hover:bg-brand-green/80 text-white shadow-brand-green/20'
											: 'bg-brand-red hover:bg-red-600 text-white shadow-brand-red/20'
										: 'bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20'
							}`}
							disabled={!selectedOption}
						>
							{isChecked ? (isCorrect ? 'Continue' : 'Try Again') : 'Check Answer'}
						</Button>
					</m.div>
				</div>
			</m.footer>
		</div>
	);
}

'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { QuizFooter, QuizHintCard, QuizOptionsGrid, SimpleQuizHeader } from '@/components/Quiz';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExplanation } from '@/services/geminiService';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

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
			setAiExplanation("Sorry, I couldn't generate an explanation right now.");
		} finally {
			setIsExplaining(false);
		}
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

		const option = options.find((o) => o.id === selectedOption);
		const correct = option?.isCorrect || false;
		setIsCorrect(correct);
		setIsChecked(true);
		if (correct) setShowExplanation(true);
	};

	return (
		<div className="flex flex-col h-full bg-background font-lexend relative">
			<SimpleQuizHeader
				title="Mathematics P1"
				subtitle="Nov 2023 • NSC"
				elapsedSeconds={elapsedSeconds}
				currentQuestion={3}
				totalQuestions={12}
				progressPercent={33.3}
			/>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 pb-48 max-w-2xl mx-auto w-full space-y-8">
					<QuestionSection />
					<GraphCard />
					<QuizOptionsGrid
						options={options}
						selectedOption={selectedOption}
						isChecked={isChecked}
						onSelect={setSelectedOption}
					/>
					<ExplanationCard showExplanation={showExplanation} />
					<QuizHintCard
						hint="A local maximum occurs where the function stops increasing and starts decreasing. This always happens at a stationary point."
						variant="smart"
						showWhen={!showExplanation}
					/>
					<AIExplanationSection
						aiExplanation={aiExplanation}
						isExplaining={isExplaining}
						onExplain={handleExplain}
					/>
				</main>
			</ScrollArea>

			<QuizFooter
				selectedOption={selectedOption}
				isChecked={isChecked}
				isCorrect={isCorrect ?? false}
				hasMoreQuestions={false}
				onCheck={handleCheck}
				onNext={handleCheck}
			/>
		</div>
	);
}

function QuestionSection() {
	return (
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
	);
}

function GraphCard() {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<Card className="p-8 flex flex-col items-center justify-center bg-card border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
				<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

				<m.div
					whileHover={{ scale: 1.1 }}
					className="text-2xl font-serif italic font-bold text-foreground mb-6 relative z-10"
				>
					f(x) = x³ - 3x + 2
				</m.div>

				<FunctionGraph />
				<HintBadge />
			</Card>
		</m.div>
	);
}

function FunctionGraph() {
	return (
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
					fill="var(--color-success)"
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
	);
}

function HintBadge() {
	return (
		<m.div
			whileHover={{ scale: 1.05 }}
			className="bg-brand-amber/10 text-brand-amber px-6 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest shadow-sm border border-brand-amber/20 relative z-10"
		>
			<Lightbulb className="w-4 h-4 fill-brand-amber" />
			Use f'(x) = 0 to find stationary points
		</m.div>
	);
}

type ExplanationCardProps = {
	showExplanation: boolean;
};

function ExplanationCard({ showExplanation }: ExplanationCardProps) {
	return (
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
							<p>To find the local maximum, we first find where the slope (derivative) is zero:</p>
							<div className="bg-card p-4 rounded-2xl font-serif italic text-center text-lg border border-border">
								f'(x) = 3x² - 3 = 0 <br />
								3(x² - 1) = 0 <br />x = 1 or x = -1
							</div>
							<p>
								By checking the second derivative <span className="italic">f''(x) = 6x</span>, we
								see that <span className="italic">f''(-1) = -6</span> (negative), which confirms a
								local maximum at <span className="italic">x = -1</span>.
							</p>
						</div>
					</Card>
				</m.div>
			)}
		</AnimatePresence>
	);
}

type AIExplanationSectionProps = {
	aiExplanation: string | null;
	isExplaining: boolean;
	onExplain: () => void;
};

function AIExplanationSection({
	aiExplanation,
	isExplaining,
	onExplain,
}: AIExplanationSectionProps) {
	return (
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
							<h4 className="font-bold text-foreground text-sm">Need a deeper explanation?</h4>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
								Ask MatricMaster AI
							</p>
						</div>
					</div>
					<Button
						size="sm"
						variant="ghost"
						className="font-black text-primary hover:bg-primary/5"
						onClick={onExplain}
						disabled={isExplaining}
					>
						{isExplaining ? '...' : 'Explain'}
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
	);
}

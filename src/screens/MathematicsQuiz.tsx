'use client';

import { ArrowLeft, CheckCircle2, GripVertical, Lightbulb, X, ChevronLeft, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AIExplanationCard } from '@/components/AI/AIExplanationCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getExplanation } from '@/services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const mathSymbols = ['√', 'x²', '∫', 'd/dx', 'lim', 'Σ', '∞', 'π', 'e', 'ln', 'sin', 'cos', 'tan'];

const steps = [
	{ id: 1, text: '∫3x² dx = x³', correct: true },
	{ id: 2, text: '∫2x dx = x²', correct: true },
	{ id: 3, text: 'Add constant C', correct: true },
	{ id: 4, text: 'x³ + x² + C', correct: true },
];

export default function MathematicsQuiz() {
	const router = useRouter();
	const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const availableSteps = steps;

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const questionContext = 'Find the integral: ∫(3x² + 2x) dx';
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

	const handleStepClick = (stepId: number) => {
		if (selectedSteps.includes(stepId)) {
			setSelectedSteps((prev) => prev.filter((id) => id !== stepId));
		} else {
			setSelectedSteps((prev) => [...prev, stepId]);
		}
	};

	const insertSymbol = (symbol: string) => {
		console.log('Insert symbol:', symbol);
	};

	return (
		<div className="fixed inset-0 flex flex-col w-full min-w-0 bg-background overflow-hidden">
			{/* Modern Header */}
			<header className="px-6 py-8 bg-card/50 backdrop-blur-2xl sticky top-0 z-20 border-b border-border/50 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-6">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/past-papers')}
							className="rounded-2xl h-12 w-12 bg-muted/50"
							aria-label="Back"
						>
							<ChevronLeft className="w-6 h-6" />
						</Button>
						<div className="flex-1 space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
									Question 5 of 20
								</span>
								<Badge
									variant="violet"
									size="sm"
									className="rounded-xl"
								>
									Integration
								</Badge>
							</div>
							<Progress value={25} variant="violet" className="h-2.5" />
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto w-full scroll-smooth">
				<main className="px-6 py-10 space-y-10 pb-64 max-w-2xl mx-auto w-full">
					{/* Question Card */}
					<div className="space-y-6">
						<h2 className="text-3xl font-heading font-black text-foreground tracking-tight text-center">
							Solve the integral
						</h2>
						<Card variant="elevated" className="overflow-hidden border-2 border-primary-violet/10 group">
							<div className="p-12 text-center bg-gradient-to-br from-primary-violet/5 via-transparent to-primary-cyan/5">
								<span className="text-4xl font-mono font-black text-primary-violet tracking-tight">
									∫(3x² + 2x) dx
								</span>
							</div>
						</Card>
					</div>

					{/* Solution Workspace */}
					<div className="space-y-4">
						<div className="flex items-center justify-between px-1">
							<h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
								Your Solution
							</h3>
							{selectedSteps.length > 0 && (
								<button
									onClick={() => setSelectedSteps([])}
									className="text-[10px] font-bold text-destructive uppercase tracking-widest hover:underline"
								>
									Clear All
								</button>
							)}
						</div>
						<div className="min-h-[160px] p-6 bg-muted/30 rounded-[2rem] border-2 border-dashed border-border flex flex-col gap-3">
							<AnimatePresence mode="popLayout">
								{selectedSteps.length === 0 ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2"
									>
										<BrainCircuit className="w-8 h-8 opacity-20" />
										<p className="text-xs font-bold uppercase tracking-widest opacity-40">
											Tap fragments to build path
										</p>
									</motion.div>
								) : (
									selectedSteps.map((stepId, index) => {
										const step = steps.find((s) => s.id === stepId);
										return (
											<motion.div
												key={stepId}
												layout
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, scale: 0.95 }}
												className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border group"
											>
												<span className="w-8 h-8 rounded-xl bg-primary-violet text-white text-xs flex items-center justify-center font-black shadow-lg shadow-primary-violet/20">
													{index + 1}
												</span>
												<span className="font-mono font-bold text-foreground flex-1">
													{step?.text}
												</span>
												<Button
													variant="tertiary"
													size="icon"
													className="h-8 w-8 text-muted-foreground hover:text-destructive"
													onClick={() => handleStepClick(stepId)}
												>
													<X className="w-4 h-4" />
												</Button>
											</motion.div>
										);
									})
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Fragments Pool */}
					<div className="space-y-4">
						<h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">
							Step Fragments
						</h3>
						<div className="grid grid-cols-1 gap-3">
							<AnimatePresence mode="popLayout">
								{availableSteps
									.filter((s) => !selectedSteps.includes(s.id))
									.map((step) => (
										<motion.button
											layout
											type="button"
											key={step.id}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.9 }}
											onClick={() => handleStepClick(step.id)}
											className="p-5 bg-card border-2 border-border rounded-2xl text-left hover:border-primary-violet/50 transition-all hover:shadow-md active:scale-[0.98] group flex items-center gap-4"
										>
											<div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary-violet/10 transition-colors">
												<GripVertical className="w-5 h-5 text-muted-foreground group-hover:text-primary-violet" />
											</div>
											<span className="font-mono font-bold text-foreground">
												{step.text}
											</span>
										</motion.button>
									))}
							</AnimatePresence>
						</div>
					</div>

					{/* Teacher's Hint */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						className="p-6 bg-primary-orange/10 border-2 border-primary-orange/20 rounded-[2rem] flex items-start gap-4"
					>
						<div className="w-12 h-12 rounded-2xl bg-primary-orange/20 flex items-center justify-center shrink-0">
							<Lightbulb className="w-6 h-6 text-primary-orange" />
						</div>
						<div className="space-y-1">
							<h4 className="font-black text-primary-orange text-xs uppercase tracking-widest">
								Pro Tip
							</h4>
							<p className="text-sm text-foreground font-medium leading-relaxed">
								Remember the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Don't forget the constant!
							</p>
						</div>
					</motion.div>

					<AIExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject="Mathematics"
					/>
				</main>
			</div>

			{/* Action Dock */}
			<footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-2xl border-t border-border/50 z-30 pb-safe">
				<div className="max-w-2xl mx-auto w-full p-6 space-y-6">
					{/* Symbol Strip */}
					<div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
						{mathSymbols.map((symbol) => (
							<button
								type="button"
								key={symbol}
								onClick={() => insertSymbol(symbol)}
								className="h-10 px-4 bg-muted rounded-xl text-sm font-mono font-black hover:bg-primary-violet hover:text-white transition-all whitespace-nowrap shadow-sm active:scale-90"
							>
								{symbol}
							</button>
						))}
					</div>

					<div className="flex gap-4">
						<Button
							variant="outline"
							className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest"
							leftIcon={<Lightbulb className="w-5 h-5 text-primary-orange" />}
						>
							Hint
						</Button>
						<Button
							variant="primary"
							className="flex-1 h-14 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl"
							disabled={selectedSteps.length === 0}
							onClick={() => router.push('/lesson-complete')}
							rightIcon={<CheckCircle2 className="w-6 h-6" />}
						>
							Check
						</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}

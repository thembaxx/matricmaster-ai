'use client';

import { ArrowLeft, CheckCircle, DotsSixVertical, Lightbulb, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AIExplanationCard } from '@/components/AI/AIExplanationCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getExplanation } from '@/services/geminiService';

// import type { Screen } from '@/types'; // Removed unused import

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
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-background/80 backdrop-blur-xl sticky top-0 z-20 border-b border-border shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4 mb-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="rounded-full"
							aria-label="Back to dashboard"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex justify-between items-center mb-2">
								<span className="text-[10px] font-black text-label-tertiary uppercase tracking-widest">
									Question 1 of 5
								</span>
								<Badge
									variant="secondary"
									className="text-[10px] font-black uppercase tracking-tighter rounded-full bg-primary/10 text-primary border-none"
								>
									Integration
								</Badge>
							</div>
							<Progress value={20} className="h-2 rounded-full" />
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto w-full scroll-smooth">
				<main className="px-6 py-8 space-y-8 pb-64 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-4">
						<h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">
							Find the integral
						</h2>
						<Card className="p-12 bg-card border border-border rounded-3xl shadow-sm relative overflow-hidden group">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="text-center relative z-10">
								<span className="text-4xl font-mono font-black text-foreground tracking-tighter uppercase">
									∫(3x² + 2x) dx
								</span>
							</div>
						</Card>
					</div>

					{/* Selected Steps Area */}
					<div className="space-y-4">
						<h3 className="text-[10px] font-black uppercase text-label-tertiary tracking-[0.2em] px-1">
							Your Solution Path
						</h3>
						<div className="min-h-[160px] p-6 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20">
							{selectedSteps.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-label-tertiary space-y-2">
									<p className="text-[10px] font-black uppercase tracking-widest">
										Tap steps below to solve
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{selectedSteps.map((stepId, index) => {
										const step = steps.find((s) => s.id === stepId);
										return (
											<div
												key={stepId}
												className="flex items-center gap-4 p-5 bg-card rounded-2xl shadow-sm border border-primary/10 animate-in fade-in slide-in-from-left-2 ios-active-scale"
											>
												<span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-black">
													{index + 1}
												</span>
												<span className="font-mono font-black text-foreground flex-1 uppercase tracking-tight">
													{step?.text}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive ios-active-scale"
													onClick={() => handleStepClick(stepId)}
													aria-label="Remove step"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* Available Steps Pool */}
					<div className="space-y-4">
						<h3 className="text-[10px] font-black uppercase text-label-tertiary tracking-[0.2em] px-1">
							Step Fragments
						</h3>
						<div className="grid grid-cols-1 gap-3">
							{availableSteps
								.filter((s) => !selectedSteps.includes(s.id))
								.map((step) => (
									<button
										type="button"
										key={step.id}
										onClick={() => handleStepClick(step.id)}
										className="p-6 bg-card border border-border rounded-3xl text-left hover:border-primary transition-all hover:shadow-md active:scale-[0.98] group ios-active-scale"
									>
										<div className="flex items-center gap-4">
											<div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
												<DotsSixVertical className="w-4 h-4 text-label-tertiary group-hover:text-primary" />
											</div>
											<span className="font-mono font-black text-label-secondary uppercase tracking-tight">
												{step.text}
											</span>
										</div>
									</button>
								))}
						</div>
					</div>

					{/* Hint */}
					<div className="p-6 bg-warning/10 border border-warning/20 rounded-3xl flex items-start gap-4">
						<div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
							<Lightbulb className="w-5 h-5 text-warning" />
						</div>
						<div>
							<h4 className="font-black text-warning text-[10px] uppercase tracking-widest mb-1">
								Teacher's Hint
							</h4>
							<p className="text-sm text-label-secondary font-black uppercase tracking-tight">
								Remember the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
							</p>
						</div>
					</div>

					{/* AI Explanation */}
					<AIExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject="Mathematics"
					/>
				</main>
			</div>

			{/* Math Keyboard & Actions */}
			<footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-30">
				<div className="max-w-2xl mx-auto w-full">
					{/* Math Symbols */}
					<div className="px-6 py-3 overflow-x-auto no-scrollbar">
						<div className="flex gap-2">
							{mathSymbols.map((symbol) => (
								<button
									type="button"
									key={symbol}
									onClick={() => insertSymbol(symbol)}
									className="px-4 py-2.5 bg-secondary rounded-xl text-sm font-mono font-black uppercase hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap ios-active-scale shadow-sm"
								>
									{symbol}
								</button>
							))}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="p-6 pt-2 flex gap-4">
						<Button
							variant="outline"
							className="h-16 px-8 rounded-full font-black uppercase tracking-widest border-border text-[10px] ios-active-scale"
						>
							<Lightbulb className="w-5 h-5 mr-2 text-warning" />
							Hint
						</Button>
						<Button
							className="flex-1 h-16 bg-primary text-primary-foreground rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95 ios-active-scale"
							disabled={selectedSteps.length === 0}
							onClick={() => router.push('/lesson-complete')}
						>
							<CheckCircle className="w-5 h-5 mr-2" />
							Check Answer
						</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}

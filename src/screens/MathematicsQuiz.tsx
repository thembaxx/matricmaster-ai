'use client';

import { ArrowLeft01Icon as ArrowLeft, CheckmarkCircle01Icon as CheckCircle, MoreHorizontalIcon as DotsSixVertical, Lightbulb01Icon as Lightbulb, Cancel01Icon as X } from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExpertExplanationCard } from '@/components/Tutor/ExpertExplanationCard';
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
			console.error('Failed to get expert explanation:', error);
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
		<div className="fixed inset-0 flex flex-col w-full min-w-0 bg-white dark:bg-zinc-950 overflow-hidden">
			{/* Header */}
			<header className="px-8 pt-16 pb-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-20 border-none shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-6 mb-8">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20"
							aria-label="Back to dashboard"
						>
							<ArrowLeft size={24} className="stroke-[3px]" />
						</Button>
						<div className="flex-1 space-y-4">
							<div className="flex justify-between items-end">
								<div className="space-y-1">
									<h1 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] leading-none">
										Mathematics session
									</h1>
									<span className="text-2xl font-black text-primary block tracking-tight">
										Integration
									</span>
								</div>
								<div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Step 1 of 5</div>
							</div>
							<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
								<div className="h-full w-1/5 bg-primary rounded-full shadow-lg" />
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto w-full scroll-smooth no-scrollbar">
				<main className="px-8 py-10 space-y-12 pb-64 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-6">
						<h2 className="text-4xl font-black text-foreground tracking-tight leading-none">
							Find the integral
						</h2>
						<Card className="p-16 bg-card border-none rounded-[3.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden group">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
							<div className="text-center relative z-10">
								<span className="text-5xl font-serif italic font-black text-foreground tracking-tighter">
									∫(3x² + 2x) dx
								</span>
							</div>
						</Card>
					</div>

					{/* Selected Steps Area */}
					<div className="space-y-6">
						<div className="flex items-center gap-4 px-2">
							<h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.4em]">
								Your solution
							</h3>
							<div className="h-px flex-1 bg-muted/10" />
						</div>
						<div className="min-h-[200px] p-8 bg-muted/5 rounded-[3rem] border-4 border-dashed border-muted/10">
							{selectedSteps.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 opacity-30">
									<p className="text-[10px] font-black uppercase tracking-[0.3em]">
										Construct path below
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{selectedSteps.map((stepId, index) => {
										const step = steps.find((s) => s.id === stepId);
										return (
											<m.div
												key={stepId}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												className="flex items-center gap-6 p-6 bg-card rounded-3xl shadow-sm border-none transition-all"
											>
												<div className="w-12 h-12 rounded-2xl bg-primary text-white text-lg flex items-center justify-center font-black shadow-lg shadow-primary/20">
													{index + 1}
												</div>
												<span className="font-serif italic font-black text-2xl text-foreground flex-1">
													{step?.text}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-10 w-10 rounded-xl bg-muted/10 text-tiimo-pink hover:bg-tiimo-pink hover:text-white transition-all"
													onClick={() => handleStepClick(stepId)}
													aria-label="Remove"
												>
													<X size={20} className="stroke-[3px]" />
												</Button>
											</m.div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* Available Steps Pool */}
					<div className="space-y-6">
						<div className="flex items-center gap-4 px-2">
							<h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.4em]">
								Fragments
							</h3>
							<div className="h-px flex-1 bg-muted/10" />
						</div>
						<div className="grid grid-cols-1 gap-4">
							{availableSteps
								.filter((s) => !selectedSteps.includes(s.id))
								.map((step) => (
									<button
										type="button"
										key={step.id}
										onClick={() => handleStepClick(step.id)}
										className="p-8 bg-card border-none rounded-[2.5rem] text-left hover:bg-muted/5 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:shadow-lg active:scale-[0.98] group"
									>
										<div className="flex items-center gap-6">
											<div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
												<DotsSixVertical size={24} className="stroke-[3px]" />
											</div>
											<span className="font-serif italic font-black text-2xl text-muted-foreground group-hover:text-foreground transition-colors">
												{step.text}
											</span>
										</div>
									</button>
								))}
						</div>
					</div>

					<QuizHintCard hint="Remember the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C" />

					{/* Expert Explanation */}
					<ExpertExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject="Mathematics"
					/>
				</main>
			</div>

			{/* Math Keyboard & Actions */}
			<footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl p-10 z-30 border-none">
				<div className="max-w-2xl mx-auto w-full space-y-8">
					{/* Math Symbols */}
					<div className="flex gap-3 overflow-x-auto no-scrollbar px-2">
						{mathSymbols.map((symbol) => (
							<button
								type="button"
								key={symbol}
								onClick={() => insertSymbol(symbol)}
								className="h-12 px-6 bg-muted/10 rounded-2xl text-lg font-serif italic font-black hover:bg-tiimo-blue hover:text-white transition-all whitespace-nowrap active:scale-95"
							>
								{symbol}
							</button>
						))}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4">
						<Button
							className="flex-1 h-20 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-30"
							disabled={selectedSteps.length === 0}
							onClick={() => router.push('/lesson-complete')}
						>
							<CheckCircle size={32} className="stroke-[3px] mr-3" />
							Check solution
						</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}

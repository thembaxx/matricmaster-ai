import {
	ArrowLeft,
	CheckCircle2,
	GripVertical,
	Lightbulb,
	Loader2,
	Sparkles,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4 mb-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="rounded-full"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
									Question 1 of 5
								</span>
								<Badge
									variant="secondary"
									className="text-[10px] font-black uppercase tracking-tighter rounded-full"
								>
									Integration
								</Badge>
							</div>
							<Progress value={20} className="h-2 rounded-full" />
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 space-y-8 pb-64 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-4">
						<h2 className="text-3xl font-black text-zinc-900 dark:text-white">Find the integral</h2>
						<Card className="p-12 bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
							<div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="text-center relative z-10">
								<span className="text-4xl font-mono font-bold text-zinc-900 dark:text-white">
									∫(3x² + 2x) dx
								</span>
							</div>
						</Card>
					</div>

					{/* Selected Steps Area */}
					<div className="space-y-4">
						<h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">
							Your Solution Path
						</h3>
						<div className="min-h-[160px] p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-900/50">
							{selectedSteps.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-zinc-400 space-y-2">
									<p className="text-sm font-medium">Tap steps below to solve</p>
								</div>
							) : (
								<div className="space-y-3">
									{selectedSteps.map((stepId, index) => {
										const step = steps.find((s) => s.id === stepId);
										return (
											<div
												key={stepId}
												className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-[1.5rem] shadow-sm border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-left-2"
											>
												<span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-black">
													{index + 1}
												</span>
												<span className="font-mono font-bold text-zinc-900 dark:text-white flex-1">
													{step?.text}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500"
													onClick={() => handleStepClick(stepId)}
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
						<h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">
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
										className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md active:scale-[0.98] group"
									>
										<div className="flex items-center gap-4">
											<div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
												<GripVertical className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
											</div>
											<span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
												{step.text}
											</span>
										</div>
									</button>
								))}
						</div>
					</div>

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
								Remember the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
							</p>
						</div>
					</div>

					{/* AI Explanation Toggle */}
					<div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem]">
						<div className="bg-white dark:bg-zinc-950 rounded-[1.9rem] p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
										<Sparkles className="w-5 h-5 text-blue-600" />
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
									className="font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
									onClick={handleExplain}
									disabled={isExplaining}
								>
									{isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
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
				</main>
			</ScrollArea>

			{/* Math Keyboard & Actions */}
			<footer className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-30">
				<div className="max-w-2xl mx-auto w-full">
					{/* Math Symbols */}
					<div className="px-6 py-3 overflow-x-auto no-scrollbar">
						<div className="flex gap-2">
							{mathSymbols.map((symbol) => (
								<button
									type="button"
									key={symbol}
									onClick={() => insertSymbol(symbol)}
									className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-mono font-bold hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all whitespace-nowrap active:scale-90"
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
							className="h-16 px-8 rounded-[2rem] font-bold border-zinc-200 dark:border-zinc-700"
						>
							<Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
							Hint
						</Button>
						<Button
							className="flex-1 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-bold text-lg shadow-xl shadow-zinc-900/10 disabled:opacity-50 transition-all active:scale-95"
							disabled={selectedSteps.length === 0}
							onClick={() => router.push('/lesson-complete')}
						>
							<CheckCircle2 className="w-5 h-5 mr-2" />
							Check Answer
						</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}

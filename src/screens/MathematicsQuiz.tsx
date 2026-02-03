import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import { ArrowLeft, CheckCircle2, GripVertical, Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

interface MathematicsQuizProps {
	onNavigate: (s: Screen) => void;
}

const mathSymbols = ['√', 'x²', '∫', 'd/dx', 'lim', 'Σ', '∞', 'π', 'e', 'ln', 'sin', 'cos', 'tan'];

const steps = [
	{ id: 1, text: '∫3x² dx = x³', correct: true },
	{ id: 2, text: '∫2x dx = x²', correct: true },
	{ id: 3, text: 'Add constant C', correct: true },
	{ id: 4, text: 'x³ + x² + C', correct: true },
];

export default function MathematicsQuiz({ onNavigate }: MathematicsQuizProps) {
	const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
	const availableSteps = steps;

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
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div className="flex-1">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Question 1 of 5
							</span>
							<Badge variant="outline" className="text-xs">
								Integration
							</Badge>
						</div>
						<Progress value={20} className="h-2" />
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6 pb-48">
					{/* Question */}
					<div>
						<h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
							Find the integral:
						</h2>
						<Card className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed">
							<div className="text-center">
								<span className="text-3xl font-mono text-zinc-900 dark:text-white">
									∫(3x² + 2x) dx
								</span>
							</div>
						</Card>
					</div>

					{/* Instructions */}
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Drag and drop the steps in the correct order to solve the integral:
					</p>

					{/* Selected Steps Area */}
					<div>
						<h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
							Your Answer (in order):
						</h3>
						<div className="min-h-[120px] p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
							{selectedSteps.length === 0 ? (
								<p className="text-center text-sm text-zinc-400 py-8">
									Tap steps below to add them in order
								</p>
							) : (
								<div className="space-y-2">
									{selectedSteps.map((stepId, index) => {
										const step = steps.find((s) => s.id === stepId);
										return (
											<div
												key={stepId}
												className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
											>
												<span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
													{index + 1}
												</span>
												<span className="font-mono flex-1">{step?.text}</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
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
					<div>
						<h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
							Available Steps:
						</h3>
						<div className="grid grid-cols-1 gap-2">
							{availableSteps
								.filter((s) => !selectedSteps.includes(s.id))
								.map((step) => (
									<button
										type="button"
										key={step.id}
										onClick={() => handleStepClick(step.id)}
										className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-left hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
									>
										<div className="flex items-center gap-3">
											<GripVertical className="w-4 h-4 text-zinc-400" />
											<span className="font-mono text-sm">{step.text}</span>
										</div>
									</button>
								))}
						</div>
					</div>

					{/* Hint */}
					<Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
						<div className="flex items-start gap-3">
							<Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								Remember the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
							</p>
						</div>
					</Card>
				</main>
			</ScrollArea>

			{/* Math Keyboard & Actions */}
			<footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
				{/* Math Symbols */}
				<div className="px-4 py-2 overflow-x-auto">
					<div className="flex gap-2">
						{mathSymbols.map((symbol) => (
							<button
								type="button"
								key={symbol}
								onClick={() => insertSymbol(symbol)}
								className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
							>
								{symbol}
							</button>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="p-4 flex gap-3">
					<Button variant="outline" className="flex-1">
						<Lightbulb className="w-4 h-4 mr-2" />
						Hint
					</Button>
					<Button
						className="flex-1 bg-blue-600 hover:bg-blue-700"
						disabled={selectedSteps.length === 0}
					>
						<CheckCircle2 className="w-4 h-4 mr-2" />
						Check Answer
					</Button>
				</div>
			</footer>
		</div>
	);
}

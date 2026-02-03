import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import { ArrowLeft, CheckCircle2, Flag, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface QuizProps {
	onNavigate: (s: Screen) => void;
}

const options = [
	{ id: 'A', text: 'x = 3, x = -2', expression: 'x^2 - x - 6 = 0' },
	{ id: 'B', text: 'x = 2, x = 3', expression: 'x^2 - 5x + 6 = 0' },
	{ id: 'C', text: 'x = -2, x = -3', expression: 'x^2 + 5x + 6 = 0' },
	{ id: 'D', text: 'x = 1, x = 6', expression: 'x^2 - 7x + 6 = 0' },
];

export default function Quiz({ onNavigate }: QuizProps) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [showHint] = useState(true);

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
								Question 2 of 5
							</span>
							<Badge variant="outline" className="text-xs">
								Hard
							</Badge>
						</div>
						<Progress value={40} className="h-2" />
					</div>
				</div>
				<Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 hover:bg-amber-100">
					CALCULUS
				</Badge>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6 pb-32">
					{/* Question */}
					<div>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
							Solve for x by factorizing
						</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Find the roots of the quadratic equation using factorization method.
						</p>
					</div>

					{/* Math Expression */}
					<Card className="p-8 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
						<div className="text-center">
							<span className="text-3xl font-mono text-zinc-900 dark:text-white">
								x<sup>2</sup> - 5x + 6 = 0
							</span>
						</div>
					</Card>

					{/* Hint Card */}
					{showHint && (
						<Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
							<div className="flex items-start gap-3">
								<div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
									<Lightbulb className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
										Pattern Recognition
									</h4>
									<p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
										Look for two numbers that multiply to 6 and add up to -5. Consider the factors
										of 6: (1,6), (2,3).
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Answer Options */}
					<div className="grid grid-cols-1 gap-3">
						{options.map((option) => (
							<button
								key={option.id}
								onClick={() => setSelectedOption(option.id)}
								className={`p-4 rounded-xl border-2 text-left transition-all ${
									selectedOption === option.id
										? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
										: 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500'
								}`}
							>
								<div className="flex items-center gap-4">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
											selectedOption === option.id
												? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white'
												: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
										}`}
									>
										{option.id}
									</div>
									<div>
										<p
											className={`font-mono text-lg ${selectedOption === option.id ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white'}`}
										>
											{option.expression}
										</p>
										<p
											className={`text-sm ${selectedOption === option.id ? 'text-zinc-200 dark:text-zinc-600' : 'text-zinc-500'}`}
										>
											{option.text}
										</p>
									</div>
								</div>
							</button>
						))}
					</div>
				</main>
			</ScrollArea>

			{/* Footer Actions */}
			<footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6">
				<div className="flex gap-3">
					<Button variant="outline" className="flex-1" onClick={() => onNavigate('DASHBOARD')}>
						<Flag className="w-4 h-4 mr-2" />
						Report
					</Button>
					<Button variant="outline" className="flex-1">
						<Lightbulb className="w-4 h-4 mr-2" />
						Solution
					</Button>
					<Button
						className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900"
						disabled={!selectedOption}
					>
						<CheckCircle2 className="w-4 h-4 mr-2" />
						Check
					</Button>
				</div>
			</footer>
		</div>
	);
}

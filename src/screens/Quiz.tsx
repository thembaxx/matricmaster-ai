import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	ArrowLeft,
	HelpCircle,
	Lightbulb,
	MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';

interface QuizProps {
	onNavigate: (s: Screen) => void;
}

const options = [
	{ id: 'A', expression: '(x+2)(x+3)' },
	{ id: 'B', expression: '(x-2)(x-3)' },
	{ id: 'C', expression: '(x-1)(x-6)' },
	{ id: 'D', expression: '(x+1)(x-6)' },
];

export default function Quiz({ onNavigate }: QuizProps) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="bg-white dark:bg-zinc-900 sticky top-0 z-20">
				<div className="px-6 pt-12 pb-2 flex items-center justify-between">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')} className="-ml-2">
						<ArrowLeft className="w-6 h-6" />
					</Button>
					<div className="text-center">
						<h1 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
							Mathematics P1
						</h1>
						<p className="text-sm font-bold text-zinc-900 dark:text-white">
							Nov 2023 • NSC
						</p>
					</div>
					<Button variant="ghost" size="icon" className="-mr-2">
						<MoreHorizontal className="w-6 h-6" />
					</Button>
				</div>
				{/* Progress */}
				<div className="px-6 pb-4">
					<div className="flex justify-between items-center mb-2">
						<div className="h-1.5 w-24 bg-green-500 rounded-full" />
						<div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 ml-2 rounded-full" />
					</div>
					<div className="flex justify-between text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
						<span>Algebra</span>
						<span>Question 3/12</span>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
						Solve for <span className="font-serif italic text-blue-600">x</span>
					</h2>
					<p className="text-sm text-zinc-500 mb-6">
						Identify the correct factors for the quadratic equation below to find the roots.
					</p>

					{/* Equation Card */}
					<Card className="p-8 mb-6 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 text-center shadow-sm border-zinc-100 dark:border-zinc-800 rounded-3xl">
						<div className="text-3xl font-serif italic text-zinc-900 dark:text-white mb-6">
							x<sup>2</sup> - 5x + 6 = 0
						</div>
						<div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold shadow-sm">
							<Lightbulb className="w-3 h-3 fill-current" />
							Factorise the trinomial
						</div>
					</Card>

					{/* Options Grid */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						{options.map((option) => (
							<button
								key={option.id}
								onClick={() => setSelectedOption(option.id)}
								className={`p-6 rounded-3xl transition-all h-32 flex flex-col items-center justify-center gap-3 ${
									selectedOption === option.id
										? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl scale-105'
										: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
								}`}
							>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
										selectedOption === option.id
											? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white'
											: 'bg-white dark:bg-zinc-600 text-zinc-400 dark:text-zinc-300'
									}`}
								>
									{option.id}
								</div>
								<span className="font-serif italic text-lg">{option.expression}</span>
							</button>
						))}
					</div>

					{/* Pattern Recognition Hint */}
					<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex gap-4">
						<div className="w-10 h-10 bg-white dark:bg-blue-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
						</div>
						<div>
							<h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">
								Pattern Recognition
							</h4>
							<p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
								Quadratic factors often appear in pairs that sum to the middle term (-5) and multiply to the last term (6).
							</p>
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Footer */}
			<footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 p-6 z-20">
				<div className="flex justify-between items-center mb-4 px-2">
					<button type="button" className="flex items-center gap-2 text-zinc-500 font-bold text-xs hover:text-zinc-900">
						<span className="w-4 h-4 bg-zinc-200 rounded flex items-center justify-center">?</span>
						Report Issue
					</button>
					<button type="button" className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:text-blue-700">
						<HelpCircle className="w-4 h-4" />
						Show Solution
					</button>
				</div>
				<Button
					size="lg"
					className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-14 text-base font-bold shadow-lg"
					disabled={!selectedOption}
				>
					Check Answer
				</Button>
			</footer>
		</div>
	);
}

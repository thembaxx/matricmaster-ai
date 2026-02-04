import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
// import type { Screen } from '@/types'; // Removed unused import
import {
	ArrowLeft,
	HelpCircle,
	Lightbulb,
	MoreHorizontal,
	Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

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

	const handleCheck = () => {
		if (isChecked) {
			if (isCorrect) {
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
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative">
			{/* Header */}
			<header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="px-6 pt-12 pb-2 flex items-center justify-between">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="rounded-full"
						>
							<ArrowLeft className="w-6 h-6" />
						</Button>
						<div className="text-center">
							<h1 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
								Mathematics P1
							</h1>
							<p className="text-sm font-black text-zinc-900 dark:text-white">
								Nov 2023 • NSC
							</p>
						</div>
						<Button variant="ghost" size="icon" className="rounded-full">
							<MoreHorizontal className="w-6 h-6" />
						</Button>
					</div>
					{/* Progress */}
					<div className="px-6 pb-6">
						<div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
							<div className="absolute top-0 left-0 h-full w-1/3 bg-brand-green rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
						</div>
						<div className="flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-400 uppercase">
							<span className="flex items-center gap-1.5">
								<span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
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
						<h2 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
							Local <span className="text-brand-blue italic font-serif">Extrema</span>
						</h2>
						<p className="text-zinc-500 font-medium leading-relaxed">
							Find the coordinates of the local maximum for the function graphed
							below.
						</p>
					</div>

					{/* Equation & Graph Card */}
					<Card className="p-8 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
						<div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />

						{/* Math Function */}
						<div className="text-2xl font-serif italic font-bold text-zinc-900 dark:text-white mb-6 relative z-10">
							f(x) = x³ - 3x + 2
						</div>

						{/* SVG Graph Visualization */}
						<div className="w-full h-48 relative mb-6 z-10 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
							<svg viewBox="0 0 200 120" className="w-full h-full p-4">
								<title>Graph of f(x) = x³ - 3x + 2</title>
								{/* Grid lines */}
								<line
									x1="0"
									y1="60"
									x2="200"
									y2="60"
									stroke="currentColor"
									strokeWidth="0.5"
									className="text-zinc-200 dark:text-zinc-700"
								/>
								<line
									x1="100"
									y1="0"
									x2="100"
									y2="120"
									stroke="currentColor"
									strokeWidth="0.5"
									className="text-zinc-200 dark:text-zinc-700"
								/>

								{/* Function Curve f(x) = x^3 - 3x + 2 */}
								{/* Scaled and shifted for visualization */}
								<path
									d="M 20 100 Q 60 20 100 60 T 180 20"
									fill="none"
									stroke="#2563eb"
									strokeWidth="3"
									strokeLinecap="round"
									className="animate-draw"
								/>

								{/* Local Max Point */}
								<circle
									cx="75"
									cy="40"
									r="5"
									fill="#10b981"
									className="animate-pulse"
								/>
								<text
									x="65"
									y="30"
									fontSize="8"
									className="fill-zinc-400 font-black tracking-widest uppercase"
								>
									Max
								</text>
							</svg>
						</div>

						<div className="bg-brand-amber/10 text-brand-amber px-6 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest shadow-sm border border-brand-amber/20 relative z-10">
							<Lightbulb className="w-4 h-4 fill-brand-amber" />
							Use f'(x) = 0 to find stationary points
						</div>
					</Card>

					{/* Options Grid */}
					<div className="grid grid-cols-2 gap-4">
						{options.map((option) => {
							const isSelected = selectedOption === option.id;
							let stateClasses =
								'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-100 dark:border-zinc-800 hover:border-brand-blue/30 hover:shadow-md';

							if (isSelected) {
								if (isChecked) {
									stateClasses = option.isCorrect
										? 'bg-brand-green text-white border-transparent shadow-xl shadow-brand-green/20'
										: 'bg-brand-red text-white border-transparent shadow-xl shadow-brand-red/20';
								} else {
									stateClasses =
										'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xl scale-[1.02]';
								}
							}

							return (
								<button
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
													: 'bg-white/10 text-white dark:bg-zinc-900/10 dark:text-zinc-900'
												: 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue'
										}`}
									>
										{option.id}
									</div>
									<span className="font-serif italic font-bold text-xl">
										{option.expression}
									</span>

									{isChecked && isSelected && option.isCorrect && (
										<div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-brand-green rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
											<Sparkles className="w-4 h-4 fill-brand-green" />
										</div>
									)}
								</button>
							);
						})}
					</div>

					{/* Explanation Card (Aha! Moment) */}
					{showExplanation && (
						<Card className="p-8 bg-brand-green/5 dark:bg-brand-green/10 border-2 border-brand-green/20 rounded-[2.5rem] space-y-6 animate-in slide-in-from-bottom-4 duration-500">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-brand-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
									<Sparkles className="w-6 h-6" />
								</div>
								<div>
									<h4 className="font-black text-brand-green text-lg">
										Aha! Moment
									</h4>
									<p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
										The "Why" behind the math
									</p>
								</div>
							</div>

							<div className="space-y-4 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
								<p>
									To find the local maximum, we first find where the slope
									(derivative) is zero:
								</p>
								<div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl font-serif italic text-center text-lg border border-zinc-100 dark:border-zinc-800">
									f'(x) = 3x² - 3 = 0 <br />
									3(x² - 1) = 0 <br />
									x = 1 or x = -1
								</div>
								<p>
									By checking the second derivative{' '}
									<span className="italic">f''(x) = 6x</span>, we see that{' '}
									<span className="italic">f''(-1) = -6</span> (negative), which
									confirms a local maximum at <span className="italic">x = -1</span>
									.
								</p>
							</div>
						</Card>
					)}

					{/* Hint Card */}
					{!showExplanation && (
						<div className="p-6 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-[2rem] border border-brand-blue/10 flex gap-5 items-start transition-all hover:bg-brand-blue/10">
							<div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-brand-blue/10">
								<Sparkles className="w-6 h-6 text-brand-blue" />
							</div>
							<div className="space-y-1">
								<h4 className="font-black text-brand-blue text-xs uppercase tracking-widest">
									Smart Hint
								</h4>
								<p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
									A local maximum occurs where the function stops increasing and
									starts decreasing. This always happens at a stationary point.
								</p>
							</div>
						</div>
					)}
				</main>
			</ScrollArea>

			{/* Floating Footer */}
			<footer className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 z-30 border-t border-zinc-100 dark:border-zinc-800">
				<div className="max-w-2xl mx-auto w-full space-y-6">
					<div className="flex justify-between items-center px-2">
						<button
							type="button"
							className="flex items-center gap-2.5 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
						>
							<span className="w-5 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
								?
							</span>
							Report Issue
						</button>
						<button
							type="button"
							className="flex items-center gap-2 text-brand-blue font-black text-[10px] uppercase tracking-widest hover:text-brand-blue-light transition-colors"
						>
							<HelpCircle className="w-4 h-4" />
							Show Solution
						</button>
					</div>
					<Button
						size="lg"
						onClick={handleCheck}
						className={`w-full h-16 rounded-[2rem] text-lg font-black shadow-2xl transition-all active:scale-95 ${
							!selectedOption
								? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
								: isChecked
									? isCorrect
										? 'bg-brand-green hover:bg-brand-green-light text-white shadow-brand-green/20'
										: 'bg-brand-red hover:bg-red-600 text-white shadow-brand-red/20'
									: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 shadow-zinc-900/20'
						}`}
						disabled={!selectedOption}
					>
						{isChecked
							? isCorrect
								? 'Continue'
								: 'Try Again'
							: 'Check Answer'}
					</Button>
				</div>
			</footer>
		</div>
	);
}

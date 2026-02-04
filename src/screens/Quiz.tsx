import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
// import type { Screen } from '@/types'; // Removed unused import
import { ArrowLeft, HelpCircle, Lightbulb, MoreHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

const options = [
	{ id: 'A', expression: '(x+2)(x+3)', isCorrect: false },
	{ id: 'B', expression: '(x-2)(x-3)', isCorrect: true },
	{ id: 'C', expression: '(x-1)(x-6)', isCorrect: false },
	{ id: 'D', expression: '(x+1)(x-6)', isCorrect: false },
];

export default function Quiz() {
	const router = useRouter();
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const handleCheck = () => {
		if (isChecked) {
			if (isCorrect) {
				router.push('/lesson-complete');
			} else {
				setIsChecked(false);
				setIsCorrect(null);
				setSelectedOption(null);
			}
			return;
		}

		const option = options.find((o) => o.id === selectedOption);
		const correct = option?.isCorrect || false;
		setIsCorrect(correct);
		setIsChecked(true);
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
							<p className="text-sm font-black text-zinc-900 dark:text-white">Nov 2023 • NSC</p>
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
							Solve for <span className="text-brand-blue italic font-serif">x</span>
						</h2>
						<p className="text-zinc-500 font-medium leading-relaxed">
							Identify the correct factors for the quadratic equation below to find the roots.
						</p>
					</div>

					{/* Equation Card */}
					<Card className="p-12 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
						<div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="text-4xl font-serif italic font-bold text-zinc-900 dark:text-white mb-10 relative z-10">
							x² - 5x + 6 = 0
						</div>
						<div className="bg-brand-amber/10 text-brand-amber px-6 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest shadow-sm border border-brand-amber/20 relative z-10">
							<Lightbulb className="w-4 h-4 fill-brand-amber" />
							Factorise the trinomial
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
									<span className="font-serif italic font-bold text-xl">{option.expression}</span>

									{isChecked && isSelected && option.isCorrect && (
										<div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-brand-green rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
											<Sparkles className="w-4 h-4 fill-brand-green" />
										</div>
									)}
								</button>
							);
						})}
					</div>

					{/* Hint Card */}
					<div className="p-6 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-[2rem] border border-brand-blue/10 flex gap-5 items-start transition-all hover:bg-brand-blue/10">
						<div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-brand-blue/10">
							<Sparkles className="w-6 h-6 text-brand-blue" />
						</div>
						<div className="space-y-1">
							<h4 className="font-black text-brand-blue text-xs uppercase tracking-widest">
								Smart Hint
							</h4>
							<p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
								Quadratic factors often appear in pairs that sum to the middle term (-5) and
								multiply to the last term (6).
							</p>
						</div>
					</div>
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
						{isChecked ? (isCorrect ? 'Continue' : 'Try Again') : 'Check Answer'}
					</Button>
				</div>
			</footer>
		</div>
	);
}

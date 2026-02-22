'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

type QuizOption = {
	id: string;
	text?: string;
	expression?: string;
	isCorrect?: boolean;
};

type QuizOptionsGridProps = {
	options: QuizOption[];
	selectedOption: string | null;
	isChecked: boolean;
	onSelect: (id: string) => void;
	variant?: 'grid' | 'list';
};

export function QuizOptionsGrid({
	options,
	selectedOption,
	isChecked,
	onSelect,
	variant = 'grid',
}: QuizOptionsGridProps) {
	if (variant === 'list') {
		return (
			<div className="space-y-4">
				{options.map((option) => {
					const isSelected = selectedOption === option.id;
					return (
						<button
							type="button"
							key={option.id}
							disabled={isChecked}
							onClick={() => onSelect(option.id)}
							className={`w-full p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
								isSelected
									? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
									: 'border-border hover:border-primary/30'
							}`}
						>
							<span
								className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
									isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-zinc-500'
								}`}
							>
								{option.id}
							</span>
							<span className="font-bold text-zinc-700 dark:text-zinc-300 text-left">
								{option.text}
							</span>
						</button>
					);
				})}
			</div>
		);
	}

	return (
		<m.div
			variants={STAGGER_CONTAINER}
			initial="hidden"
			animate="visible"
			className="grid grid-cols-2 gap-4"
		>
			{options.map((option) => {
				const isSelected = selectedOption === option.id;
				let stateClasses =
					'bg-card text-foreground border-border hover:border-primary/30 hover:shadow-md';

				if (isSelected) {
					if (isChecked) {
						stateClasses = option.isCorrect
							? 'bg-brand-green text-white border-transparent shadow-xl shadow-brand-green/20'
							: 'bg-brand-red text-white border-transparent shadow-xl shadow-brand-red/20';
					} else {
						stateClasses = 'bg-foreground text-background border-transparent shadow-xl';
					}
				}

				return (
					<m.button
						variants={STAGGER_ITEM}
						whileHover={!isChecked ? { scale: 1.02, y: -4 } : {}}
						whileTap={!isChecked ? { scale: 0.98 } : {}}
						type="button"
						key={option.id}
						disabled={isChecked}
						onClick={() => onSelect(option.id)}
						className={`p-6 rounded-[2.5rem] border-2 transition-all h-44 flex flex-col items-center justify-center gap-4 relative group ${stateClasses}`}
					>
						<div
							className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${
								isSelected
									? isChecked
										? 'bg-white/20 text-white'
										: 'bg-background/20 text-foreground'
									: 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
							}`}
						>
							{option.id}
						</div>
						<span className="font-serif italic font-bold text-xl">
							{option.expression || option.text}
						</span>

						<AnimatePresence>
							{isChecked && isSelected && option.isCorrect && (
								<m.div
									initial={{ scale: 0.95, opacity: 0, rotate: -45 }}
									animate={{ scale: 1, rotate: 0 }}
									className="absolute -top-2 -right-2 w-8 h-8 bg-white text-brand-green rounded-full flex items-center justify-center shadow-lg"
								>
									<Sparkles className="w-4 h-4 fill-brand-green" />
								</m.div>
							)}
						</AnimatePresence>
					</m.button>
				);
			})}
		</m.div>
	);
}

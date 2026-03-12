'use client';

import {
	CalculatorIcon,
	CancelCircleIcon,
	CheckmarkCircle02Icon,
	Mortarboard01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

interface QuestionCardProps {
	question: string;
	options: QuestionOption[];
	selectedOption: string | null;
	isChecked: boolean;
	onSelect: (id: string) => void;
}

export function QuestionCard({
	question,
	options,
	selectedOption,
	isChecked,
	onSelect,
}: QuestionCardProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
		>
			<div className="bg-card rounded-[2.5rem] shadow-tiimo border border-border/50 p-8 sm:p-10">
				<div className="mb-8">
					<div className="flex items-center gap-2 mb-4">
						<div className="p-1.5 bg-tiimo-lavender/10 rounded-lg">
							<HugeiconsIcon icon={Mortarboard01Icon} className="w-4 h-4 text-tiimo-lavender" />
						</div>
						<span className="text-[10px] font-black text-tiimo-lavender uppercase tracking-widest">
							Practice Problem
						</span>
					</div>
					<h2 className="text-xl font-black leading-tight text-foreground tracking-tight">
						{question}
					</h2>
				</div>

				{/* Visual Area */}
				<div className="w-full h-48 bg-secondary rounded-[2rem] mb-10 relative overflow-hidden group">
					<div className="absolute inset-0 flex items-center justify-center opacity-10">
						<HugeiconsIcon icon={CalculatorIcon} className="w-24 h-24" />
					</div>
					<svg viewBox="0 0 300 150" className="w-full h-full relative z-10 p-4">
						<title>Math Visualization</title>
						<path
							d="M 40 120 Q 100 20, 150 75 T 260 30"
							fill="none"
							stroke="var(--tiimo-lavender)"
							strokeWidth="4"
							strokeLinecap="round"
						/>
						<circle cx="110" cy="45" r="6" fill="var(--tiimo-green)" className="animate-pulse" />
					</svg>
				</div>

				<div className="grid grid-cols-1 gap-3">
					{options.map((option, index) => {
						const isSelected = selectedOption === option.id;
						return (
							<m.button
								key={option.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								onClick={() => !isChecked && onSelect(option.id)}
								disabled={isChecked}
								className={cn(
									'w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all tiimo-press group',
									isSelected
										? isChecked
											? option.isCorrect
												? 'bg-tiimo-green/10 border-tiimo-green'
												: 'bg-destructive/10 border-destructive'
											: 'bg-tiimo-lavender/10 border-tiimo-lavender'
										: isChecked && option.isCorrect
											? 'bg-tiimo-green/10 border-tiimo-green'
											: 'bg-card border-border/50 hover:border-tiimo-lavender/30'
								)}
							>
								<div
									className={cn(
										'w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all',
										isSelected
											? isChecked
												? option.isCorrect
													? 'bg-tiimo-green text-white'
													: 'bg-destructive text-white'
												: 'bg-tiimo-lavender text-white'
											: isChecked && option.isCorrect
												? 'bg-tiimo-green text-white'
												: 'bg-secondary text-tiimo-gray-muted'
									)}
								>
									{option.id}
								</div>
								<span
									className={cn(
										'flex-1 text-left font-bold text-base tracking-tight',
										isSelected && isChecked && !option.isCorrect
											? 'text-tiimo-gray-muted'
											: 'text-foreground'
									)}
								>
									{option.label}
								</span>

								{isChecked && (isSelected || option.isCorrect) && (
									<m.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className={cn(
											'w-6 h-6 rounded-full flex items-center justify-center text-white',
											option.isCorrect ? 'bg-tiimo-green' : 'bg-destructive'
										)}
									>
										<HugeiconsIcon
											icon={option.isCorrect ? CheckmarkCircle02Icon : CancelCircleIcon}
											className="w-4 h-4"
										/>
									</m.div>
								)}
							</m.button>
						);
					})}
				</div>
			</div>
		</m.div>
	);
}

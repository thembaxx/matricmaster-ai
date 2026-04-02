'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

type IconSvgElement = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export interface QuizStep {
	id: string;
	icon: IconSvgElement;
	title: string;
	status: 'completed' | 'current' | 'upcoming';
}

interface QuizProgressProps {
	steps: QuizStep[];
	progressPercent: number;
}

export function QuizProgress({ steps, progressPercent }: QuizProgressProps) {
	return (
		<div className="mb-10">
			<div className="flex items-center gap-3 mb-6">
				{steps.map((step, index) => {
					const isCurrent = step.status === 'current';
					const isCompleted = step.status === 'completed';
					return (
						<m.div
							key={step.id}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.05 }}
							className={cn(
								'flex flex-col items-center gap-2 p-4 rounded-[1.5rem] flex-1 transition-all duration-300 cursor-pointer',
								isCurrent
									? 'bg-tiimo-lavender text-white shadow-tiimo-lg scale-105 z-10 ring-2 ring-tiimo-lavender/50'
									: isCompleted
										? 'bg-tiimo-green/15 text-tiimo-green hover:bg-tiimo-green/25'
										: 'bg-secondary text-tiimo-gray-muted opacity-60 hover:opacity-80'
							)}
						>
							<HugeiconsIcon icon={step.icon} className="w-6 h-6" />
							<span className="text-[9px] font-black tracking-widest">{step.title}</span>
						</m.div>
					);
				})}
			</div>

			<div className="h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
				<m.div
					className="h-full bg-tiimo-lavender rounded-full shadow-sm"
					initial={{ width: 0 }}
					animate={{ width: `${progressPercent}%` }}
					transition={{ duration: 1, ease: 'circOut' }}
				/>
			</div>
		</div>
	);
}

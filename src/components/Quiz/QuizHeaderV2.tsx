'use client';

import { CalculatorIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';

interface QuizHeaderProps {
	title: string;
	subtitle: string;
	elapsedTime: string;
}

export function QuizHeader({ title, subtitle, elapsedTime }: QuizHeaderProps) {
	return (
		<div className="flex items-center justify-between mb-8">
			<div className="flex items-center gap-4">
				<m.div
					layoutId="quiz-subject-icon"
					className="w-14 h-14 bg-subject-math-soft rounded-[1.5rem] flex items-center justify-center shadow-tiimo"
				>
					<HugeiconsIcon icon={CalculatorIcon} className="w-8 h-8 text-subject-math" />
				</m.div>

				<div>
					<h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
					<p className="text-sm font-bold text-tiimo-gray-muted tracking-tight">{subtitle}</p>
				</div>
			</div>
			<m.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="px-4 py-2 bg-secondary rounded-full shadow-sm"
			>
				<span className="font-mono font-black text-foreground tabular-nums">{elapsedTime}</span>
			</m.div>
		</div>
	);
}

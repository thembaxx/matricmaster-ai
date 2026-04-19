'use client';

import { AnimatePresence, motion as m } from 'motion/react';
import { cn } from '@/lib/utils';

interface QuizProgressProps {
	currentQuestion: number;
	totalQuestions: number;
	difficulty: string;
	progressPercent: number;
}

export function QuizProgress({
	currentQuestion,
	totalQuestions,
	difficulty,
	progressPercent,
}: QuizProgressProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			className="mb-5"
		>
			<div className="flex justify-between items-center mb-3">
				<span className="text-xs font-medium text-muted-foreground/60">
					<AnimatePresence mode="popLayout">
						<m.span
							key={currentQuestion}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							className="inline-block font-semibold text-foreground"
						>
							{currentQuestion}
						</m.span>
					</AnimatePresence>
					<span className="text-muted-foreground/40 mx-1">/</span>
					<span className="text-muted-foreground/40">{totalQuestions}</span>
				</span>
				<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30">
					<div
						className={cn(
							'w-1.5 h-1.5 rounded-full',
							difficulty === 'easy'
								? 'bg-emerald-400'
								: difficulty === 'medium'
									? 'bg-amber-400'
									: 'bg-red-400'
						)}
					/>
					<span className="text-[10px] font-medium text-muted-foreground/60 capitalize">
						{difficulty}
					</span>
				</div>
			</div>
			<div
				className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/20"
				role="progressbar"
				aria-valuenow={progressPercent}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`${progressPercent}% complete`}
			>
				<m.div
					className={cn('h-full rounded-full bg-primary/80')}
					animate={{ width: `${progressPercent}%` }}
					transition={{ type: 'spring', stiffness: 100, damping: 15 }}
				/>
			</div>
		</m.div>
	);
}

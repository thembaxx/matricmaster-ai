'use client';

import { AnimatePresence, motion as m } from 'motion/react';
import { Badge } from '@/components/ui/badge';
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
			className="mb-6"
		>
			<div className="flex justify-between items-center mb-2">
				<span className="text-[10px] font-medium text-muted-foreground">
					Question{' '}
					<AnimatePresence mode="popLayout">
						<m.span
							key={currentQuestion}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							className="inline-block"
						>
							{currentQuestion}
						</m.span>
					</AnimatePresence>{' '}
					of {totalQuestions}
				</span>
				<Badge variant="secondary" className="text-[10px] font-medium rounded-full px-3">
					{difficulty}
				</Badge>
			</div>
			<div
				className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
				role="progressbar"
				aria-valuenow={progressPercent}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`${progressPercent}% complete`}
			>
				<m.div
					className={cn(
						'h-full rounded-full',
						'bg-gradient-to-r from-tiimo-lavender to-tiimo-lavender/70'
					)}
					style={{ boxShadow: '0 0 8px rgba(159, 133, 255, 0.3)' }}
					animate={{ width: `${progressPercent}%` }}
					transition={{ type: 'spring', stiffness: 100, damping: 15 }}
				/>
			</div>
		</m.div>
	);
}

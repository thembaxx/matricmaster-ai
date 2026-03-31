'use client';

import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
	type DifficultyLevel,
	getDifficultyBgColor,
	getDifficultyColor,
	getDifficultyLabel,
} from '@/services/adaptive-difficulty';

interface DifficultyIndicatorProps {
	currentLevel: DifficultyLevel;
	correct: number;
	incorrect: number;
	streakCorrect: number;
	streakIncorrect: number;
	recommendation?: string;
	showStats?: boolean;
	className?: string;
}

export function DifficultyIndicator({
	currentLevel,
	correct,
	incorrect,
	streakCorrect,
	streakIncorrect,
	recommendation,
	showStats = true,
	className,
}: DifficultyIndicatorProps) {
	const total = correct + incorrect;
	const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
	const isStreaking = streakCorrect >= 2 || streakIncorrect >= 2;
	const streakCount = Math.max(streakCorrect, streakIncorrect);
	const streakType = streakCorrect >= streakIncorrect ? 'correct' : 'incorrect';

	return (
		<div className={cn('flex items-center gap-3', className)}>
			<AnimatePresence mode="wait">
				<m.div
					key={currentLevel}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.8, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					className={cn(
						'flex items-center gap-2 px-3 py-1.5 rounded-full',
						getDifficultyBgColor(currentLevel)
					)}
				>
					<m.span
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className={cn('text-xs font-semibold', getDifficultyColor(currentLevel))}
					>
						{getDifficultyLabel(currentLevel)}
					</m.span>

					{isStreaking && (
						<m.span
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className={cn(
								'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
								streakType === 'correct'
									? 'bg-green-500/30 text-green-600'
									: 'bg-red-500/30 text-red-600'
							)}
						>
							{streakCount}x
						</m.span>
					)}
				</m.div>
			</AnimatePresence>

			{showStats && total > 0 && (
				<m.div
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-2 text-[10px] text-muted-foreground"
				>
					<span>
						<span className="text-green-500 font-semibold">{correct}</span>
						<span className="mx-1">/</span>
						<span className="text-red-500 font-semibold">{incorrect}</span>
					</span>
					<span className="text-[9px] opacity-60">|</span>
					<span>
						<span className="font-medium">{accuracy}%</span>
					</span>
				</m.div>
			)}

			{recommendation && (
				<AnimatePresence>
					{recommendation && (
						<m.div
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 5 }}
							className="text-[10px] text-muted-foreground italic"
						>
							{recommendation}
						</m.div>
					)}
				</AnimatePresence>
			)}
		</div>
	);
}

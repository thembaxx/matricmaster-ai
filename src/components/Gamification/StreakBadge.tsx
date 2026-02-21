'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/use-streak';

interface StreakBadgeProps {
	variant?: 'default' | 'compact' | 'large';
	className?: string;
}

export function StreakBadge({ variant = 'default', className = '' }: StreakBadgeProps) {
	const { currentStreak, isLoading } = useStreak();

	if (isLoading || currentStreak === 0) return null;

	if (variant === 'compact') {
		return (
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				className={`flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full ${className}`}
			>
				<Flame className="w-3 h-3 text-orange-500" />
				<span className="text-xs font-black text-orange-500">{currentStreak}</span>
			</motion.div>
		);
	}

	if (variant === 'large') {
		return (
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className={`flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-2xl shadow-lg ${className}`}
			>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 1,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'easeInOut',
					}}
				>
					<Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
				</motion.div>
				<div>
					<p className="text-2xl font-black text-foreground">{currentStreak}</p>
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
						Day Streak
					</p>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full ${className}`}
		>
			<Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
			<span className="text-sm font-black text-orange-500">{currentStreak}</span>
			<span className="text-xs font-bold text-orange-500/70">day streak</span>
		</motion.div>
	);
}

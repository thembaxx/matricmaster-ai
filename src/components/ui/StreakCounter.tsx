'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
	count: number;
	className?: string;
}

export function StreakCounter({ count, className }: StreakCounterProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-orange/10 border border-primary-orange/20 text-primary-orange font-bold',
				className
			)}
		>
			<motion.span
				animate={{
					scale: [1, 1.2, 1],
					rotate: [0, 10, -10, 0],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			>
				🔥
			</motion.span>
			<div className="overflow-hidden h-[1.2em] flex flex-col items-center">
				<AnimatePresence mode="popLayout">
					<motion.span
						key={count}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -20, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
					>
						{count}
					</motion.span>
				</AnimatePresence>
			</div>
			<span className="text-xs uppercase tracking-wider">Day Streak</span>
		</div>
	);
}

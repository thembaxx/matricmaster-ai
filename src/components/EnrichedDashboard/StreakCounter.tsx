'use client';

import { FlameIcon } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
	currentStreak: number;
	bestStreak: number;
	lastStudiedAt: Date;
}

export function StreakCounter({ currentStreak, bestStreak, lastStudiedAt }: StreakCounterProps) {
	const [prevStreak, setPrevStreak] = useState(currentStreak);
	const [isAnimating, setIsAnimating] = useState(false);
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	useEffect(() => {
		if (currentStreak > prevStreak) {
			setIsAnimating(true);
			const timer = setTimeout(() => setIsAnimating(false), 600);
			setPrevStreak(currentStreak);
			return () => clearTimeout(timer);
		}
	}, [currentStreak, prevStreak]);

	const now = new Date();
	const lastStudied = new Date(lastStudiedAt);
	const daysSinceLastStudied = Math.floor((now.getTime() - lastStudied.getTime()) / 86400000);

	const isActive = daysSinceLastStudied <= 1;
	const isWarning = daysSinceLastStudied > 1;
	const isHotStreak = currentStreak > 7;

	let message: string;
	if (currentStreak === 0) {
		message = 'Start your streak today!';
	} else if (isWarning) {
		message = "Don't break the chain!";
	} else if (isHotStreak) {
		message = 'Keep it going! You are on fire!';
	} else {
		message = 'Keep it going!';
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-bold">Study Streak</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-6">
					<m.div
						className="relative flex items-center justify-center"
						animate={
							prefersReducedMotion ? {} : isHotStreak && isActive ? { scale: [1, 1.08, 1] } : {}
						}
						transition={
							prefersReducedMotion
								? {}
								: {
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: 'easeInOut',
									}
						}
					>
						<m.div
							animate={prefersReducedMotion ? {} : isAnimating ? { scale: [1, 1.3, 1] } : {}}
							transition={prefersReducedMotion ? {} : { duration: 0.6, ease: 'easeOut' }}
						>
							<FlameIcon
								className={cn(
									'w-10 h-10',
									isHotStreak && isActive ? 'text-tiimo-orange' : 'text-muted-foreground'
								)}
								fill={isHotStreak && isActive ? 'currentColor' : 'none'}
							/>
						</m.div>

						{isHotStreak && isActive && !prefersReducedMotion && (
							<>
								<m.div
									className="absolute inset-0 rounded-full bg-tiimo-orange/10"
									animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
									transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
								/>
								<m.div
									className="absolute inset-0 rounded-full bg-tiimo-orange/10"
									animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
									transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.75 }}
								/>
							</>
						)}
					</m.div>

					<div className="flex-1">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold font-numeric">{currentStreak}</span>
							<span className="text-sm text-muted-foreground">
								{currentStreak === 1 ? 'day' : 'days'}
							</span>
						</div>
						<p
							className={cn(
								'text-sm font-medium mt-0.5',
								isWarning && 'text-destructive',
								isHotStreak && isActive && 'text-tiimo-orange'
							)}
						>
							{message}
						</p>
						<div className="flex items-center gap-3 mt-2">
							<span className="text-xs text-muted-foreground">
								Best: <span className="font-numeric font-medium">{bestStreak}</span> days
							</span>
							{isWarning && (
								<span className="text-xs text-destructive font-medium">
									Last studied {daysSinceLastStudied} days ago
								</span>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CelebrationType = 'achievement' | 'level_up' | 'streak_milestone' | 'challenge_complete';

interface CelebrationModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: CelebrationType;
	title: string;
	description: string;
	icon?: string;
	xpEarned?: number;
}

export function CelebrationModal({
	isOpen,
	onClose,
	type,
	title,
	description,
	icon = '🎉',
	xpEarned,
}: CelebrationModalProps) {
	React.useEffect(() => {
		if (isOpen) {
			const duration = 3 * 1000;
			const animationEnd = Date.now() + duration;
			const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

			const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

			const interval: any = setInterval(() => {
				const timeLeft = animationEnd - Date.now();

				if (timeLeft <= 0) {
					return clearInterval(interval);
				}

				const particleCount = 50 * (timeLeft / duration);
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				});
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				});
			}, 250);

			return () => clearInterval(interval);
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md border-none bg-transparent shadow-none p-0 overflow-visible">
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ scale: 0.8, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.8, opacity: 0, y: 20 }}
							className="relative bg-card rounded-[2.5rem] p-8 text-center border-4 border-primary-violet/20 shadow-2xl overflow-hidden"
						>
							{/* Background Glow */}
							<div className="absolute inset-0 bg-gradient-to-b from-primary-violet/10 to-transparent pointer-events-none" />

							<motion.div
								initial={{ rotate: -20, scale: 0 }}
								animate={{ rotate: 0, scale: 1 }}
								transition={{ type: 'spring', damping: 12, delay: 0.2 }}
								className="relative z-10 w-24 h-24 mx-auto mb-6 bg-primary-violet/10 rounded-3xl flex items-center justify-center text-6xl shadow-inner"
							>
								{icon}
							</motion.div>

							<div className="relative z-10 space-y-2 mb-8">
								<div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors bg-primary-violet text-white mb-2">
									{type.replace('_', ' ').toUpperCase()}
								</div>
								<DialogTitle className="text-3xl font-heading font-black text-foreground">
									{title}
								</DialogTitle>
								<DialogDescription className="text-lg text-muted-foreground font-medium">
									{description}
								</DialogDescription>
							</div>

							{xpEarned && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									className="relative z-10 mb-8 py-3 px-6 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 inline-block"
								>
									<span className="text-primary-orange font-black text-xl">
										+{xpEarned} XP EARNED! ✨
									</span>
								</motion.div>
							)}

							<div className="relative z-10 flex gap-4">
								<Button
									variant="primary"
									size="lg"
									className="flex-1 rounded-2xl font-black text-lg h-14"
									onClick={onClose}
								>
									AWESOME!
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}

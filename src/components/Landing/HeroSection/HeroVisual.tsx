'use client';

import { BrainIcon, CalculatorIcon, FlashIcon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export function HeroVisual() {
	const prefersReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll();

	const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, prefersReducedMotion ? 1 : 0]);

	return (
		<m.div
			initial={{ opacity: 0, x: 40 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
			className="relative w-full max-w-lg lg:max-w-xl"
			style={{ y, opacity }}
		>
			<m.div
				whileHover={{ scale: 1.02 }}
				className="relative w-full aspect-square max-w-lg mx-auto"
			>
				<div className="absolute inset-0 bg-gradient-to-br from-tiimo-lavender/20 via-transparent to-subject-physics/20 rounded-[var(--radius-2xl)]" />

				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative w-64 h-64">
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=faces"
								alt="Students studying together"
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								className="object-cover rounded-[var(--radius-2xl)]"
								priority
								fetchPriority="high"
							/>
						</div>

						<m.div
							initial={{ opacity: 0, scale: 0.8, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{
								delay: 0.4,
								duration: 3.5,
								ease: 'easeInOut' as const,
							}}
							className="absolute -top-2 -left-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-elevation-2 border border-border/50 flex flex-col items-center justify-center p-2 z-10 will-change-transform"
						>
							<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-math/20 flex items-center justify-center mb-1">
								<HugeiconsIcon icon={CalculatorIcon} className="w-4 h-4 text-subject-math" />
							</div>
							<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
								<div className="h-full w-3/4 bg-subject-math rounded-full" />
							</div>
							<span className="label-xs font-numeric tabular-nums">math 92%</span>
						</m.div>

						<m.div
							initial={{ opacity: 0, scale: 0.8, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{
								delay: 0.5,
								ease: 'easeInOut' as const,
							}}
							className="absolute -bottom-2 -right-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-elevation-2 border border-border/50 flex flex-col items-center justify-center p-2 z-20 will-change-transform"
						>
							<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-life/20 flex items-center justify-center mb-1">
								<HugeiconsIcon icon={BrainIcon} className="w-4 h-4 text-subject-life" />
							</div>
							<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
								<div className="h-full w-1/2 bg-subject-life rounded-full" />
							</div>
							<span className="label-xs font-numeric tabular-nums">physics 78%</span>
						</m.div>

						<m.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
							className="absolute -right-4 -top-6 bg-card rounded-[var(--radius-lg)] p-2 shadow-elevation-2 border border-border/50"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-[var(--radius-md)] bg-success/10 flex items-center justify-center">
									<HugeiconsIcon icon={FlashIcon} className="w-5 h-5 text-success" />
								</div>
								<div>
									<p className="text-xs font-bold font-numeric tabular-nums">2,450</p>
									<p className="text-xs text-muted-foreground">xp earned</p>
								</div>
							</div>
						</m.div>

						<m.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.7 }}
							className="absolute -left-12 bottom-1/4 bg-card rounded-[var(--radius-lg)] p-2 shadow-elevation-2 border border-border/50"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-[var(--radius-md)] bg-orange-100 flex items-center justify-center">
									<span className="text-lg">🔥</span>
								</div>
								<div>
									<p className="text-xs font-bold font-numeric tabular-nums">12 day</p>
									<p className="text-xs text-muted-foreground">study streak</p>
								</div>
							</div>
						</m.div>

						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.2 }}
							className="absolute -bottom-8 -left-1/4 bg-card rounded-[var(--radius-lg)] p-3 shadow-elevation-2 border border-border/50 flex items-center gap-2"
						>
							<div className="w-8 h-8 rounded-full bg-tiimo-yellow/20 flex items-center justify-center">
								<HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-tiimo-yellow" />
							</div>
							<div>
								<p className="text-sm font-bold font-numeric">top 5%</p>
								<p className="text-[10px] text-muted-foreground">math challenge</p>
							</div>
						</m.div>
					</div>
				</div>
			</m.div>
		</m.div>
	);
}

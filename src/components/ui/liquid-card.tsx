'use client';

import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ANIMATION_PRESETS } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface LiquidCardProps {
	children: React.ReactNode;
	className?: string;
	animated?: boolean;
	hover?: boolean;
}

export function LiquidCard({
	children,
	className,
	animated = true,
	hover = true,
}: LiquidCardProps) {
	const prefersReducedMotion = useReducedMotion();

	const hoverVariants: Variants = hover
		? {
				rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
				hover: {
					y: -2,
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					transition: { duration: 0.2 },
				},
			}
		: {};

	const containerVariants: Variants = animated
		? {
				initial: prefersReducedMotion ? { opacity: 1 } : ANIMATION_PRESETS.card.initial,
				animate: prefersReducedMotion ? { opacity: 1 } : ANIMATION_PRESETS.card.animate,
			}
		: {};

	return (
		<motion.div
			variants={containerVariants}
			initial="initial"
			animate="animate"
			whileHover={!prefersReducedMotion && hover ? 'hover' : undefined}
			variants-hover={hoverVariants}
			className={cn('rounded-2xl border border-border bg-card p-6', className)}
		>
			{children}
		</motion.div>
	);
}

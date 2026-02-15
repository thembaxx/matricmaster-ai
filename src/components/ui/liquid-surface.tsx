'use client';

import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface LiquidSurfaceProps {
	children: React.ReactNode;
	className?: string;
	variant?: 'default' | 'elevated' | 'overlay';
	blurred?: boolean;
	animated?: boolean;
}

export function LiquidSurface({
	children,
	className,
	variant = 'default',
	blurred = true,
	animated = true,
}: LiquidSurfaceProps) {
	const prefersReducedMotion = useReducedMotion();

	const baseStyles = 'rounded-2xl border';

	const variantStyles = {
		default: 'bg-surface-base/80 dark:bg-surface-base/80',
		elevated: 'bg-surface-elevated/90 dark:bg-surface-elevated/90',
		overlay: 'bg-surface-overlay/95 dark:bg-surface-overlay/95',
	};

	const blurStyles = blurred ? 'backdrop-blur-xl backdrop-saturate-150' : '';

	const borderStyles =
		variant === 'overlay'
			? 'border-border/60 dark:border-border-strong/40'
			: 'border-border/40 dark:border-border/30';

	const shadowStyles = {
		default: 'shadow-sm',
		elevated: 'shadow-lg',
		overlay: 'shadow-xl',
	};

	const variants: Variants = animated
		? {
				initial: { opacity: 0, y: 8 },
				animate: { opacity: 1, y: 0 },
			}
		: {};

	return (
		<motion.div
			variants={variants}
			initial={animated && !prefersReducedMotion ? 'initial' : false}
			animate={animated && !prefersReducedMotion ? 'animate' : false}
			transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
			className={cn(
				baseStyles,
				variantStyles[variant],
				blurStyles,
				borderStyles,
				shadowStyles[variant],
				className
			)}
		>
			{children}
		</motion.div>
	);
}

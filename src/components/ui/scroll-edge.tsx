'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface ScrollEdgeProps {
	children: React.ReactNode;
	className?: string;
	scrollContainerRef?: React.RefObject<HTMLElement | null>;
	showShadow?: boolean;
}

export function ScrollEdge({
	children,
	className,
	scrollContainerRef,
	showShadow = true,
}: ScrollEdgeProps) {
	const prefersReducedMotion = useReducedMotion();

	const { scrollY } = useScroll({
		target: scrollContainerRef ?? undefined,
		offset: ['start start', 'end start'],
	});

	const opacityValue = useTransform(scrollY, [0, 50], [0, 1]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={cn('relative', className)}
		>
			{children}
			{!prefersReducedMotion && (
				<motion.div
					className={cn(
						'pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/90 to-transparent',
						showShadow && 'shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'
					)}
					style={{ opacity: opacityValue }}
					aria-hidden="true"
				/>
			)}
		</motion.div>
	);
}

interface StickyHeaderProps {
	children: React.ReactNode;
	className?: string;
	scrollContainerRef?: React.RefObject<HTMLElement | null>;
	blurred?: boolean;
}

export function StickyHeader({
	children,
	className,
	scrollContainerRef,
	blurred = true,
}: StickyHeaderProps) {
	const prefersReducedMotion = useReducedMotion();

	const { scrollY } = useScroll({
		target: scrollContainerRef ?? undefined,
		offset: ['start start', 'end start'],
	});

	const headerBlur = useTransform(scrollY, [0, 20], ['blur(0px)', 'blur(20px)']);

	const headerShadow = useTransform(
		scrollY,
		[0, 50],
		['0 0 0 rgba(0,0,0,0)', '0 4px 20px rgba(0,0,0,0.1)']
	);

	return (
		<motion.header
			className={cn(
				'sticky top-0 z-50 transition-shadow duration-300',
				blurred && 'bg-surface-base/80 dark:bg-surface-base/80 backdrop-blur-xl',
				!blurred && 'bg-background',
				className
			)}
			style={
				prefersReducedMotion
					? {}
					: { backdropFilter: headerBlur as never, boxShadow: headerShadow as never }
			}
		>
			{children}
		</motion.header>
	);
}

'use client';

import { motion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { getMotionTransition, useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export interface LiquidButtonProps extends ButtonProps {
	liquid?: boolean;
}

export function LiquidButton({ children, className, liquid = true, ...props }: LiquidButtonProps) {
	const prefersReducedMotion = useReducedMotion();
	const transition = getMotionTransition(prefersReducedMotion);

	if (!liquid || prefersReducedMotion) {
		return (
			<Button className={className} {...props}>
				{children}
			</Button>
		);
	}

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.97 }}
			transition={transition as never}
			className="inline-flex"
		>
			<Button className={cn('shadow-lg shadow-primary/20', className)} {...props}>
				{children}
			</Button>
		</motion.div>
	);
}

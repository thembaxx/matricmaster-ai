'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import { AnimatePresence, motion as m, type Variants } from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DURATION, EASING } from '@/lib/animation-presets';

interface PageTransitionProps {
	children: ReactNode;
}

const pageVariants: Variants = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -8 },
};

export function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();

	return (
		<LazyMotion features={domAnimation}>
			<AnimatePresence mode="wait" initial={false}>
				<m.div
					key={pathname}
					initial="initial"
					animate="animate"
					exit="exit"
					variants={pageVariants}
					transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
					className="w-full"
				>
					{children}
				</m.div>
			</AnimatePresence>
		</LazyMotion>
	);
}

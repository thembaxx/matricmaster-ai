'use client';

import { AnimatePresence, domAnimation, LazyMotion, m, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

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
					transition={{ duration: 0.3 }}
					className="w-full"
				>
					{children}
				</m.div>
			</AnimatePresence>
		</LazyMotion>
	);
}

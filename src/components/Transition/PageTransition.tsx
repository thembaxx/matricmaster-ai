'use client';

import { motion, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getPageTransition, useReducedMotion } from '@/hooks/use-reduced-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const transition = getPageTransition(prefersReducedMotion);

	const variants: Variants = {
		initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
		animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
		exit: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 },
	};

	return (
		<motion.div
			key={pathname}
			initial="initial"
			animate="animate"
			exit="exit"
			variants={variants}
			transition={transition}
			className="h-full w-full grow flex flex-col"
		>
			{children}
		</motion.div>
	);
}

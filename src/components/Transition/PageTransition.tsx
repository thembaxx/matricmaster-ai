'use client';

import { m, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getPageTransition, useReducedMotion } from '@/hooks/use-reduced-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const transition = getPageTransition(prefersReducedMotion);

	const variants: Variants = {
		initial: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 0, scale: 0.98, filter: 'blur(10px)', y: 20 },
		animate: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 },
		exit: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 0, scale: 0.99, filter: 'blur(5px)', y: -20 },
	};

	return (
		<m.div
			key={pathname}
			initial="initial"
			animate="animate"
			exit="exit"
			variants={variants}
			transition={{
				type: 'spring',
				stiffness: 300,
				damping: 30,
				mass: 1,
				...transition,
			}}
			className="h-full w-full grow flex flex-col"
		>
			{children}
		</m.div>
	);
}

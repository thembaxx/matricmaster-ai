'use client';

import { m, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getPageTransition, useReducedMotion } from '@/hooks/use-reduced-motion';
import { useNavigationTransition, ViewTransition } from './ViewTransition';

interface PageTransitionProps {
	children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const transition = getPageTransition(prefersReducedMotion);
	const prevPathname = useRef(pathname);

	prevPathname.current = pathname;

	const { forward, back } = useNavigationTransition();

	const variants: Variants = {
		initial: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 0, scale: 0.98, filter: 'blur(10px)', y: 10 },
		animate: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 },
		exit: prefersReducedMotion
			? { opacity: 1 }
			: { opacity: 0, scale: 0.99, filter: 'blur(5px)', y: -10 },
	};

	useEffect(() => {
		const handleClickEvent = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const anchor = target.closest('a');
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (
				!href ||
				href.startsWith('#') ||
				href.startsWith('http') ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:')
			)
				return;

			e.preventDefault();

			const isBack =
				href.length < pathname.length || (pathname.startsWith(href) && href !== pathname);

			if (isBack) {
				back(href);
			} else {
				forward(href);
			}
		};

		document.addEventListener('click', handleClickEvent, true);
		return () => document.removeEventListener('click', handleClickEvent, true);
	}, [pathname, forward, back]);

	return (
		<ViewTransition
			enter={{
				'nav-forward': 'vt-slide-from-right',
				'nav-back': 'vt-slide-from-left',
				default: 'vt-fade-in',
			}}
			exit={{
				'nav-forward': 'vt-slide-to-left',
				'nav-back': 'vt-slide-to-right',
				default: 'vt-fade-out',
			}}
			share={{ 'nav-forward': 'vt-morph', 'nav-back': 'vt-morph', default: 'vt-morph' }}
			default="none"
		>
			<m.div
				key={pathname}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={variants}
				transition={{
					type: 'spring',
					stiffness: 260,
					damping: 25,
					mass: 1,
					...transition,
				}}
				className="h-full w-full grow flex flex-col"
			>
				{children}
			</m.div>
		</ViewTransition>
	);
}

'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		setPrefersReducedMotion(mediaQuery.matches);

		const handler = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, []);

	return prefersReducedMotion;
}

export function getMotionTransition(reducedMotion: boolean) {
	if (reducedMotion) {
		return { duration: 0.1 };
	}
	return {
		type: 'spring',
		stiffness: 260,
		damping: 22,
		mass: 1,
	};
}

export function getPageTransition(reducedMotion: boolean) {
	if (reducedMotion) {
		return { duration: 0.1 };
	}
	return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };
}

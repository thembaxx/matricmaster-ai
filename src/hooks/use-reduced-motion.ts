'use client';

import { useEffect, useState } from 'react';
import { useZModeStore } from '@/stores/useZModeStore';

export const DURATION = {
	instant: 0.1,
	quick: 0.15,
	normal: 0.25,
	slow: 0.25,
	slower: 0.3,
} as const;

export const SPRING_CONFIG = {
	responsive: { stiffness: 300, damping: 30, mass: 1 },
	bouncy: { stiffness: 400, damping: 28, mass: 1 },
	gentle: { stiffness: 200, damping: 24, mass: 1 },
	fluid: { stiffness: 350, damping: 28, mass: 0.9 },
	press: { stiffness: 400, damping: 30, mass: 0.8 },
	gesture: { stiffness: 300, damping: 30, mass: 1 },
	interruptible: { stiffness: 400, damping: 35 },
} as const;

export const PHYSICS = {
	ACTIVE_SCALE: 0.97,
	HOVER_SCALE: 1.02,
	SQUASH_MIN: 0.95,
	SQUASH_MAX: 1.05,
	DEFORMATION_RANGE: { min: 0.97, max: 1.02 },
} as const;

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

export function useZMode() {
	const isZMode = useZModeStore((state) => state.isZMode);
	return isZMode;
}

export function useShouldReduceMotion() {
	const reduceMotion = useReducedMotion();
	const zMode = useZMode();
	return reduceMotion || zMode;
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

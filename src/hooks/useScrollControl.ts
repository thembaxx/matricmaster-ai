'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface ScrollPosition {
	top: number;
}

const scrollPositions = new Map<string, ScrollPosition>();

export function useScrollControl() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const getKey = useCallback(() => {
		const params = searchParams.toString();
		return params ? `${pathname}?${params}` : pathname;
	}, [pathname, searchParams]);

	useEffect(() => {
		const key = getKey();
		const position = scrollPositions.get(key);

		if (position) {
			window.scrollTo(0, position.top);
		} else {
			window.scrollTo(0, 0);
		}
	}, [getKey]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			const key = getKey();
			scrollPositions.set(key, { top: window.scrollY });
		};

		const handleScroll = () => {
			const key = getKey();
			scrollPositions.set(key, { top: window.scrollY });
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('scroll', handleScroll);
		};
	}, [getKey]);
}

export function useScrollToTop() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);
}

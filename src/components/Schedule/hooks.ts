'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(true);

	useEffect(() => {
		const check = () => setMatches(window.matchMedia(query).matches);
		check();
		const mediaQuery = window.matchMedia(query);
		mediaQuery.addEventListener('change', check);
		return () => mediaQuery.removeEventListener('change', check);
	}, [query]);

	return matches;
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

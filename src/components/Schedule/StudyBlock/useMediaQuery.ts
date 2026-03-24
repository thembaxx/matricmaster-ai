'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
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

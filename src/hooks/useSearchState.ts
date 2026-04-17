'use client';

import { useCallback, useState } from 'react';

interface SearchState {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	clearSearch: () => void;
}

interface DebouncedSearchState extends SearchState {
	isDebouncing: boolean;
}

export function useSearchState(initial = ''): SearchState {
	const [searchQuery, setSearchQuery] = useState(initial);

	const clearSearch = useCallback(() => setSearchQuery(''), []);

	return { searchQuery, setSearchQuery, clearSearch };
}

export function useDebouncedSearchState(initial = '', delayMs = 300): DebouncedSearchState {
	const [searchQuery, setSearchQuery] = useState(initial);
	const [isDebouncing, setIsDebouncing] = useState(false);

	const handleSetSearch = useCallback(
		(query: string) => {
			setIsDebouncing(true);
			setSearchQuery(query);

			const timeout = setTimeout(() => {
				setIsDebouncing(false);
			}, delayMs);

			return () => clearTimeout(timeout);
		},
		[delayMs]
	);

	const clearSearch = useCallback(() => {
		setSearchQuery('');
		setIsDebouncing(false);
	}, []);

	return {
		searchQuery,
		setSearchQuery: handleSetSearch,
		clearSearch,
		isDebouncing,
	};
}

export function useLocalState<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === 'undefined') return initialValue;
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : initialValue;
	});

	const setStored = useCallback(
		(newValue: T) => {
			setValue(newValue);
			localStorage.setItem(key, JSON.stringify(newValue));
		},
		[key]
	);

	return [value, setStored] as const;
}

export default { useSearchState, useDebouncedSearchState, useLocalState };

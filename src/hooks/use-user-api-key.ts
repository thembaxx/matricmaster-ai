'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'matricmaster_user_gemini_api_key';

export interface UseUserApiKeyReturn {
	apiKey: string | null;
	setApiKey: (key: string) => void;
	clearApiKey: () => void;
	isLoading: boolean;
	hasApiKey: boolean;
}

export function useUserApiKey(): UseUserApiKeyReturn {
	const [apiKey, setApiKeyState] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setApiKeyState(stored);
			}
		} catch (error) {
			console.debug('Failed to load API key from localStorage:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const setApiKey = useCallback((key: string) => {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEY, key);
			setApiKeyState(key);
		} catch (error) {
			console.debug('Failed to save API key to localStorage:', error);
		}
	}, []);

	const clearApiKey = useCallback(() => {
		if (typeof window === 'undefined') return;

		try {
			localStorage.removeItem(STORAGE_KEY);
			setApiKeyState(null);
		} catch (error) {
			console.debug('Failed to clear API key from localStorage:', error);
		}
	}, []);

	return {
		apiKey,
		setApiKey,
		clearApiKey,
		isLoading,
		hasApiKey: !!apiKey,
	};
}

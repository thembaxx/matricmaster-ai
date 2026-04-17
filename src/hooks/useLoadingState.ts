'use client';

import { useCallback, useState } from 'react';

interface LoadingState {
	isLoading: boolean;
	startLoading: () => void;
	stopLoading: () => void;
	setLoading: (loading: boolean) => void;
	toggleLoading: () => void;
}

interface AsyncActionState extends LoadingState {
	error: Error | null;
	setError: (error: Error | null) => void;
	clearError: () => void;
	execute: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

export function useLoadingState(initial = false): LoadingState {
	const [isLoading, setIsLoading] = useState(initial);

	const startLoading = useCallback(() => setIsLoading(true), []);
	const stopLoading = useCallback(() => setIsLoading(false), []);
	const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);
	const toggleLoading = useCallback(() => setIsLoading((prev) => !prev), []);

	return { isLoading, startLoading, stopLoading, setLoading, toggleLoading };
}

export function useAsyncActionState(initial = false): AsyncActionState {
	const [isLoading, setIsLoading] = useState(initial);
	const [error, setError] = useState<Error | null>(null);

	const startLoading = useCallback(() => setIsLoading(true), []);
	const stopLoading = useCallback(() => setIsLoading(false), []);
	const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);
	const toggleLoading = useCallback(() => setIsLoading((prev) => !prev), []);
	const setErrorState = useCallback((error: Error | null) => setError(error), []);
	const clearError = useCallback(() => setError(null), []);

	const execute = useCallback(async <T>(fn: () => Promise<T>) => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await fn();
			return result;
		} catch (e) {
			setError(e as Error);
			return undefined;
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		isLoading,
		startLoading,
		stopLoading,
		setLoading,
		toggleLoading,
		error,
		setError: setErrorState,
		clearError,
		execute,
	};
}

export function useTabsState(initial: string): [string, (value: string) => void] {
	const [activeTab, setActiveTab] = useState(initial);

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value);
	}, []);

	return [activeTab, handleTabChange];
}

export default { useLoadingState, useAsyncActionState, useTabsState };

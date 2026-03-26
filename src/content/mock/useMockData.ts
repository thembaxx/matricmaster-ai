'use client';

import { useCallback, useEffect, useState } from 'react';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UseMockDataOptions {
	delay?: number;
	simulateError?: boolean;
	errorMessage?: string;
}

export interface UseMockDataResult<T> {
	data: T | null;
	state: LoadingState;
	error: string | null;
	refetch: () => void;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
}

export function useMockData<T>(
	fetchFn: () => T | Promise<T>,
	options: UseMockDataOptions = {}
): UseMockDataResult<T> {
	const { delay = 500, simulateError = false, errorMessage = 'Failed to load data' } = options;

	const [data, setData] = useState<T | null>(null);
	const [state, setState] = useState<LoadingState>('idle');
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(async () => {
		setState('loading');
		setError(null);

		try {
			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			if (simulateError) {
				throw new Error(errorMessage);
			}

			const result = await fetchFn();
			setData(result);
			setState('success');
		} catch (err) {
			setError(err instanceof Error ? err.message : errorMessage);
			setState('error');
		}
	}, [fetchFn, delay, simulateError, errorMessage]);

	useEffect(() => {
		execute();
	}, [execute]);

	return {
		data,
		state,
		error,
		refetch: execute,
		isLoading: state === 'loading',
		isError: state === 'error',
		isSuccess: state === 'success',
	};
}

export function useMockDataList<T>(
	items: T[],
	options: UseMockDataOptions = {}
): UseMockDataResult<T[]> {
	const fetchFn = useCallback(() => Promise.resolve(items), [items]);
	return useMockData(fetchFn, options);
}

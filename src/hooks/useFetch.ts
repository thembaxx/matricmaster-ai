'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, apiClient } from '@/lib/api/client';

interface UseFetchOptions<T> {
	enabled?: boolean;
	onSuccess?: (data: T) => void;
	onError?: (error: ApiError) => void;
}

interface UseFetchResult<T> {
	data: T | null;
	error: ApiError | null;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
	refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching data with AbortController support.
 * Automatically cancels pending requests when component unmounts.
 *
 * @param endpoint - API endpoint to fetch
 * @param options - Configuration options
 * @returns Fetch state and control functions
 */
export function useFetch<T>(
	endpoint: string | null,
	options?: UseFetchOptions<T>
): UseFetchResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);

	const fetchData = useCallback(async () => {
		if (!endpoint) return;

		// Cancel any pending request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller
		abortControllerRef.current = new AbortController();

		setIsLoading(true);
		setError(null);

		try {
			const result = await apiClient.get<T>(endpoint, {
				signal: abortControllerRef.current.signal,
			});

			if (isMountedRef.current) {
				setData(result);
				setIsLoading(false);
				options?.onSuccess?.(result);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof DOMException && err.name === 'AbortError') {
				return;
			}

			if (isMountedRef.current) {
				const apiError =
					err instanceof ApiError ? err : new ApiError('Network error', 0, String(err));
				setError(apiError);
				setIsLoading(false);
				options?.onError?.(apiError);
			}
		}
	}, [endpoint, options]);

	// Initial fetch
	useEffect(() => {
		isMountedRef.current = true;

		if (endpoint) {
			fetchData();
		}

		return () => {
			isMountedRef.current = false;
			// Cleanup: abort pending request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [endpoint, fetchData]);

	return {
		data,
		error,
		isLoading,
		isError: error !== null,
		isSuccess: data !== null && error === null,
		refetch: fetchData,
	};
}

/**
 * Hook for mutation operations (POST, PUT, DELETE) with AbortController
 */
export function useMutation<TData, TVariables = unknown>(
	method: 'POST' | 'PUT' | 'DELETE',
	endpoint: string,
	options?: {
		onSuccess?: (data: TData) => void;
		onError?: (error: ApiError) => void;
		onSettled?: () => void;
	}
) {
	const [data, setData] = useState<TData | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [isMutating, setIsMutating] = useState(false);

	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const mutate = useCallback(
		async (variables: TVariables) => {
			// Cancel any pending mutation
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();

			setIsMutating(true);
			setError(null);

			try {
				let result: TData;

				switch (method) {
					case 'POST':
						result = await apiClient.post<TData>(endpoint, variables, {
							signal: abortControllerRef.current.signal,
						});
						break;
					case 'PUT':
						result = await apiClient.put<TData>(endpoint, variables, {
							signal: abortControllerRef.current.signal,
						});
						break;
					case 'DELETE':
						result = await apiClient.delete<TData>(endpoint, {
							signal: abortControllerRef.current.signal,
						});
						break;
				}

				if (isMountedRef.current) {
					setData(result);
					setIsMutating(false);
					options?.onSuccess?.(result);
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					return;
				}

				if (isMountedRef.current) {
					const apiError =
						err instanceof ApiError ? err : new ApiError('Network error', 0, String(err));
					setError(apiError);
					setIsMutating(false);
					options?.onError?.(apiError);
				}
			} finally {
				if (isMountedRef.current) {
					options?.onSettled?.();
				}
			}
		},
		[method, endpoint, options]
	);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setIsMutating(false);
	}, []);

	return {
		mutate,
		data,
		error,
		isMutating,
		isError: error !== null,
		isSuccess: data !== null && error === null,
		reset,
	};
}

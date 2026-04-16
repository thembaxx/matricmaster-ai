import { queryClient } from './client';

// Request queue for handling 401 race conditions
interface PendingRequest {
	config: RequestInit;
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
	retryCount: number;
}

let refreshSubscribers: PendingRequest[] = [];
let isRefreshing = false;

const subscribeTokenRefresh = (
	config: RequestInit,
	resolve: (value: unknown) => void,
	reject: (reason?: unknown) => void,
	retryCount = 0
) => {
	refreshSubscribers.push({
		config,
		resolve,
		reject,
		retryCount,
	});
};

const onRefreshed = async () => {
	if (isRefreshing) return;
	isRefreshing = true;

	try {
		const response = await fetch('/api/auth/refresh', { method: 'POST' });
		if (!response.ok) throw new Error('Refresh failed');

		const subscribers = [...refreshSubscribers];
		refreshSubscribers = [];

		for (const sub of subscribers) {
			const { config, resolve, reject, retryCount } = sub;
			if (retryCount >= 3) {
				reject(new Error('Max retry attempts reached'));
				continue;
			}
			fetchWithAuth(config, '', retryCount + 1)
				.then(resolve)
				.catch(reject);
		}
	} catch (error) {
		const subscribers = [...refreshSubscribers];
		refreshSubscribers = [];
		subscribers.forEach(({ reject }) => {
			reject(error);
		});

		if (typeof window !== 'undefined') {
			queryClient.clear();
			window.dispatchEvent(new Event('auth-expired'));
		}
	} finally {
		isRefreshing = false;
	}
};

const fetchWithAuth = async (
	config: RequestInit,
	baseURL: string,
	retryCount = 0
): Promise<unknown> => {
	const url = `${baseURL}${config.method === 'GET' ? `?${new URLSearchParams(config.body as string)}` : ''}`;

	try {
		const response = await fetch(url, {
			...config,
			headers: {
				'Content-Type': 'application/json',
				...config.headers,
			},
			credentials: 'include',
		});

		if (!response.ok) {
			const errorText = await response.text();

			// Handle 401 specifically for silent refresh
			if (response.status === 401 && retryCount < 3) {
				return new Promise((resolve, reject) => {
					subscribeTokenRefresh(config, resolve, reject, retryCount);
					onRefreshed(); // Trigger refresh attempt
				});
			}

			// For non-GET requests that fail with 5xx or are offline (captured in catch)
			// we add to the mutation queue if it's a mutation.
			if (response.status >= 500 && config.method !== 'GET') {
				const { useMutationQueueStore } = await import('@/stores/useMutationQueueStore');
				useMutationQueueStore.getState().addToQueue({
					url,
					method: config.method || 'POST',
					body: config.body,
					headers: (config.headers as Record<string, string>) || {},
				});
			}

			const error = new Error(`HTTP error! status: ${response.status}`);
			// @ts-expect-error - Add additional error info
			error.status = response.status;
			// @ts-expect-error - Add error text
			error.statusText = errorText;
			throw error;
		}

		return response.json();
	} catch (error) {
		// Network errors / Offline
		if (config.method !== 'GET') {
			const { useMutationQueueStore } = await import('@/stores/useMutationQueueStore');
			useMutationQueueStore.getState().addToQueue({
				url,
				method: config.method || 'POST',
				body: config.body,
				headers: (config.headers as Record<string, string>) || {},
			});
		}
		throw error;
	}
};

// Enhanced API client with authentication interceptor
export class AuthenticatedApiClient {
	private baseURL: string;

	constructor(baseURL = '') {
		this.baseURL = baseURL;
	}

	private async handleAuthError(
		status: number,
		config: RequestInit,
		retryCount = 0
	): Promise<unknown> {
		if (status === 401) {
			if (!isRefreshing) {
				isRefreshing = true;
				onRefreshed();
			}
			return new Promise((resolve, reject) => {
				subscribeTokenRefresh(config, resolve, reject, retryCount);
			});
		}

		if (status === 403) {
			queryClient.clear();

			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath !== '/login' && currentPath !== '/register') {
					window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
				}
			}
		}
		throw new Error(`Authentication failed with status: ${status}`);
	}

	async get<T>(_endpoint: string, options: RequestInit = {}): Promise<T> {
		const config: RequestInit = {
			method: 'GET',
			...options,
		};

		try {
			return (await fetchWithAuth(config, this.baseURL, 0)) as T;
		} catch (error) {
			const handled = await this.handleAuthError(
				(error as Error & { status?: number }).status ?? 0,
				config,
				0
			);
			if (handled) return handled as T;
			throw error;
		}
	}

	async post<T>(_endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
		const config: RequestInit = {
			method: 'POST',
			...options,
			body: data ? JSON.stringify(data) : undefined,
		};

		try {
			return (await fetchWithAuth(config, this.baseURL, 0)) as T;
		} catch (error) {
			const handled = await this.handleAuthError(
				(error as Error & { status?: number }).status ?? 0,
				config,
				0
			);
			if (handled) return handled as T;
			throw error;
		}
	}

	async put<T>(_endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
		const config: RequestInit = {
			method: 'PUT',
			...options,
			body: data ? JSON.stringify(data) : undefined,
		};

		try {
			return (await fetchWithAuth(config, this.baseURL, 0)) as T;
		} catch (error) {
			const handled = await this.handleAuthError(
				(error as Error & { status?: number }).status ?? 0,
				config,
				0
			);
			if (handled) return handled as T;
			throw error;
		}
	}

	async delete<T>(_endpoint: string, options: RequestInit = {}): Promise<T> {
		const config: RequestInit = {
			method: 'DELETE',
			...options,
		};

		try {
			return (await fetchWithAuth(config, this.baseURL, 0)) as T;
		} catch (error) {
			const handled = await this.handleAuthError(
				(error as Error & { status?: number }).status ?? 0,
				config,
				0
			);
			if (handled) return handled as T;
			throw error;
		}
	}
}

// Create authenticated API client instance
export const authenticatedApiClient = new AuthenticatedApiClient();

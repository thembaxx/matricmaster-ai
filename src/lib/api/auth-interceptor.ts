import { queryClient } from './client';

// Request queue for handling 401 race conditions
interface PendingRequest {
	config: RequestInit;
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
	retryCount: number;
}

let refreshSubscribers: PendingRequest[] = [];

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

// onRefreshed is available for future token refresh integration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error - unused function for future token refresh integration
const _onRefreshed = () => {
	refreshSubscribers.forEach(({ config, resolve, reject, retryCount }) => {
		if (retryCount >= 3) {
			reject(new Error('Max retry attempts reached'));
			return;
		}
		fetchWithAuth(config, '', retryCount + 1)
			.then(resolve)
			.catch(reject);
	});
	refreshSubscribers = [];
};

const fetchWithAuth = async (
	config: RequestInit,
	baseURL: string,
	retryCount = 0
): Promise<unknown> => {
	const url = `${baseURL}${config.method === 'GET' ? `?${new URLSearchParams(config.body as string)}` : ''}`;

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
		if (response.status === 401 && retryCount < 3) {
			return new Promise((resolve, reject) => {
				subscribeTokenRefresh(config, resolve, reject, retryCount);
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
		if (status === 401 || status === 403) {
			queryClient.clear();

			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
					window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`;
				}
			}

			if (status === 401) {
				return new Promise((resolve, reject) => {
					subscribeTokenRefresh(config, resolve, reject, retryCount);
				});
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

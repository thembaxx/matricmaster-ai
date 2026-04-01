import { queryClient } from './client';

// Enhanced API client with authentication interceptor
export class AuthenticatedApiClient {
	private baseURL: string;

	constructor(baseURL = '') {
		this.baseURL = baseURL;
	}

	private handleAuthError(status: number) {
		if (status === 401 || status === 403) {
			// Clear cached data that might be stale due to auth issues
			queryClient.clear();

			// Redirect to sign-in if on client side
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
					window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`;
				}
			}
		}
	}

	async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const { headers: customHeaders, ...restOptions } = options;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...customHeaders,
			},
			credentials: 'include',
			...restOptions,
		});

		if (!response.ok) {
			this.handleAuthError(response.status);
			const errorText = await response.text();
			const error = new Error(`HTTP error! status: ${response.status}`);
			// @ts-expect-error - Add additional error info
			error.status = response.status;
			// @ts-expect-error - Add error text
			error.statusText = errorText;
			throw error;
		}

		return response.json();
	}

	async post<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const { headers: customHeaders, ...restOptions } = options;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...customHeaders,
			},
			credentials: 'include',
			body: data ? JSON.stringify(data) : undefined,
			...restOptions,
		});

		if (!response.ok) {
			this.handleAuthError(response.status);
			const errorText = await response.text();
			const error = new Error(`HTTP error! status: ${response.status}`);
			// @ts-expect-error - Add additional error info
			error.status = response.status;
			// @ts-expect-error - Add error text
			error.statusText = errorText;
			throw error;
		}

		return response.json();
	}

	async put<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const { headers: customHeaders, ...restOptions } = options;

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...customHeaders,
			},
			credentials: 'include',
			body: data ? JSON.stringify(data) : undefined,
			...restOptions,
		});

		if (!response.ok) {
			this.handleAuthError(response.status);
			const errorText = await response.text();
			const error = new Error(`HTTP error! status: ${response.status}`);
			// @ts-expect-error - Add additional error info
			error.status = response.status;
			// @ts-expect-error - Add error text
			error.statusText = errorText;
			throw error;
		}

		return response.json();
	}

	async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const { headers: customHeaders, ...restOptions } = options;

		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				...customHeaders,
			},
			credentials: 'include',
			...restOptions,
		});

		if (!response.ok) {
			this.handleAuthError(response.status);
			const errorText = await response.text();
			const error = new Error(`HTTP error! status: ${response.status}`);
			// @ts-expect-error - Add additional error info
			error.status = response.status;
			// @ts-expect-error - Add error text
			error.statusText = errorText;
			throw error;
		}

		return response.json();
	}
}

// Create authenticated API client instance
export const authenticatedApiClient = new AuthenticatedApiClient();

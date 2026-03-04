import { queryClient } from './client';

// Enhanced API client with authentication interceptor
export class AuthenticatedApiClient {
	private baseURL: string;

	constructor(baseURL = '') {
		this.baseURL = baseURL;
	}

	private async getAuthToken(): Promise<string | null> {
		// Try to get token from various sources
		if (typeof window !== 'undefined') {
			// Client-side: try to get from localStorage or cookies
			const token = localStorage.getItem('auth-token');
			if (token) return token;
		}
		return null;
	}

	private async getAuthHeaders(): Promise<Record<string, string>> {
		const token = await this.getAuthToken();
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return headers;
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
		const headers = await this.getAuthHeaders();

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				...headers,
				...options.headers,
			},
			...options,
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
		const headers = await this.getAuthHeaders();

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				...headers,
				...options.headers,
			},
			body: data ? JSON.stringify(data) : undefined,
			...options,
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
		const headers = await this.getAuthHeaders();

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				...headers,
				...options.headers,
			},
			body: data ? JSON.stringify(data) : undefined,
			...options,
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
		const headers = await this.getAuthHeaders();

		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				...headers,
				...options.headers,
			},
			...options,
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

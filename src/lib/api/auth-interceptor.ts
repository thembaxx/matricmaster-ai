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
			try {
				const token = localStorage.getItem('auth-token');
				if (token) return token;
			} catch (e) {
				console.error('Error accessing localStorage:', e);
			}
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

	private async mergeHeaders(optionsHeaders?: HeadersInit): Promise<Record<string, string>> {
		const authHeaders = await this.getAuthHeaders();
		const merged: Record<string, string> = { ...authHeaders };

		if (optionsHeaders) {
			if (optionsHeaders instanceof Headers) {
				optionsHeaders.forEach((value, key) => {
					merged[key] = value;
				});
			} else if (Array.isArray(optionsHeaders)) {
				for (const [key, value] of optionsHeaders) {
					merged[key] = value;
				}
			} else {
				// Record<string, string>
				Object.assign(merged, optionsHeaders);
			}
		}

		return merged;
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
		const mergedHeaders = await this.mergeHeaders(customHeaders);

		const response = await fetch(url, {
			method: 'GET',
			headers: mergedHeaders,
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
		const mergedHeaders = await this.mergeHeaders(customHeaders);

		const response = await fetch(url, {
			method: 'POST',
			headers: mergedHeaders,
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
		const mergedHeaders = await this.mergeHeaders(customHeaders);

		const response = await fetch(url, {
			method: 'PUT',
			headers: mergedHeaders,
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
		const mergedHeaders = await this.mergeHeaders(customHeaders);

		const response = await fetch(url, {
			method: 'DELETE',
			headers: mergedHeaders,
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

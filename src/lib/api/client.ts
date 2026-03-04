import { QueryClient } from '@tanstack/react-query';

// Create query client with optimized settings for our application
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
			// biome-ignore lint/suspicious/noExplicitAny:NA
			retry: (failureCount: number, error: any) => {
				// Don't retry on 401/403 errors (authentication/authorization issues)
				if (error?.status === 401 || error?.status === 403) return false;
				// Don't retry on 400 errors (bad request)
				if (error?.status === 400) return false;
				// Retry up to 3 times for other errors
				return failureCount < 3;
			},
			retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		},
		mutations: {
			retry: 1, // Retry mutations once
			retryDelay: 1000,
		},
	},
});

// Enhanced fetch client with authentication support
export class ApiClient {
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

// Create default API client instance
export const apiClient = new ApiClient();

// Utility function to get base URL
export function getApiBaseUrl(): string {
	if (typeof window !== 'undefined') {
		// Client-side
		return '';
	}
	// Server-side
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

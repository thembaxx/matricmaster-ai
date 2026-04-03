import { QueryClient } from '@tanstack/react-query';

// Create query client with optimized settings for our application
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
			refetchOnWindowFocus: false, // Prevent unnecessary refetches when window gains focus

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

// Custom error class for API errors with status code
export class ApiError extends Error {
	status: number;
	statusText: string;

	constructor(message: string, status: number, statusText: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.statusText = statusText;
	}
}

// Token refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh updates
function subscribeToRefresh(callback: (token: string) => void) {
	refreshSubscribers.push(callback);
}

// Notify all subscribers of new token
function notifySubscribers(token: string) {
	for (const cb of refreshSubscribers) {
		cb(token);
	}
	refreshSubscribers = [];
}

// Attempt to refresh the authentication token
async function refreshAccessToken(): Promise<string | null> {
	try {
		const refreshToken =
			typeof window !== 'undefined' ? localStorage.getItem('refresh-token') : null;

		if (!refreshToken) {
			return null;
		}

		const response = await fetch('/api/auth/refresh', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			// Refresh token is invalid, clear auth
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth-token');
				localStorage.removeItem('refresh-token');
			}
			return null;
		}

		const data = await response.json();

		if (data.accessToken) {
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth-token', data.accessToken);
				if (data.refreshToken) {
					localStorage.setItem('refresh-token', data.refreshToken);
				}
			}
			return data.accessToken;
		}

		return null;
	} catch {
		return null;
	}
}

// Check if we should redirect to sign-in for auth errors
function handleAuthError(status: number): void {
	if ((status === 401 || status === 403) && typeof window !== 'undefined') {
		const currentPath = window.location.pathname;
		// Don't redirect if already on auth pages
		if (
			!currentPath.startsWith('/sign-in') &&
			!currentPath.startsWith('/sign-up') &&
			!currentPath.startsWith('/2fa')
		) {
			// Clear query cache for stale data
			queryClient.clear();
			// Redirect to sign-in with callback
			const signInUrl = new URL('/sign-in', window.location.origin);
			signInUrl.searchParams.set('callbackUrl', encodeURIComponent(currentPath));
			window.location.href = signInUrl.toString();
		}
	}
}

// Handle 401 errors with token refresh attempt
async function handleUnauthorized(): Promise<string | null> {
	if (isRefreshing) {
		// Wait for existing refresh to complete
		return new Promise((resolve) => {
			subscribeToRefresh((token) => {
				resolve(token);
			});
		});
	}

	isRefreshing = true;

	try {
		const newToken = await refreshAccessToken();

		if (newToken) {
			notifySubscribers(newToken);
			return newToken;
		}

		// Refresh failed, redirect to login
		handleAuthError(401);
		return null;
	} finally {
		isRefreshing = false;
	}
}

// Enhanced fetch client with authentication support and session expiry handling
export class ApiClient {
	private baseURL: string;

	constructor(baseURL = '') {
		this.baseURL = baseURL;
	}

	private async getAuthToken(): Promise<string | null> {
		if (typeof window !== 'undefined') {
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

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			// Attempt token refresh on 401 before redirecting
			if (response.status === 401) {
				const newToken = await handleUnauthorized();
				if (newToken) {
					// Retry the original request would need to be implemented
					// For now, throw to allow caller to retry with new token
					const errorText = 'Token refreshed, please retry';
					throw new ApiError(errorText, 401, errorText);
				}
			}

			// Handle session expiry
			handleAuthError(response.status);

			const errorText = await response.text().catch(() => 'Unknown error');
			throw new ApiError(`HTTP error! status: ${response.status}`, response.status, errorText);
		}

		// Handle empty responses
		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			return {} as T;
		}

		return response.json();
	}

	async get<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
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

		// If 401 and retry enabled, try refreshing token and retry once
		if (response.status === 401 && retry) {
			const newToken = await handleUnauthorized();
			if (newToken) {
				return this.get<T>(endpoint, { ...options, _retry: false }, false);
			}
		}

		return this.handleResponse<T>(response);
	}

	async post<T>(
		endpoint: string,
		data?: unknown,
		options: RequestInit = {},
		retry = true
	): Promise<T> {
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

		// If 401 and retry enabled, try refreshing token and retry once
		if (response.status === 401 && retry) {
			const newToken = await handleUnauthorized();
			if (newToken) {
				return this.post<T>(endpoint, data, { ...options, _retry: false }, false);
			}
		}

		return this.handleResponse<T>(response);
	}

	async put<T>(
		endpoint: string,
		data?: unknown,
		options: RequestInit = {},
		retry = true
	): Promise<T> {
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

		// If 401 and retry enabled, try refreshing token and retry once
		if (response.status === 401 && retry) {
			const newToken = await handleUnauthorized();
			if (newToken) {
				return this.put<T>(endpoint, data, { ...options, _retry: false }, false);
			}
		}

		return this.handleResponse<T>(response);
	}

	async delete<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
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

		// If 401 and retry enabled, try refreshing token and retry once
		if (response.status === 401 && retry) {
			const newToken = await handleUnauthorized();
			if (newToken) {
				return this.delete<T>(endpoint, { ...options, _retry: false }, false);
			}
		}

		return this.handleResponse<T>(response);
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

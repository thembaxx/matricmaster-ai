export interface RetryOptions {
	maxRetries: number;
	delayMs: number;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY_MS = 1000;

function shouldRetry(error: Error | unknown, attempt: number, maxRetries: number): boolean {
	if (attempt >= maxRetries) {
		return false;
	}
	if (error instanceof TypeError && error.message.includes('fetch')) {
		return true;
	}
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		if (
			message.includes('network') ||
			message.includes('econnrefused') ||
			message.includes('etimedout') ||
			message.includes('timeout') ||
			message.includes('abort')
		) {
			return true;
		}
	}
	return false;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
	url: string,
	options?: RequestInit,
	maxRetries: number = DEFAULT_MAX_RETRIES,
	delayMs: number = DEFAULT_DELAY_MS
): Promise<Response> {
	let lastError: Error | unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				const status = response.status;
				if (status >= 400 && status < 500) {
					return response;
				}
				throw new Error(`HTTP error ${status}`);
			}

			return response;
		} catch (error) {
			lastError = error;

			if (!shouldRetry(error, attempt, maxRetries)) {
				throw error;
			}

			const backoffDelay = delayMs * 2 ** attempt;
			await sleep(backoffDelay);
		}
	}

	throw lastError;
}

export async function retry<T>(
	fn: () => Promise<T>,
	maxRetries: number = DEFAULT_MAX_RETRIES,
	delayMs: number = DEFAULT_DELAY_MS
): Promise<T> {
	let lastError: Error | unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (!shouldRetry(error, attempt, maxRetries)) {
				throw error;
			}

			const backoffDelay = delayMs * 2 ** attempt;
			await sleep(backoffDelay);
		}
	}

	throw lastError;
}

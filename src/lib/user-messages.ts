export type ErrorCode = 'network' | 'auth' | 'rate_limit' | 'server' | 'not_found' | 'unknown';

export const userMessages: Record<ErrorCode, string> = {
	network: 'Connection issue. Please check your internet.',
	auth: 'Session expired. Please log in again.',
	rate_limit: 'Too many requests. Please wait a moment.',
	server: 'Something went wrong. Please try again later.',
	not_found: 'Content not available.',
	unknown: 'Something unexpected happened. Please try again.',
};

export function getUserMessage(error: unknown): string {
	if (!error) return userMessages.unknown;

	const errorStr = String(error).toLowerCase();

	if (
		errorStr.includes('network') ||
		errorStr.includes('fetch') ||
		errorStr.includes('ECONNREFUSED') ||
		errorStr.includes('timeout') ||
		errorStr.includes('offline') ||
		errorStr.includes('enosys') ||
		errorStr.includes('failed to fetch')
	) {
		return userMessages.network;
	}

	if (
		errorStr.includes('401') ||
		errorStr.includes('unauthorized') ||
		errorStr.includes('auth') ||
		errorStr.includes('token') ||
		errorStr.includes('session') ||
		errorStr.includes('expired')
	) {
		return userMessages.auth;
	}

	if (errorStr.includes('429') || errorStr.includes('rate') || errorStr.includes('too many')) {
		return userMessages.rate_limit;
	}

	if (
		errorStr.includes('500') ||
		errorStr.includes('502') ||
		errorStr.includes('503') ||
		errorStr.includes('504') ||
		errorStr.includes('server') ||
		errorStr.includes('internal')
	) {
		return userMessages.server;
	}

	if (
		errorStr.includes('404') ||
		errorStr.includes('not found') ||
		errorStr.includes('does not exist')
	) {
		return userMessages.not_found;
	}

	return userMessages.unknown;
}

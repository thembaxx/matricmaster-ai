'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type ErrorType = 'quota' | 'rate_limit' | 'network' | 'server' | 'auth' | 'timeout' | 'unknown';

interface ErrorState {
	type: ErrorType;
	message: string;
	details?: string;
	timestamp: Date;
	retryCount: number;
	canRetry: boolean;
	lastRetry?: Date;
}

interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
}

interface GeminiQuotaModalContextType {
	showQuotaModal: boolean;
	errorState: ErrorState | null;
	triggerError: (type: ErrorType, message?: string, details?: string) => void;
	triggerQuotaError: () => void;
	triggerNetworkError: () => void;
	hideQuotaModal: () => void;
	retryLastError: () => Promise<boolean>;
	handleServiceError: (error: Error | string) => void;
	dismissCount: number;
	isRetrying: boolean;
}

const GeminiQuotaModalContext = createContext<GeminiQuotaModalContextType | null>(null);

const RETRY_CONFIG: Record<ErrorType, RetryConfig> = {
	quota: { maxRetries: 0, baseDelay: 0, maxDelay: 0 }, // No retry for quota
	rate_limit: { maxRetries: 3, baseDelay: 1000, maxDelay: 30000 },
	network: { maxRetries: 2, baseDelay: 2000, maxDelay: 10000 },
	server: { maxRetries: 2, baseDelay: 5000, maxDelay: 30000 },
	auth: { maxRetries: 1, baseDelay: 1000, maxDelay: 5000 },
	timeout: { maxRetries: 2, baseDelay: 3000, maxDelay: 15000 },
	unknown: { maxRetries: 1, baseDelay: 2000, maxDelay: 10000 },
};

export function GeminiQuotaModalProvider({ children }: { children: React.ReactNode }) {
	const [showQuotaModal, setShowQuotaModal] = useState(false);
	const [errorState, setErrorState] = useState<ErrorState | null>(null);
	const [dismissCount, setDismissCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);

	const triggerError = useCallback((type: ErrorType, message?: string, details?: string) => {
		const defaultMessages = {
			quota: 'AI service quota exceeded. Please add your own API key to continue.',
			rate_limit: 'Too many requests. Please wait a moment before trying again.',
			network: 'Network connection error. Please check your internet connection.',
			server: 'AI service is temporarily unavailable. Please try again later.',
			auth: 'Authentication failed. Please check your API key.',
			timeout: 'Request timed out. Please try again.',
			unknown: 'An unexpected error occurred. Please try again.',
		};

		const config = RETRY_CONFIG[type];
		const canRetry = config.maxRetries > 0;

		setErrorState({
			type,
			message: message || defaultMessages[type],
			details,
			timestamp: new Date(),
			retryCount: 0,
			canRetry,
		});
		setShowQuotaModal(true);
	}, []);

	const triggerQuotaError = useCallback(() => {
		triggerError('quota');
	}, [triggerError]);

	const triggerNetworkError = useCallback(() => {
		triggerError('network');
	}, [triggerError]);

	const hideQuotaModal = useCallback(() => {
		setShowQuotaModal(false);
		setErrorState(null);
		setDismissCount((prev) => prev + 1);
	}, []);

	const retryLastError = useCallback(async (): Promise<boolean> => {
		if (
			!errorState?.canRetry ||
			errorState.retryCount >= RETRY_CONFIG[errorState.type].maxRetries
		) {
			return false;
		}

		setIsRetrying(true);

		try {
			const config = RETRY_CONFIG[errorState.type];
			const delay = Math.min(config.baseDelay * 2 ** errorState.retryCount, config.maxDelay);

			// Wait with exponential backoff
			await new Promise((resolve) => setTimeout(resolve, delay));

			// Update retry count and timestamp
			setErrorState((prev) =>
				prev
					? {
							...prev,
							retryCount: prev.retryCount + 1,
							lastRetry: new Date(),
						}
					: null
			);

			// Simulate retry logic - in real implementation, this would call the actual retry function
			// For now, we'll just hide the modal after a successful retry simulation
			setTimeout(() => {
				hideQuotaModal();
			}, 500);

			return true;
		} catch (error) {
			console.error('Retry failed:', error);
			return false;
		} finally {
			setIsRetrying(false);
		}
	}, [errorState, hideQuotaModal]);

	const handleServiceError = useCallback(
		(error: Error | string) => {
			const errorMessage = error instanceof Error ? error.message : error;

			// Parse error type from message
			let errorType: ErrorType = 'unknown';

			if (errorMessage.toLowerCase().includes('quota') || errorMessage.includes('429')) {
				errorType = 'quota';
			} else if (
				errorMessage.toLowerCase().includes('rate limit') ||
				errorMessage.toLowerCase().includes('too many requests')
			) {
				errorType = 'rate_limit';
			} else if (
				errorMessage.toLowerCase().includes('network') ||
				errorMessage.toLowerCase().includes('fetch')
			) {
				errorType = 'network';
			} else if (errorMessage.toLowerCase().includes('timeout')) {
				errorType = 'timeout';
			} else if (
				errorMessage.toLowerCase().includes('auth') ||
				errorMessage.toLowerCase().includes('unauthorized')
			) {
				errorType = 'auth';
			} else if (
				errorMessage.toLowerCase().includes('500') ||
				errorMessage.toLowerCase().includes('503') ||
				errorMessage.toLowerCase().includes('server')
			) {
				errorType = 'server';
			}

			triggerError(errorType, undefined, errorMessage);
		},
		[triggerError]
	);

	return (
		<GeminiQuotaModalContext.Provider
			value={{
				showQuotaModal,
				errorState,
				triggerError,
				triggerQuotaError,
				triggerNetworkError,
				hideQuotaModal,
				retryLastError,
				handleServiceError,
				dismissCount,
				isRetrying,
			}}
		>
			{children}
		</GeminiQuotaModalContext.Provider>
	);
}

export function useGeminiQuotaModal() {
	const context = useContext(GeminiQuotaModalContext);
	if (!context) {
		throw new Error('useGeminiQuotaModal must be used within a GeminiQuotaModalProvider');
	}
	return context;
}

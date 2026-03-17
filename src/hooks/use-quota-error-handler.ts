'use client';

import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isGeminiQuotaError } from '@/lib/ai/quota-error';

export async function withQuotaErrorHandling<T>(
	fn: () => Promise<T>,
	onQuotaError?: () => void
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		const { isQuotaError } = isGeminiQuotaError(error);

		if (isQuotaError) {
			onQuotaError?.();
		}

		throw error;
	}
}

export function useQuotaErrorHandler() {
	const { triggerQuotaError } = useGeminiQuotaModal();

	const handleError = (error: unknown) => {
		const { isQuotaError } = isGeminiQuotaError(error);
		if (isQuotaError) {
			triggerQuotaError();
		}
		return isQuotaError;
	};

	return { handleError, triggerQuotaError };
}

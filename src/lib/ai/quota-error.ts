export interface QuotaErrorInfo {
	isQuotaError: boolean;
	message: string;
	errorCode?: string;
}

export function isGeminiQuotaError(error: unknown): QuotaErrorInfo {
	if (!error) {
		return { isQuotaError: false, message: 'Unknown error' };
	}

	const errorObj = error as Record<string, unknown>;
	const errorMessage = (errorObj.message as string) || String(error);
	const errorCode = errorObj.code as string | undefined;
	const status = errorObj.status as number | undefined;
	const response = errorObj.response as Record<string, unknown> | undefined;
	const responseData = response?.data as
		| { error?: { message?: string }; message?: string }
		| undefined;

	const quotaErrorMessages = [
		'quota',
		'exceeded',
		'rate limit',
		'too many requests',
		'billing',
		'pricing',
		'insufficient quota',
		'RESOURCE_EXHAUSTED',
		'429',
		'500',
		'503',
	];

	const isQuotaMessage = quotaErrorMessages.some((quotaKeyword) =>
		errorMessage.toLowerCase().includes(quotaKeyword.toLowerCase())
	);

	const isQuotaStatus = status === 429 || status === 403 || status === 500 || status === 503;
	const isQuotaCode = errorCode === 'RESOURCE_EXHAUSTED' || errorCode === 'QUOTA_EXCEEDED';

	const isGeminiError =
		errorMessage.includes('gemini') ||
		errorMessage.includes('google ai') ||
		errorMessage.includes('generative language') ||
		errorMessage.includes('aistudio');

	const isGroqError = errorMessage.includes('groq') || errorMessage.includes('GPU');

	const isOpenRouterError = errorMessage.includes('openrouter');

	const isCohereError = errorMessage.includes('cohere');

	const isMistralError = errorMessage.includes('mistral');

	const isQuota = isQuotaMessage || isQuotaStatus || isQuotaCode;

	let userMessage = errorMessage;

	if (responseData?.error?.message) {
		userMessage = responseData.error.message as string;
	} else if (responseData?.message) {
		userMessage = responseData.message as string;
	}

	if (
		isQuota &&
		(isGeminiError || isGroqError || isOpenRouterError || isCohereError || isMistralError)
	) {
		userMessage = 'AI service temporarily unavailable. Trying alternative provider...';
	}

	return {
		isQuotaError: isQuota,
		message: userMessage,
		errorCode: errorCode || (status ? `HTTP_${status}` : undefined),
	};
}

export function shouldShowApiKeyModal(error: unknown): boolean {
	const { isQuotaError } = isGeminiQuotaError(error);
	return isQuotaError;
}

export class GeminiQuotaError extends Error {
	constructor(message = 'AI quota exceeded') {
		super(message);
		this.name = 'GeminiQuotaError';
		Error.captureStackTrace(this, GeminiQuotaError);
	}
}

export function throwIfQuotaError(error: unknown): void {
	if (isGeminiQuotaError(error).isQuotaError) {
		throw new GeminiQuotaError();
	}
}

export function isQuotaError(error: unknown): boolean {
	return error instanceof GeminiQuotaError || isGeminiQuotaError(error).isQuotaError;
}

import type { z } from 'zod';

interface SafeAiOptions<T> {
	schema: z.ZodType<T>;
	timeoutMs?: number;
	fallback?: T;
}

export class AiError extends Error {
	constructor(
		public code: 'TIMEOUT' | 'INVALID_FORMAT' | 'API_ERROR' | 'HALUCINATION',
		message: string
	) {
		super(message);
		this.name = 'AiError';
	}
}

/**
 * Validates and sanitizes AI-generated content.
 * Handles timeouts and structured data parsing.
 */
export async function safeAiResponse<T>(
	promise: Promise<string | any>,
	options: SafeAiOptions<T>
): Promise<T> {
	const { schema, timeoutMs = 15000, fallback } = options;

	try {
		const result = (await Promise.race([
			promise,
			new Promise((_, reject) =>
				setTimeout(() => reject(new AiError('TIMEOUT', 'AI processing timed out')), timeoutMs)
			),
		])) as any;

		let dataToValidate = result;

		// If the AI returned a string (common for direct LLM calls), try to parse it
		if (typeof result === 'string') {
			try {
				// Strip Markdown code blocks if present
				const jsonStr = result.replace(/```json\n?|\n?```/g, '').trim();
				dataToValidate = JSON.parse(jsonStr);
			} catch {
				throw new AiError('INVALID_FORMAT', 'AI returned invalid JSON');
			}
		}

		const validated = schema.safeParse(dataToValidate);

		if (!validated.success) {
			console.error('AI Schema Validation Failed:', validated.error);
			throw new AiError('HALUCINATION', 'AI output did not match expected structure');
		}

		return validated.data;
	} catch (error) {
		if (fallback !== undefined) {
			console.warn('AI Error encountered, using fallback:', error);
			return fallback;
		}

		if (error instanceof AiError) throw error;
		throw new AiError('API_ERROR', (error as Error).message || 'Unknown AI error');
	}
}

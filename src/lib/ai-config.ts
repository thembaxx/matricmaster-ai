import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateTextWithAI, generateWithFallback, streamTextWithAI } from '@/lib/ai';

/**
 * Create a Google Generative AI client (legacy)
 * This provides a unified interface for all AI operations
 */
export function createAIClient() {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		console.warn('GEMINI_API_KEY not configured. AI features will be disabled.');
		return null;
	}

	try {
		return new GoogleGenerativeAI(apiKey);
	} catch (error) {
		console.error('Failed to create AI client:', error);
		return null;
	}
}

/**
 * Available Gemini models with fallback hierarchy
 */
export const AI_MODELS = {
	PRIMARY: 'gemini-2.5-flash',
	FALLBACK_1: 'gemini-2.0-pro',
	FALLBACK_2: 'gemini-2.0-flash',
	FALLBACK_3: 'gemini-1.5-pro',
	FALLBACK_4: 'gemini-3.1-flash-lite', // Newer model added as fallback
} as const;

/**
 * Get the best available model with fallback logic
 */
export function getBestAvailableModel() {
	return AI_MODELS.PRIMARY;
}

/**
 * Generate text using Vercel AI SDK
 */
export async function generateAI(options: { prompt: string; system?: string; model?: string }) {
	return generateTextWithAI(options);
}

/**
 * Stream text using Vercel AI SDK
 */
export function streamAI(options: { prompt: string; system?: string; model?: string }) {
	return streamTextWithAI(options);
}

/**
 * Generate with fallback support
 */
export async function generateWithAI(prompt: string, system?: string) {
	return generateWithFallback(prompt, system);
}

/**
 * Health check for AI client
 */
export async function checkAIProviderHealth(): Promise<{
	status: 'healthy' | 'unhealthy' | 'unknown';
	latency?: number;
	error?: string;
}> {
	const startTime = Date.now();

	if (!process.env.GEMINI_API_KEY) {
		return {
			status: 'unhealthy',
			error: 'AI client not configured',
		};
	}

	try {
		await generateTextWithAI({
			prompt: 'test',
			model: AI_MODELS.PRIMARY,
		});

		const latency = Date.now() - startTime;

		return {
			status: 'healthy',
			latency,
		};
	} catch (error) {
		const latency = Date.now() - startTime;
		return {
			status: 'unhealthy',
			latency,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

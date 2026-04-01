import { generateTextWithAI, generateWithFallback, streamTextWithAI } from '@/lib/ai';

/**
 * Available Gemini models with fallback hierarchy
 */
export const AI_MODELS = {
	PRIMARY: 'gemini-2.5-flash',
	FALLBACK_1: 'gemini-2.0-pro',
	FALLBACK_2: 'gemini-2.0-flash',
	FALLBACK_3: 'gemini-1.5-pro',
	FALLBACK_4: 'gemini-3.1-flash-lite',
} as const;

/**
 * Task complexity levels for model routing
 */
export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'creative';

/**
 * Model routing table: maps task complexity to primary model and fallback chain
 */
export const MODEL_ROUTING: Record<TaskComplexity, { primary: string; fallbacks: string[] }> = {
	simple: {
		primary: AI_MODELS.PRIMARY,
		fallbacks: [AI_MODELS.FALLBACK_1, AI_MODELS.FALLBACK_2],
	},
	moderate: {
		primary: AI_MODELS.PRIMARY,
		fallbacks: [AI_MODELS.FALLBACK_1, AI_MODELS.FALLBACK_3],
	},
	complex: {
		primary: AI_MODELS.FALLBACK_1,
		fallbacks: [AI_MODELS.PRIMARY, AI_MODELS.FALLBACK_2],
	},
	creative: {
		primary: AI_MODELS.PRIMARY,
		fallbacks: [AI_MODELS.FALLBACK_1, AI_MODELS.FALLBACK_2, AI_MODELS.FALLBACK_3],
	},
};

/**
 * Get the recommended model for a given task complexity (no availability check)
 */
export function getModelForTask(complexity: TaskComplexity): string {
	const routing = MODEL_ROUTING[complexity];
	return routing.primary;
}

/**
 * Get an available model for a task, trying primary then fallbacks in order
 */
export async function getAvailableModel(complexity: TaskComplexity = 'moderate'): Promise<string> {
	const routing = MODEL_ROUTING[complexity];

	// Try primary first
	if (await isModelAvailable(routing.primary)) {
		return routing.primary;
	}

	// Try fallbacks in order
	for (const fallback of routing.fallbacks) {
		if (await isModelAvailable(fallback)) {
			return fallback;
		}
	}

	// Last resort: return primary anyway (will fail gracefully)
	return routing.primary;
}

// Alias for backward compatibility
export const getBestAvailableModel = () => 'gemini-2.5-flash';

async function isModelAvailable(modelName: string): Promise<boolean> {
	const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!apiKey) return false;

	const configuredModels: string[] = [
		AI_MODELS.PRIMARY,
		AI_MODELS.FALLBACK_1,
		AI_MODELS.FALLBACK_2,
		AI_MODELS.FALLBACK_3,
		AI_MODELS.FALLBACK_4,
	];

	return configuredModels.includes(modelName);
}

/**
 * Token budget tracking to prevent cost runaway
 */
const TOKEN_BUDGET = {
	daily: 500000,
	perRequest: 50000,
};

let dailyTokenUsage = 0;
let dailyResetDate = new Date().toDateString();

export function checkTokenBudget(estimatedTokens: number): boolean {
	if (new Date().toDateString() !== dailyResetDate) {
		dailyTokenUsage = 0;
		dailyResetDate = new Date().toDateString();
	}

	return (
		dailyTokenUsage + estimatedTokens <= TOKEN_BUDGET.daily &&
		estimatedTokens <= TOKEN_BUDGET.perRequest
	);
}

export function recordTokenUsage(tokens: number) {
	dailyTokenUsage += tokens;
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

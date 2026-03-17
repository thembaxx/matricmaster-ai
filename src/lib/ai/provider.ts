import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type LanguageModel, streamText } from 'ai';
import { isQuotaError } from './quota-error';

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const STORAGE_KEY = 'matricmaster_user_gemini_api_key';

function getUserApiKey(): string | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		return localStorage.getItem(STORAGE_KEY) || undefined;
	} catch {
		return undefined;
	}
}

function getApiKey(): string | undefined {
	const userKey = getUserApiKey();
	if (userKey) return userKey;
	return process.env.GEMINI_API_KEY;
}

function getModel(): string {
	return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

export interface AIConfig {
	model?: string;
	temperature?: number;
	topP?: number;
	system?: string;
	provider?: 'google' | 'groq' | 'openrouter' | 'cohere' | 'mistral';
}

export interface GenerateOptions extends AIConfig {
	prompt: string;
}

export interface StreamOptions extends AIConfig {
	prompt: string;
}

interface ProviderConfig {
	name: string;
	createModel: () => LanguageModel;
	apiKey: string | undefined;
}

function getGoogleProvider(): ProviderConfig {
	const apiKey = getApiKey();
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}
	return {
		name: 'google',
		apiKey,
		createModel: () => {
			const google = createGoogleGenerativeAI({ apiKey: apiKey! });
			return google(getModel());
		},
	};
}

function getGroqProvider(): ProviderConfig {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('GROQ_API_KEY is not configured');
	}
	return {
		name: 'groq',
		apiKey,
		createModel: () => {
			const groq = createGroq({ apiKey });
			return groq('llama-3.3-70b-versatile');
		},
	};
}

function getOpenRouterProvider(): ProviderConfig {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('OPENROUTER_API_KEY is not configured');
	}
	return {
		name: 'openrouter',
		apiKey,
		createModel: () => {
			const openrouter = createOpenAI({
				apiKey,
				baseURL: 'https://openrouter.ai/api/v1',
			});
			return openrouter('google/gemma-2-9b-1it:free');
		},
	};
}

function getCohereProvider(): ProviderConfig {
	const apiKey = process.env.COHERE_API_KEY;
	if (!apiKey) {
		throw new Error('COHERE_API_KEY is not configured');
	}
	return {
		name: 'cohere',
		apiKey,
		createModel: () => {
			const cohere = createCohere({ apiKey });
			return cohere('command-r-plus');
		},
	};
}

function getMistralProvider(): ProviderConfig {
	const apiKey = process.env.MISTRAL_API_KEY;
	if (!apiKey) {
		throw new Error('MISTRAL_API_KEY is not configured');
	}
	return {
		name: 'mistral',
		apiKey,
		createModel: () => {
			const mistral = createMistral({ apiKey });
			return mistral('mistral-small-latest');
		},
	};
}

const PROVIDERS: (() => ProviderConfig)[] = [
	getGoogleProvider,
	getGroqProvider,
	getOpenRouterProvider,
	getCohereProvider,
	getMistralProvider,
];

export async function generateTextWithAI(options: GenerateOptions): Promise<string> {
	const { prompt, system, temperature, topP } = options;

	let lastError: Error | null = null;

	for (const getProvider of PROVIDERS) {
		try {
			const provider = getProvider();
			const model = provider.createModel();

			const result = await generateText({
				model,
				prompt,
				system,
				temperature,
				topP,
			});

			return result.text;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			const isQuota = isQuotaError(error);
			const providerName = getProvider().name;
			console.warn(`Provider ${providerName} failed (quota: ${isQuota}): ${lastError.message}`);
		}
	}

	const allFailedMessage = `All AI providers failed. Last error: ${lastError?.message}`;
	throw new Error(allFailedMessage);
}

export function streamTextWithAI(options: StreamOptions) {
	const { prompt, system, temperature, topP } = options;

	const getProvider = () => {
		const apiKey = getApiKey();
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY is not configured');
		}
		const google = createGoogleGenerativeAI({ apiKey });
		return google(getModel());
	};

	return streamText({
		model: getProvider(),
		prompt,
		system,
		temperature,
		topP,
	});
}

export async function generateWithFallback(prompt: string, system?: string): Promise<string> {
	const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

	let lastError: Error | null = null;

	for (const modelName of models) {
		try {
			const apiKey = getApiKey();
			if (!apiKey) {
				throw new Error('GEMINI_API_KEY is not configured');
			}
			const google = createGoogleGenerativeAI({ apiKey });
			const result = await generateText({
				model: google(modelName),
				prompt,
				system,
			});
			return result.text;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(`Model ${modelName} failed, trying next...`, lastError.message);
		}
	}

	throw lastError || new Error('All models failed');
}

export async function generateWithMultiProviderFallback(
	prompt: string,
	system?: string
): Promise<{ text: string; provider: string }> {
	let lastError: Error | null = null;

	for (const getProvider of PROVIDERS) {
		try {
			const provider = getProvider();
			const model = provider.createModel();

			const result = await generateText({
				model,
				prompt,
				system,
			});

			return { text: result.text, provider: provider.name };
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			const isQuota = isQuotaError(error);
			const providerName = getProvider().name;
			console.warn(`Provider ${providerName} failed (quota: ${isQuota}): ${lastError.message}`);
		}
	}

	const allFailedMessage = `All AI providers failed. Last error: ${lastError?.message}`;
	throw new Error(allFailedMessage);
}

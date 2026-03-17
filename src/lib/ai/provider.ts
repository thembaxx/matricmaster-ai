import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { GeminiQuotaError, isGeminiQuotaError } from './quota-error';

const DEFAULT_MODEL = 'gemini-2.5-flash';

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
}

export interface GenerateOptions extends AIConfig {
	prompt: string;
}

export interface StreamOptions extends AIConfig {
	prompt: string;
}

function createGoogleProvider() {
	const apiKey = getApiKey();
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}
	return createGoogleGenerativeAI({ apiKey });
}

export async function generateTextWithAI(options: GenerateOptions): Promise<string> {
	const { prompt, model = getModel(), temperature, topP, system } = options;

	const google = createGoogleProvider();

	try {
		const result = await generateText({
			model: google(model),
			prompt,
			system,
			temperature,
			topP,
		});

		return result.text;
	} catch (error) {
		if (isGeminiQuotaError(error).isQuotaError) {
			throw new GeminiQuotaError();
		}
		throw error;
	}
}

export function streamTextWithAI(options: StreamOptions) {
	const { prompt, model = getModel(), temperature, topP, system } = options;

	const google = createGoogleProvider();

	return streamText({
		model: google(model),
		prompt,
		system,
		temperature,
		topP,
	});
}

export async function generateWithFallback(prompt: string, system?: string): Promise<string> {
	const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

	let lastError: Error | null = null;

	for (const model of models) {
		try {
			const google = createGoogleProvider();
			const result = await generateText({
				model: google(model),
				prompt,
				system,
			});
			return result.text;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(`Model ${model} failed, trying next...`, lastError.message);
		}
	}

	throw lastError || new Error('All models failed');
}

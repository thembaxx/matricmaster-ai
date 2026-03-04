import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

const DEFAULT_MODEL = 'gemini-2.5-flash';

function getApiKey(): string | undefined {
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

	const result = await generateText({
		model: google(model),
		prompt,
		system,
		temperature,
		topP,
	});

	return result.text;
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

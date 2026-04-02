import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText, type LanguageModel, streamText } from 'ai';
import { z } from 'zod';
import { isQuotaError } from './quota-error';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const STORAGE_KEY = 'lumni_user_gemini_api_key';

export interface ImagePart {
	type: 'image';
	image: string;
	mimeType?: string;
}

export interface TextPart {
	type: 'text';
	text: string;
}

export type ContentPart = ImagePart | TextPart;

export type UserMessageContent = Array<ContentPart>;

function getUserApiKey(): string | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		return localStorage.getItem(STORAGE_KEY) || undefined;
	} catch (error) {
		console.warn('Failed to read API key from localStorage:', error);
		return undefined;
	}
}

function getApiKey(): string | undefined {
	const userKey = getUserApiKey();
	if (userKey) return userKey;
	const envKey = process.env.GEMINI_API_KEY;
	if (!envKey) {
		console.warn('GEMINI_API_KEY environment variable is not set');
		return undefined;
	}
	return envKey;
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
		throw new Error(
			'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY environment variable.'
		);
	}
	return {
		name: 'google',
		apiKey,
		createModel: () => {
			const modelName = getModel();
			console.debug(`Creating Google AI model: ${modelName}`);
			const google = createGoogleGenerativeAI({ apiKey: apiKey! });
			return google(modelName);
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

export interface GenerateStructuredOptions {
	model?: string;
	system?: string;
	temperature?: number;
}

export async function generateStructuredText<T>(
	prompt: string,
	options: GenerateStructuredOptions = {}
): Promise<T> {
	const { system, temperature } = options;
	const apiKey = getApiKey();

	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	const google = createGoogleGenerativeAI({ apiKey });
	const modelName = options.model || getModel();
	const model = google(modelName);

	const result = await generateText({
		model,
		prompt,
		system,
		temperature,
	});

	let text = result.text;
	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		text = jsonMatch[0];
	}

	try {
		return JSON.parse(text) as T;
	} catch (error) {
		console.error('Failed to parse AI response:', error);
		throw new Error('Invalid JSON response from AI');
	}
}

export interface GenerateMultimodalOptions {
	model?: string;
	system?: string;
	temperature?: number;
}

export async function generateWithMultimodal(
	prompt: string,
	images: { base64: string; mimeType?: string }[],
	options: GenerateMultimodalOptions = {}
): Promise<string> {
	const { system, temperature } = options;
	const apiKey = getApiKey();

	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	const google = createGoogleGenerativeAI({ apiKey });
	const modelName = options.model || 'gemini-2.0-flash';
	const model = google(modelName);

	const content: UserMessageContent = [
		{ type: 'text' as const, text: prompt },
		...images.map((img) => ({ type: 'image' as const, image: img.base64, mimeType: img.mimeType })),
	];

	const result = await generateText({
		model,
		messages: [{ role: 'user', content }],
		system,
		temperature,
	});

	return result.text;
}

export interface GeneratePDFOptions {
	model?: string;
	system?: string;
	temperature?: number;
}

export async function generateTextFromPDF(
	prompt: string,
	pdfBase64: string,
	options: GeneratePDFOptions = {}
): Promise<string> {
	const { system, temperature } = options;
	const apiKey = getApiKey();

	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	const google = createGoogleGenerativeAI({ apiKey });
	const modelName = options.model || getModel();
	const model = google(modelName);

	const result = await generateText({
		model,
		messages: [
			{
				role: 'user',
				content: [
					{ type: 'text' as const, text: prompt },
					{ type: 'image' as const, image: pdfBase64, mimeType: 'application/pdf' },
				] as UserMessageContent,
			},
		],
		system,
		temperature,
	});

	return result.text;
}

export async function generateStructuredTextFromPDF<T>(
	prompt: string,
	pdfBase64: string,
	options: GeneratePDFOptions = {}
): Promise<T> {
	const text = await generateTextFromPDF(prompt, pdfBase64, options);

	let cleanedText = text;
	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		cleanedText = jsonMatch[0];
	}

	try {
		return JSON.parse(cleanedText) as T;
	} catch (error) {
		console.error('Failed to parse AI response from PDF:', error);
		throw new Error('Invalid JSON response from AI');
	}
}

const questionSchema = z.object({
	questions: z.array(
		z.object({
			id: z.string().describe('Original number or ID of the question'),
			type: z.enum(['MCQ', 'Short Answer', 'True/False', 'Essay']),
			text: z.string().describe('The main body of the question'),
			options: z.array(z.string()).optional().describe('For MCQ: List of available answers'),
			subject: z.string().optional().describe('E.g., Math, Physics, History'),
		})
	),
});

export interface GenerateOCRImage {
	base64: string;
	mimeType?: string;
}

export interface GenerateOCROptions {
	system?: string;
	temperature?: number;
}

export async function generateWithOCR(
	prompt: string,
	images: GenerateOCRImage[],
	options: GenerateOCROptions = {}
): Promise<z.infer<typeof questionSchema>> {
	const { system, temperature } = options;

	const content: UserMessageContent = [
		{ type: 'text' as const, text: prompt },
		...images.map((img) => ({
			type: 'image' as const,
			image: img.base64,
			mimeType: img.mimeType,
		})),
	];

	const apiKey = getApiKey();
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	const google = createGoogleGenerativeAI({ apiKey });

	try {
		const model = google('gemini-1.5-flash');

		const result = await generateObject({
			model,
			messages: [{ role: 'user', content }],
			schema: questionSchema,
			system,
			temperature,
		});

		return result.object;
	} catch (googleError) {
		console.warn('Google Gemini 1.5 Flash OCR failed, trying fallback providers:', googleError);

		for (const getProvider of PROVIDERS) {
			try {
				const provider = getProvider();
				const model = provider.createModel();

				const result = await generateObject({
					model,
					messages: [{ role: 'user', content }],
					schema: questionSchema,
					system,
					temperature,
				});

				return result.object;
			} catch (providerError) {
				const providerName = getProvider().name;
				console.warn(`Provider ${providerName} OCR failed:`, providerError);
			}
		}

		throw new Error('All OCR providers failed');
	}
}

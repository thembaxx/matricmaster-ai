import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { AI_MODELS } from '../ai-config';
import { aiQuotaManager, type QuotaStatus } from './quota-manager';

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface UnifiedChatOptions {
	model?: 'google' | 'groq' | 'cohere' | 'openrouter' | 'mistral';
	system?: string;
	messages: ChatMessage[];
	temperature?: number;
	topP?: number;
}

interface UnifiedChatResult {
	text: string;
	provider: string;
	finishReason: string;
}

function getApiKey(provider: QuotaStatus['provider']): string | undefined {
	switch (provider) {
		case 'google':
			return process.env.GEMINI_API_KEY;
		case 'groq':
			return process.env.GROQ_API_KEY;
		case 'cohere':
			return process.env.COHERE_API_KEY;
		case 'openrouter':
			return process.env.OPENROUTER_API_KEY;
		case 'mistral':
			return process.env.MISTRAL_API_KEY;
		default:
			return undefined;
	}
}

function createModelForProvider(provider: QuotaStatus['provider']) {
	const apiKey = getApiKey(provider);
	if (!apiKey) {
		throw new Error(`API key not configured for provider: ${provider}`);
	}

	switch (provider) {
		case 'google': {
			const google = createGoogleGenerativeAI({ apiKey });
			return google(AI_MODELS.PRIMARY);
		}
		case 'groq': {
			const groq = createGroq({ apiKey });
			return groq('llama-3.3-70b-versatile');
		}
		case 'cohere': {
			const cohere = createCohere({ apiKey });
			return cohere('command-r-plus');
		}
		case 'openrouter': {
			const openrouter = createOpenAI({
				apiKey,
				baseURL: 'https://openrouter.ai/api/v1',
			});
			return openrouter('google/gemma-2-9b-1it:free');
		}
		case 'mistral': {
			const mistral = createMistral({ apiKey });
			return mistral('mistral-small-latest');
		}
		default:
			throw new Error(`Unknown provider: ${provider}`);
	}
}

export async function unifiedChat(options: UnifiedChatOptions): Promise<UnifiedChatResult> {
	const { system, messages, temperature, topP } = options;

	const result = await aiQuotaManager.withRetry(async (status) => {
		const model = createModelForProvider(status.provider);

		const response = await generateText({
			model,
			system,
			messages,
			temperature,
			topP,
		});

		return {
			text: response.text,
			provider: status.provider,
			finishReason: response.finishReason ?? 'unknown',
		};
	});

	return result;
}

export async function unifiedChatStream(options: UnifiedChatOptions) {
	const { system, messages, temperature, topP } = options;

	const status = await aiQuotaManager.getActiveProvider();
	const model = createModelForProvider(status.provider);

	const { text: _, ...streamResult } = await generateText({
		model,
		system,
		messages,
		temperature,
		topP,
	});

	return {
		...streamResult,
		provider: status.provider,
	};
}

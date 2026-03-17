import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { getCachedResponse, setCachedResponse } from '@/lib/cache/vercel-kv';
import { webllmEngine } from '@/lib/webllm/engine';

const STATIC_FAQS = new Set([
	'how to calculate aps score',
	'what is the minimum aps for university',
	'how do i apply to university',
	'what is nsc',
	'how to calculate admission point score',
	'university application',
	'aps calculation',
	'south african universities',
	'nsc certificate',
	'grade 12 requirements',
]);

function normalizeQuestion(question: string): string {
	return question.toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function routeAIQuestion(question: string): Promise<string> {
	const normalized = normalizeQuestion(question);

	const cached = await getCachedResponse(normalized);
	if (cached) {
		console.debug('Cache hit:', normalized);
		return cached;
	}

	const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

	if (isOnline) {
		try {
			const response = await generateAI({
				prompt: question,
				model: AI_MODELS.PRIMARY,
			});

			if (STATIC_FAQS.has(normalized)) {
				await setCachedResponse(normalized, response);
			}

			return response;
		} catch (error) {
			console.debug('Gemini failed, falling back to offline:', error);
		}
	}

	if (!webllmEngine.isReady()) {
		await webllmEngine.initialize();
	}

	return webllmEngine.generate(question);
}

export async function routeAIQuestionServer(question: string): Promise<string> {
	const normalized = normalizeQuestion(question);

	const cached = await getCachedResponse(normalized);
	if (cached) {
		console.debug('Cache hit (server):', normalized);
		return cached;
	}

	try {
		const response = await generateAI({
			prompt: question,
			model: AI_MODELS.PRIMARY,
		});

		if (STATIC_FAQS.has(normalized)) {
			await setCachedResponse(normalized, response);
		}

		return response;
	} catch (error) {
		console.debug('AI generation failed:', error);
		throw error;
	}
}

export function isStaticFAQ(question: string): boolean {
	const normalized = normalizeQuestion(question);
	return STATIC_FAQS.has(normalized);
}

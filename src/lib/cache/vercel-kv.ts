import { kv } from '@vercel/kv';

const CACHE_PREFIX = 'matricmaster:faq:';

export async function getCachedResponse(key: string): Promise<string | null> {
	try {
		const cacheKey = `${CACHE_PREFIX}${key.toLowerCase().trim()}`;
		const result = await kv.get<string>(cacheKey);
		return result;
	} catch (error) {
		console.debug('Cache read error:', error);
		return null;
	}
}

export async function setCachedResponse(key: string, value: string, ttl = 86400): Promise<void> {
	try {
		const cacheKey = `${CACHE_PREFIX}${key.toLowerCase().trim()}`;
		await kv.set(cacheKey, value, { ex: ttl });
	} catch (error) {
		console.debug('Cache write error:', error);
	}
}

export function normalizeQuestion(question: string): string {
	return question.toLowerCase().trim().replace(/\s+/g, ' ');
}

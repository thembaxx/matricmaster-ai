import { unstable_cache } from 'next/cache';

export async function hashString(str: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CacheOptions {
	tags?: string[];
	revalidate?: number;
}

export async function getCachedAIResponse<T>(
	prompt: string,
	fetcher: () => Promise<T>,
	options: CacheOptions = {}
): Promise<T> {
	const cacheKey = await hashString(prompt);
	const { tags = [], revalidate = 3600 } = options;

	const cachedFn = unstable_cache(
		async () => {
			return fetcher();
		},
		[`ai-cache-${cacheKey}`],
		{
			revalidate,
			tags: ['ai-responses', ...tags],
		}
	);

	return cachedFn();
}

export async function invalidateAICache(_tag: string): Promise<void> {
	console.debug('Cache invalidation called - tags will expire based on revalidate time');
}

export function generateCacheKey(prompt: string, context?: Record<string, string>): string {
	const parts = [prompt];
	if (context) {
		for (const [key, value] of Object.entries(context)) {
			parts.push(`${key}=${value}`);
		}
	}
	return parts.join('|');
}

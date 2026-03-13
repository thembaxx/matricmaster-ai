type RateLimitConfig = {
	windowMs: number;
	maxRequests: number;
};

const RATE_LIMITS: Record<string, RateLimitConfig> = {
	'api:ai-tutor': { windowMs: 60 * 1000, maxRequests: 10 },
	'api:ai-tutor:practice': { windowMs: 60 * 1000, maxRequests: 5 },
	'api:ai-tutor:flashcards': { windowMs: 60 * 1000, maxRequests: 5 },
	'api:snap-and-solve': { windowMs: 60 * 1000, maxRequests: 10 },
	'api:study-plan': { windowMs: 60 * 1000, maxRequests: 3 },
};

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries() {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetTime) {
			rateLimitStore.delete(key);
		}
	}
}

setInterval(cleanupExpiredEntries, 60 * 1000);

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetIn: number;
	limit: number;
}

export function checkRateLimit(key: string, category = 'default'): RateLimitResult {
	const now = Date.now();
	const configKey = `api:${category}`;
	const config = RATE_LIMITS[configKey] || RATE_LIMITS['api:ai-tutor'];
	const fullKey = `${key}:${configKey}`;

	let entry = rateLimitStore.get(fullKey);

	if (!entry || now > entry.resetTime) {
		entry = {
			count: 0,
			resetTime: now + config.windowMs,
		};
		rateLimitStore.set(fullKey, entry);
	}

	entry.count++;

	const remaining = Math.max(0, config.maxRequests - entry.count);
	const resetIn = Math.max(0, entry.resetTime - now);

	if (entry.count > config.maxRequests) {
		return {
			success: false,
			remaining: 0,
			resetIn: Math.ceil(resetIn / 1000),
			limit: config.maxRequests,
		};
	}

	return {
		success: true,
		remaining,
		resetIn: Math.ceil(resetIn / 1000),
		limit: config.maxRequests,
	};
}

export function getRateLimitHeaders(result: RateLimitResult) {
	return {
		'X-RateLimit-Limit': result.limit.toString(),
		'X-RateLimit-Remaining': result.remaining.toString(),
		'X-RateLimit-Reset': result.resetIn.toString(),
	};
}

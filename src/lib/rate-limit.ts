import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { rateLimits } from '@/lib/db/schema';

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
	'api:subscription-status': { windowMs: 60 * 1000, maxRequests: 5 },
};

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetIn: number;
	limit: number;
}

export async function checkRateLimit(key: string, category = 'default'): Promise<RateLimitResult> {
	const now = Date.now();
	const configKey = `api:${category}`;
	const config = RATE_LIMITS[configKey] || RATE_LIMITS['api:ai-tutor'];
	const fullKey = `${key}:${configKey}`;

	const db = await getDb();

	const existing = await db.query.rateLimits.findFirst({
		where: eq(rateLimits.key, fullKey),
	});

	const resetAt = new Date(now + config.windowMs);
	let count = 0;

	if (existing) {
		if (new Date() > existing.resetAt) {
			await db
				.update(rateLimits)
				.set({
					count: 1,
					resetAt,
				})
				.where(eq(rateLimits.id, existing.id));
			count = 1;
		} else {
			count = existing.count + 1;
			await db
				.update(rateLimits)
				.set({
					count,
				})
				.where(eq(rateLimits.id, existing.id));
		}
	} else {
		count = 1;
		await db.insert(rateLimits).values({
			key: fullKey,
			count: 1,
			resetAt,
		});
	}

	const remaining = Math.max(0, config.maxRequests - count);
	const resetInMs = existing ? Math.max(0, existing.resetAt.getTime() - now) : config.windowMs;
	const resetIn = Math.ceil(resetInMs / 1000);

	if (count > config.maxRequests) {
		return {
			success: false,
			remaining: 0,
			resetIn,
			limit: config.maxRequests,
		};
	}

	return {
		success: true,
		remaining,
		resetIn,
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

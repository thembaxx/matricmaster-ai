import { NextResponse } from 'next/server';

interface RateLimitStore {
	[identifier: string]: {
		count: number;
		resetTime: number;
	};
}

const store: RateLimitStore = {};

interface RateLimitConfig {
	windowMs: number;
	max: number;
	message?: string;
}

export function rateLimit(config: RateLimitConfig) {
	const { windowMs, max } = config;

	return (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
		const now = Date.now();
		const resetTime = now + windowMs;

		if (!store[identifier] || store[identifier].resetTime < now) {
			store[identifier] = { count: 1, resetTime };
			return { success: true, remaining: max - 1, resetTime };
		}

		store[identifier].count++;

		if (store[identifier].count > max) {
			return { success: false, remaining: 0, resetTime: store[identifier].resetTime };
		}

		return { success: true, remaining: max - store[identifier].count, resetTime };
	};
}

export function withRateLimit(
	handler: (request: Request) => Promise<NextResponse>,
	config: RateLimitConfig
) {
	const limiter = rateLimit(config);

	return async (request: Request): Promise<NextResponse> => {
		const ip =
			request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

		const identifier = `rate-limit:${ip}`;
		const result = limiter(identifier);

		if (!result.success) {
			return NextResponse.json(
				{
					error: 'Too many requests',
					message: config.message ?? 'Too many requests, please try again later.',
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': String(config.max),
						'X-RateLimit-Remaining': '0',
						'X-RateLimit-Reset': String(result.resetTime),
					},
				}
			);
		}

		const response = await handler(request);

		response.headers.set('X-RateLimit-Limit', String(config.max));
		response.headers.set('X-RateLimit-Remaining', String(result.remaining));
		response.headers.set('X-RateLimit-Reset', String(result.resetTime));

		return response;
	};
}

export function apiError(message: string, status = 500, details?: unknown): NextResponse {
	return NextResponse.json(
		{
			error: message,
			details: process.env.NODE_ENV === 'development' ? details : undefined,
		},
		{ status }
	);
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
	return NextResponse.json(data, { status });
}

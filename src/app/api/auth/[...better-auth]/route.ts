import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

const log = logger.createLogger('auth');

const authHandler = toNextJsHandler(await getAuth());

export async function GET(request: NextRequest) {
	log.info('Auth request started', {
		method: 'GET',
		path: request.nextUrl.pathname,
		searchParams: Object.fromEntries(request.nextUrl.searchParams),
	});

	try {
		const response = await authHandler.GET(request);
		return response;
	} catch (error) {
		log.error('Auth GET request failed', {
			path: request.nextUrl.pathname,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}

export async function POST(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	log.info('Auth request started', {
		method: 'POST',
		path: pathname,
	});

	try {
		const response = await authHandler.POST(request);

		if (!response.ok) {
			if (response.status === 401) {
				log.warn('Auth failed - invalid credentials or unauthorized', {
					path: pathname,
					status: response.status,
				});
			} else if (response.status === 429) {
				log.warn('Auth rate limited', {
					path: pathname,
					status: response.status,
				});
			} else {
				log.error('Auth request failed', {
					path: pathname,
					status: response.status,
				});
			}
		}

		return response;
	} catch (error) {
		log.error('Auth POST request failed', {
			path: pathname,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}

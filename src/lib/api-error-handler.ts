import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
	constructor(
		public message: string,
		public statusCode = 500,
		public details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export function handleApiError(error: unknown, context?: Record<string, unknown>) {
	console.error('[API ERROR]:', error);

	// Send error to Sentry with context
	try {
		if (error instanceof Error) {
			Sentry.logger.error('API Error occurred', {
				error_message: error.message,
				error_name: error.name,
				stack: error.stack,
				...context,
			});
		} else {
			Sentry.logger.error('API Error occurred', {
				error: String(error),
				...context,
			});
		}
	} catch {
		// Sentry is optional
	}

	if (error instanceof ApiError) {
		return NextResponse.json(
			{
				error: error.message,
				details: error.details,
				success: false,
			},
			{ status: error.statusCode }
		);
	}

	if (error instanceof ZodError) {
		return NextResponse.json(
			{
				error: 'validation failed',
				details: error.flatten().fieldErrors,
				success: false,
			},
			{ status: 400 }
		);
	}

	if (error instanceof Error && error.message === 'Unauthorized') {
		return NextResponse.json({ error: 'unauthorized', success: false }, { status: 401 });
	}

	if (error instanceof Error && error.message === 'Database not available') {
		return NextResponse.json({ error: 'service unavailable', success: false }, { status: 503 });
	}

	// Default fallback
	return NextResponse.json(
		{
			error: 'an unexpected error occurred',
			success: false,
		},
		{ status: 500 }
	);
}

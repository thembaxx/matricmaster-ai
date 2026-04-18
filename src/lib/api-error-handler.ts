import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const ErrorCodes = {
	AUTHENTICATION_REQUIRED: 'AUTH_REQUIRED',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	DATABASE_UNAVAILABLE: 'DB_UNAVAILABLE',
	VALIDATION_FAILED: 'VALIDATION_FAILED',
	NOT_FOUND: 'NOT_FOUND',
	RATE_LIMITED: 'RATE_LIMITED',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	EXTERNAL_SERVICE_ERROR: 'EXTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class ApiError extends Error {
	constructor(
		public message: string,
		public statusCode = 500,
		public code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
		public details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class AuthenticationError extends ApiError {
	constructor(message = 'Authentication required') {
		super(message, 401, ErrorCodes.AUTHENTICATION_REQUIRED);
		this.name = 'AuthenticationError';
	}
}

export class ForbiddenError extends ApiError {
	constructor(message = 'Access forbidden') {
		super(message, 403, ErrorCodes.FORBIDDEN);
		this.name = 'ForbiddenError';
	}
}

export class NotFoundError extends ApiError {
	constructor(resource: string) {
		super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
		this.name = 'NotFoundError';
	}
}

export class ValidationError extends ApiError {
	constructor(message: string, details?: unknown) {
		super(message, 400, ErrorCodes.VALIDATION_FAILED, details);
		this.name = 'ValidationError';
	}
}

export class DatabaseError extends ApiError {
	constructor(message = 'Database not available') {
		super(message, 503, ErrorCodes.DATABASE_UNAVAILABLE);
		this.name = 'DatabaseError';
	}
}

// Service-friendly error creators (can be used outside API routes)
export function unauthorized(message = 'Unauthorized') {
	return new AuthenticationError(message);
}

export function forbidden(message = 'Access forbidden') {
	return new ForbiddenError(message);
}

export function notFound(resource: string) {
	return new NotFoundError(resource);
}

export function databaseUnavailable(message = 'Database not available') {
	return new DatabaseError(message);
}

export function validationFailed(message: string, details?: unknown) {
	return new ValidationError(message, details);
}

export function internalError(message: string, details?: unknown) {
	return new ApiError(message, 500, ErrorCodes.INTERNAL_ERROR, details);
}

export function handleApiError(error: unknown, context?: Record<string, unknown>) {
	const errorResponse = (msg: string, status: number, code: ErrorCode, details?: unknown) => {
		return NextResponse.json({ error: msg, code, details, success: false }, { status });
	};

	if (error instanceof ApiError) {
		return errorResponse(error.message, error.statusCode, error.code, error.details);
	}

	if (error instanceof ZodError) {
		return errorResponse(
			'validation failed',
			400,
			ErrorCodes.VALIDATION_FAILED,
			error.flatten().fieldErrors
		);
	}

	const errorMessage = error instanceof Error ? error.message : String(error);

	if (error instanceof Error && errorMessage === 'Unauthorized') {
		return errorResponse('unauthorized', 401, ErrorCodes.AUTHENTICATION_REQUIRED);
	}

	if (error instanceof Error && errorMessage === 'Database not available') {
		return errorResponse('service unavailable', 503, ErrorCodes.DATABASE_UNAVAILABLE);
	}

	if (error instanceof Error && errorMessage === 'Forbidden') {
		return errorResponse('forbidden', 403, ErrorCodes.FORBIDDEN);
	}

	try {
		if (error instanceof Error) {
			Sentry.logger.error('API Error occurred', {
				error_message: errorMessage,
				error_name: error instanceof Error ? error.name : 'Unknown',
				stack: error instanceof Error ? error.stack : undefined,
				...context,
			});
		} else {
			Sentry.logger.error('API Error occurred', { error: String(error), ...context });
		}
	} catch {
		// Sentry is optional
	}

	// Default fallback
	return errorResponse('an unexpected error occurred', 500, ErrorCodes.INTERNAL_ERROR);
}

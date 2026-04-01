/**
 * Environment-aware logging utility for Lumni AI
 * - debug/info: Only logged in development
 * - warn/error: Always logged + sent to Sentry when available
 * - Includes timestamp and context for debugging
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
	[key: string]: unknown;
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function formatTimestamp(): string {
	return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
	return {
		timestamp: formatTimestamp(),
		level,
		message,
		...(context && { context }),
	};
}

function logToConsole(entry: LogEntry): void {
	const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;

	if (entry.context) {
		console.log(`${prefix} ${entry.message}`, entry.context);
	} else {
		console.log(`${prefix} ${entry.message}`);
	}
}

function logToSentry(level: LogLevel, message: string, context?: LogContext): void {
	try {
		if (level === 'error') {
			Sentry.logger.error(message, context);
		} else if (level === 'warn') {
			Sentry.logger.warn(message, context);
		}
	} catch {
		// Sentry is optional - fail silently if not initialized
	}
}

/**
 * Log debug messages - only in development
 */
export function debug(message: string, context?: LogContext): void {
	if (isDevelopment) {
		const entry = formatMessage('debug', message, context);
		logToConsole(entry);
		try {
			Sentry.logger.debug(message, context);
		} catch {
			// Sentry is optional
		}
	}
}

/**
 * Log info messages - only in development
 */
export function info(message: string, context?: LogContext): void {
	if (isDevelopment) {
		const entry = formatMessage('info', message, context);
		logToConsole(entry);
		try {
			Sentry.logger.info(message, context);
		} catch {
			// Sentry is optional
		}
	}
}

/**
 * Log warning messages - always logged + sent to Sentry
 */
export function warn(message: string, context?: LogContext): void {
	const entry = formatMessage('warn', message, context);
	console.warn(`[${entry.timestamp}] [WARN] ${entry.message}`, context ?? '');
	logToSentry('warn', message, context);
}

/**
 * Log error messages - always logged + sent to Sentry
 */
export function error(message: string, context?: LogContext): void {
	const entry = formatMessage('error', message, context);
	console.error(`[${entry.timestamp}] [ERROR] ${entry.message}`, context ?? '');
	logToSentry('error', message, context);
}

/**
 * Create a scoped logger with a fixed context
 */
export function createLogger(scope: string) {
	return {
		debug: (message: string, context?: LogContext) => debug(message, { scope, ...context }),
		info: (message: string, context?: LogContext) => info(message, { scope, ...context }),
		warn: (message: string, context?: LogContext) => warn(message, { scope, ...context }),
		error: (message: string, context?: LogContext) => error(message, { scope, ...context }),
	};
}

export const logger = {
	debug,
	info,
	warn,
	error,
	createLogger,
};

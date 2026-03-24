/**
 * Environment-aware logging utility for MatricMaster AI
 * - debug/info: Only logged in development
 * - warn/error: Always logged
 * - Includes timestamp and context for debugging
 */

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

/**
 * Log debug messages - only in development
 */
export function debug(message: string, context?: LogContext): void {
	if (isDevelopment) {
		const entry = formatMessage('debug', message, context);
		logToConsole(entry);
	}
}

/**
 * Log info messages - only in development
 */
export function info(message: string, context?: LogContext): void {
	if (isDevelopment) {
		const entry = formatMessage('info', message, context);
		logToConsole(entry);
	}
}

/**
 * Log warning messages - always logged
 */
export function warn(message: string, context?: LogContext): void {
	const entry = formatMessage('warn', message, context);
	console.warn(`[${entry.timestamp}] [WARN] ${entry.message}`, context ?? '');
}

/**
 * Log error messages - always logged
 */
export function error(message: string, context?: LogContext): void {
	const entry = formatMessage('error', message, context);
	console.error(`[${entry.timestamp}] [ERROR] ${entry.message}`, context ?? '');
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

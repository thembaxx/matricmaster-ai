import { checkAIProviderHealth } from './ai-config';
import { getEnv } from './env';

/**
 * Comprehensive logging system for PDF extraction monitoring
 */
export interface LogEntry {
	timestamp: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	service: string;
	message: string;
	metadata?: Record<string, unknown>;
}

/**
 * Enhanced logging with structured data
 */
export class MonitoringService {
	private static instance: MonitoringService;
	private logs: LogEntry[] = [];
	private maxLogs = 1000;

	static getInstance(): MonitoringService {
		if (!MonitoringService.instance) {
			MonitoringService.instance = new MonitoringService();
		}
		return MonitoringService.instance;
	}

	private constructor() {
		// Initialize with environment info
		this.log('info', 'monitoring', 'Monitoring service initialized', {
			nodeEnv: process.env.NODE_ENV,
			hasGeminiKey: !!getEnv('GEMINI_API_KEY'),
			hasUploadThing: !!process.env.UPLOADTHING_TOKEN,
		});
	}

	log(
		level: LogEntry['level'],
		service: string,
		message: string,
		metadata?: Record<string, unknown>
	) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			service,
			message,
			metadata,
		};

		// Store in memory (with limit)
		this.logs.push(entry);
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// Console output with formatting
		const formatted = this.formatLog(entry);
		switch (level) {
			case 'error':
				console.debug(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'debug':
				console.debug(formatted);
				break;
			default:
				console.log(formatted);
		}

		// In production, you might want to send to external service
		if (process.env.NODE_ENV === 'production') {
			this.sendToExternalService(entry);
		}
	}

	private formatLog(entry: LogEntry): string {
		const time = new Date(entry.timestamp).toLocaleTimeString();
		const meta = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
		return `[${time}] [${entry.level.toUpperCase()}] [${entry.service}] ${entry.message}${meta}`;
	}

	private async sendToExternalService(_entry: LogEntry) {
		// Placeholder for external logging service integration
		// e.g., Sentry, LogRocket, custom logging endpoint
		// try {
		//     // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
		// } catch (error) {
		//     console.debug('Failed to send log to external service:', error);
		// }
	}

	getLogs(level?: LogEntry['level'], service?: string, limit = 100): LogEntry[] {
		let filtered = this.logs;

		if (level) {
			filtered = filtered.filter((log) => log.level === level);
		}

		if (service) {
			filtered = filtered.filter((log) => log.service === service);
		}

		return filtered.slice(-limit).reverse();
	}

	getStats(): {
		totalLogs: number;
		errorCount: number;
		warningCount: number;
		successRate: number;
		lastError?: LogEntry;
	} {
		const totalLogs = this.logs.length;
		const errorCount = this.logs.filter((log) => log.level === 'error').length;
		const warningCount = this.logs.filter((log) => log.level === 'warn').length;

		// Calculate success rate based on extraction operations
		const extractionLogs = this.logs.filter((log) => log.service === 'pdf-extraction');
		const successCount = extractionLogs.filter(
			(log) => log.level === 'info' && log.message.includes('success')
		).length;
		const failureCount = extractionLogs.filter((log) => log.level === 'error').length;
		const successRate =
			extractionLogs.length > 0
				? Math.round((successCount / (successCount + failureCount)) * 100)
				: 100;

		const lastError = this.logs
			.filter((log) => log.level === 'error')
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

		return {
			totalLogs,
			errorCount,
			warningCount,
			successRate,
			lastError,
		};
	}

	clearLogs(): void {
		this.logs = [];
		this.log('info', 'monitoring', 'Logs cleared');
	}
}

/**
 * Health check for external services
 */
export class HealthCheckService {
	private static instance: HealthCheckService;
	private lastGeminiCheck: Date | null = null;
	private lastUploadThingCheck: Date | null = null;
	private geminiStatus: 'unknown' | 'healthy' | 'unhealthy' = 'unknown';
	private uploadThingStatus: 'unknown' | 'healthy' | 'unhealthy' = 'unknown';

	static getInstance(): HealthCheckService {
		if (!HealthCheckService.instance) {
			HealthCheckService.instance = new HealthCheckService();
		}
		return HealthCheckService.instance;
	}

	private constructor() {}

	async checkGemini(): Promise<{ status: string; latency?: number; error?: string }> {
		const monitoring = MonitoringService.getInstance();
		const startTime = Date.now();

		try {
			// Use the new AI health check function
			const healthResult = await checkAIProviderHealth();

			if (healthResult.status === 'healthy') {
				this.geminiStatus = 'healthy';
				this.lastGeminiCheck = new Date();
				monitoring.log('info', 'health-check', 'Gemini API healthy', {
					latency: healthResult.latency,
				});
				return { status: 'healthy', latency: healthResult.latency };
			}
			this.geminiStatus = 'unhealthy';
			this.lastGeminiCheck = new Date();
			monitoring.log('error', 'health-check', 'Gemini API unhealthy', {
				error: healthResult.error,
				latency: healthResult.latency,
			});
			return {
				status: 'unhealthy',
				latency: healthResult.latency,
				error: healthResult.error,
			};
		} catch (error) {
			const latency = Date.now() - startTime;
			this.geminiStatus = 'unhealthy';
			this.lastGeminiCheck = new Date();
			monitoring.log('error', 'health-check', 'Gemini API health check failed', {
				error: error instanceof Error ? error.message : 'Unknown error',
				latency,
			});

			return {
				status: 'unhealthy',
				latency,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async checkUploadThing(): Promise<{ status: string; error?: string }> {
		const monitoring = MonitoringService.getInstance();

		try {
			// Test UploadThing configuration
			const { uploadFiles } = await import('@/lib/uploadthing');

			if (!uploadFiles) {
				this.uploadThingStatus = 'unhealthy';
				this.lastUploadThingCheck = new Date();
				monitoring.log('error', 'health-check', 'UploadThing not configured');
				return { status: 'unhealthy', error: 'UploadThing not configured' };
			}

			this.uploadThingStatus = 'healthy';
			this.lastUploadThingCheck = new Date();
			monitoring.log('info', 'health-check', 'UploadThing healthy');

			return { status: 'healthy' };
		} catch (error) {
			this.uploadThingStatus = 'unhealthy';
			this.lastUploadThingCheck = new Date();
			monitoring.log('error', 'health-check', 'UploadThing unhealthy', {
				error: error instanceof Error ? error.message : 'Unknown error',
			});

			return {
				status: 'unhealthy',
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	getHealthStatus() {
		return {
			gemini: {
				status: this.geminiStatus,
				lastCheck: this.lastGeminiCheck,
			},
			uploadThing: {
				status: this.uploadThingStatus,
				lastCheck: this.lastUploadThingCheck,
			},
			overall:
				this.geminiStatus === 'healthy' && this.uploadThingStatus === 'healthy'
					? 'healthy'
					: 'degraded',
		};
	}
}

/**
 * Performance monitoring for PDF extraction
 */
export class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private extractionTimes: number[] = [];

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	recordExtractionTime(duration: number) {
		this.extractionTimes.push(duration);
		if (this.extractionTimes.length > 100) {
			this.extractionTimes.shift();
		}
	}

	getStats(): {
		averageTime: number;
		minTime: number;
		maxTime: number;
		totalExtractions: number;
	} {
		if (this.extractionTimes.length === 0) {
			return {
				averageTime: 0,
				minTime: 0,
				maxTime: 0,
				totalExtractions: 0,
			};
		}

		const sorted = [...this.extractionTimes].sort((a, b) => a - b);
		const sum = this.extractionTimes.reduce((acc, time) => acc + time, 0);

		return {
			averageTime: Math.round(sum / this.extractionTimes.length),
			minTime: sorted[0],
			maxTime: sorted[sorted.length - 1],
			totalExtractions: this.extractionTimes.length,
		};
	}
}

// Export singleton instances
export const monitoring = MonitoringService.getInstance();
export const healthCheck = HealthCheckService.getInstance();
export const performance = PerformanceMonitor.getInstance();

// Convenience functions for common logging
export const logInfo = (service: string, message: string, metadata?: Record<string, unknown>) =>
	monitoring.log('info', service, message, metadata);

export const logWarn = (service: string, message: string, metadata?: Record<string, unknown>) =>
	monitoring.log('warn', service, message, metadata);

export const logError = (service: string, message: string, metadata?: Record<string, unknown>) =>
	monitoring.log('error', service, message, metadata);

export const logDebug = (service: string, message: string, metadata?: Record<string, unknown>) =>
	monitoring.log('debug', service, message, metadata);

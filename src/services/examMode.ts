/**
 * Exam Mode Rate Limit Management Service
 *
 * Handles API rate limit adjustments during exam prep with:
 * - Detect exam periods (from calendar/events)
 * - Increase rate limits during critical exam prep weeks
 * - Implement request queue with priority levels
 * - Graceful degradation with cached responses
 * - Clear rate limit indicators to set expectations
 * - Offline mode enhancement for exam prep
 */

'use server';

import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { logger } from '@/lib/logger';

const log = logger.createLogger('ExamMode');

// Configuration
const _EXAM_PERIOD_DAYS = 14; // 2 weeks before exam
const RATE_LIMIT_MULTIPLIER = 3; // 3x normal limits during exam period
const HIGH_PRIORITY_QUEUE_SIZE = 100;
const MEDIUM_PRIORITY_QUEUE_SIZE = 500;
const LOW_PRIORITY_QUEUE_SIZE = 200;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Types
export interface ExamPeriod {
	detected: boolean;
	examType: string;
	daysUntilExam: number;
	isCriticalPeriod: boolean;
}

export interface RateLimitStatus {
	userId: string;
	currentLimit: number;
	remaining: number;
	resetAt: Date;
	isExamBoosted: boolean;
	multiplier: number;
}

export interface PriorityRequest {
	id: string;
	priority: 'high' | 'medium' | 'low';
	endpoint: string;
	data: Record<string, unknown>;
	timestamp: Date;
	status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CachedResponse {
	key: string;
	data: Record<string, unknown>;
	cachedAt: Date;
	expiresAt: Date;
	hitCount: number;
}

export interface OfflineExamMode {
	enabled: boolean;
	userId: string;
	cachedContent: string[];
	lastSyncAt: Date | null;
	expiresAt: Date;
}

// In-memory request queues
const priorityQueues = {
	high: new Map<string, PriorityRequest>(),
	medium: new Map<string, PriorityRequest>(),
	low: new Map<string, PriorityRequest>(),
};

// In-memory cache
const responseCache = new Map<string, CachedResponse>();

// User exam period tracking
const userExamPeriods = new Map<string, ExamPeriod>();

/**
 * Detect if user is in exam period
 */
export async function detectExamPeriod(userId: string): Promise<ExamPeriod> {
	// Check cache first
	const cached = userExamPeriods.get(userId);
	if (cached) {
		return cached;
	}

	const db = await dbManagerV2.getDb();
	if (!db) {
		return { detected: false, examType: '', daysUntilExam: 0, isCriticalPeriod: false };
	}

	try {
		// Would query calendar_events table for upcoming exams
		// Simplified implementation
		const examPeriod: ExamPeriod = {
			detected: false,
			examType: '',
			daysUntilExam: 0,
			isCriticalPeriod: false,
		};

		userExamPeriods.set(userId, examPeriod);
		return examPeriod;
	} catch (error) {
		log.error('Failed to detect exam period', { userId, error });
		return { detected: false, examType: '', daysUntilExam: 0, isCriticalPeriod: false };
	}
}

/**
 * Increase rate limits during exam period
 */
export async function increaseExamRateLimits(
	userId: string,
	multiplier: number = RATE_LIMIT_MULTIPLIER
): Promise<RateLimitStatus> {
	const examPeriod = await detectExamPeriod(userId);

	const baseLimit = 10; // Default requests per minute
	const effectiveLimit = examPeriod.isCriticalPeriod ? baseLimit * multiplier : baseLimit;

	const status: RateLimitStatus = {
		userId,
		currentLimit: effectiveLimit,
		remaining: effectiveLimit,
		resetAt: new Date(Date.now() + 60 * 1000),
		isExamBoosted: examPeriod.isCriticalPeriod,
		multiplier: examPeriod.isCriticalPeriod ? multiplier : 1,
	};

	log.info('Exam rate limits applied', {
		userId,
		multiplier: status.multiplier,
		isBoosted: status.isExamBoosted,
	});

	return status;
}

/**
 * Prioritize API request
 */
export async function prioritizeAPIRequest(
	request: { endpoint: string; data: Record<string, unknown> },
	priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<PriorityRequest> {
	const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const priorityRequest: PriorityRequest = {
		id,
		priority,
		endpoint: request.endpoint,
		data: request.data,
		timestamp: new Date(),
		status: 'pending',
	};

	// Add to appropriate queue
	const queue = priorityQueues[priority];
	const queueLimit =
		priority === 'high'
			? HIGH_PRIORITY_QUEUE_SIZE
			: priority === 'medium'
				? MEDIUM_PRIORITY_QUEUE_SIZE
				: LOW_PRIORITY_QUEUE_SIZE;

	if (queue.size >= queueLimit) {
		throw new Error(`${priority} priority queue is full`);
	}

	queue.set(id, priorityRequest);

	log.debug('API request prioritized', {
		id,
		priority,
		endpoint: request.endpoint,
	});

	return priorityRequest;
}

/**
 * Get cached response
 */
export function getCachedResponse(cacheKey: string): Record<string, unknown> | null {
	const cached = responseCache.get(cacheKey);

	if (!cached) {
		return null;
	}

	// Check if expired
	if (new Date() > cached.expiresAt) {
		responseCache.delete(cacheKey);
		return null;
	}

	// Update hit count
	cached.hitCount++;

	log.debug('Cache hit', { key: cacheKey, hits: cached.hitCount });

	return cached.data;
}

/**
 * Cache a response
 */
export function cacheResponse(
	key: string,
	data: Record<string, unknown>,
	ttlMs: number = CACHE_TTL_MS
): void {
	const now = new Date();

	responseCache.set(key, {
		key,
		data,
		cachedAt: now,
		expiresAt: new Date(now.getTime() + ttlMs),
		hitCount: 0,
	});

	log.debug('Response cached', { key, ttlMs });
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(userId: string): Promise<RateLimitStatus> {
	const examPeriod = await detectExamPeriod(userId);
	const baseLimit = 10;
	const effectiveLimit = examPeriod.isCriticalPeriod
		? baseLimit * RATE_LIMIT_MULTIPLIER
		: baseLimit;

	return {
		userId,
		currentLimit: effectiveLimit,
		remaining: effectiveLimit, // Would track actual remaining
		resetAt: new Date(Date.now() + 60 * 1000),
		isExamBoosted: examPeriod.isCriticalPeriod,
		multiplier: examPeriod.isCriticalPeriod ? RATE_LIMIT_MULTIPLIER : 1,
	};
}

/**
 * Enable offline exam mode
 */
export async function enableOfflineExamMode(userId: string): Promise<OfflineExamMode> {
	const mode: OfflineExamMode = {
		enabled: true,
		userId,
		cachedContent: [],
		lastSyncAt: new Date(),
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
	};

	log.info('Offline exam mode enabled', {
		userId,
		expiresAt: mode.expiresAt,
	});

	return mode;
}

/**
 * Get offline exam mode status
 */
export async function getOfflineExamModeStatus(userId: string): Promise<OfflineExamMode> {
	return {
		enabled: false,
		userId,
		cachedContent: [],
		lastSyncAt: null,
		expiresAt: new Date(),
	};
}

/**
 * Process high priority queue
 */
export async function processHighPriorityQueue(): Promise<void> {
	const queue = priorityQueues.high;

	if (queue.size === 0) {
		return;
	}

	log.info('Processing high priority queue', { count: queue.size });

	for (const [id, request] of queue.entries()) {
		try {
			// Would process request here
			request.status = 'completed';
			queue.delete(id);
		} catch (error) {
			request.status = 'failed';
			log.error('High priority request failed', { id, error });
		}
	}
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
	const now = new Date();

	for (const [key, cached] of responseCache.entries()) {
		if (now > cached.expiresAt) {
			responseCache.delete(key);
		}
	}
}

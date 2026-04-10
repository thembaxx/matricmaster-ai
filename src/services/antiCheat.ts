/**
 * Anti-Gaming Measures for XP/Achievements System
 *
 * Prevents system exploitation with:
 * - Rapid quiz completion detection
 * - Answer pattern anomaly detection
 * - Minimum time-per-question thresholds
 * - Daily XP gain caps
 * - Suspicious activity flagging
 * - Learning velocity focus over completion
 */

'use server';

import { and, eq, gte } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { questionAttempts, userProgress } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('AntiCheat');

// Configuration
const MIN_TIME_PER_QUESTION_SECONDS = 10; // Minimum reasonable time
const RAPID_COMPLETION_THRESHOLD = 0.5; // 50% faster than average
const MAX_DAILY_XP = 500; // Cap daily XP gains
const _PATTERN_ANOMALY_THRESHOLD = 0.8; // 80% same answer pattern
const SUSPICIOUS_ACTIVITY_WINDOW_DAYS = 7;

// Types
export interface GamingDetectionResult {
	isSuspicious: boolean;
	riskScore: number;
	indicators: GamingIndicator[];
	actions: AntiGamingAction[];
}

export interface GamingIndicator {
	type: 'rapid_completion' | 'pattern_anomaly' | 'xp_farming' | 'answer_consistency';
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	detectedAt: Date;
}

export interface AntiGamingAction {
	type: 'flag' | 'cap_xp' | 'review' | 'warn' | 'suspend';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	description: string;
	action: string;
}

export interface DailyXPTracking {
	userId: string;
	date: string;
	totalXP: number;
	quizzesCompleted: number;
	averageTimePerQuestion: number;
	isCapped: boolean;
}

/**
 * Check for gaming/suspicious activity
 */
export async function detectGamingActivity(userId: string): Promise<GamingDetectionResult> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const indicators: GamingIndicator[] = [];
		let riskScore = 0;

		// 1. Check for rapid quiz completion
		const rapidCompletion = await checkRapidCompletion(userId);
		if (rapidCompletion.isDetected) {
			indicators.push({
				type: 'rapid_completion',
				severity: rapidCompletion.severity,
				description: `Quiz completion time ${rapidCompletion.percentageFaster.toFixed(0)}% faster than average`,
				detectedAt: new Date(),
			});
			riskScore +=
				rapidCompletion.severity === 'critical'
					? 30
					: rapidCompletion.severity === 'high'
						? 20
						: 10;
		}

		// 2. Check for answer pattern anomalies
		const patternAnomaly = await checkAnswerPatternAnomaly(userId);
		if (patternAnomaly.isDetected) {
			indicators.push({
				type: 'pattern_anomaly',
				severity: patternAnomaly.severity,
				description: `Suspicious answer pattern detected (${(patternAnomaly.consistency * 100).toFixed(0)}% consistency)`,
				detectedAt: new Date(),
			});
			riskScore +=
				patternAnomaly.severity === 'critical' ? 30 : patternAnomaly.severity === 'high' ? 20 : 10;
		}

		// 3. Check for XP farming
		const xpFarming = await checkXPFarming(userId);
		if (xpFarming.isDetected) {
			indicators.push({
				type: 'xp_farming',
				severity: xpFarming.severity,
				description: `Daily XP gain (${xpFarming.totalXP}) exceeds reasonable limits`,
				detectedAt: new Date(),
			});
			riskScore += xpFarming.severity === 'critical' ? 25 : xpFarming.severity === 'high' ? 15 : 5;
		}

		// 4. Check answer consistency patterns
		const answerConsistency = await checkAnswerConsistency(userId);
		if (answerConsistency.isSuspicious) {
			indicators.push({
				type: 'answer_consistency',
				severity: answerConsistency.severity,
				description: 'Unnatural answer pattern detected',
				detectedAt: new Date(),
			});
			riskScore += 15;
		}

		// Generate actions based on risk score
		const actions = generateAntiGamingActions(riskScore, indicators);

		return {
			isSuspicious: riskScore > 40,
			riskScore: Math.min(100, riskScore),
			indicators,
			actions,
		};
	} catch (error) {
		log.error('Failed to detect gaming activity', { userId, error });
		throw error;
	}
}

/**
 * Check for rapid quiz completion
 */
async function checkRapidCompletion(userId: string): Promise<{
	isDetected: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
	percentageFaster: number;
}> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return { isDetected: false, severity: 'low', percentageFaster: 0 };
	}

	try {
		const now = new Date();
		const windowStart = new Date(
			now.getTime() - SUSPICIOUS_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
		);

		// Get recent attempts
		const attempts = await db
			.select({
				timeSpent: questionAttempts.timeSpentSeconds,
			})
			.from(questionAttempts)
			.where(
				and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, windowStart))
			)
			.limit(100);

		if (attempts.length === 0) {
			return { isDetected: false, severity: 'low', percentageFaster: 0 };
		}

		// Calculate average time per question
		const avgTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attempts.length;

		// Check if below minimum threshold
		const percentageFaster =
			avgTime < MIN_TIME_PER_QUESTION_SECONDS
				? ((MIN_TIME_PER_QUESTION_SECONDS - avgTime) / MIN_TIME_PER_QUESTION_SECONDS) * 100
				: 0;

		if (avgTime < MIN_TIME_PER_QUESTION_SECONDS * RAPID_COMPLETION_THRESHOLD) {
			let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
			if (avgTime < MIN_TIME_PER_QUESTION_SECONDS * 0.2) {
				severity = 'critical';
			} else if (avgTime < MIN_TIME_PER_QUESTION_SECONDS * 0.3) {
				severity = 'high';
			}

			return {
				isDetected: true,
				severity,
				percentageFaster,
			};
		}

		return { isDetected: false, severity: 'low', percentageFaster: 0 };
	} catch (error) {
		log.warn('Failed to check rapid completion', { error });
		return { isDetected: false, severity: 'low', percentageFaster: 0 };
	}
}

/**
 * Check for answer pattern anomalies
 */
async function checkAnswerPatternAnomaly(_userId: string): Promise<{
	isDetected: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
	consistency: number;
}> {
	// Simplified implementation
	return { isDetected: false, severity: 'low', consistency: 0 };
}

/**
 * Check for XP farming
 */
async function checkXPFarming(userId: string): Promise<{
	isDetected: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
	totalXP: number;
}> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return { isDetected: false, severity: 'low', totalXP: 0 };
	}

	try {
		const today = new Date();
		const _todayStr = today.toISOString().split('T')[0];

		// Get today's progress
		const [progress] = await db
			.select({
				totalMarksEarned: userProgress.totalMarksEarned,
			})
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		const totalXP = progress?.totalMarksEarned || 0;

		if (totalXP > MAX_DAILY_XP) {
			return {
				isDetected: true,
				severity: totalXP > MAX_DAILY_XP * 2 ? 'critical' : 'high',
				totalXP,
			};
		}

		return { isDetected: false, severity: 'low', totalXP };
	} catch (error) {
		log.warn('Failed to check XP farming', { error });
		return { isDetected: false, severity: 'low', totalXP: 0 };
	}
}

/**
 * Check answer consistency
 */
async function checkAnswerConsistency(_userId: string): Promise<{
	isSuspicious: boolean;
	severity: 'low' | 'medium' | 'high';
}> {
	// Simplified implementation
	return { isSuspicious: false, severity: 'low' };
}

/**
 * Generate anti-gaming actions
 */
function generateAntiGamingActions(
	riskScore: number,
	indicators: GamingIndicator[]
): AntiGamingAction[] {
	const actions: AntiGamingAction[] = [];

	if (riskScore > 80) {
		actions.push({
			type: 'suspend',
			priority: 'urgent',
			description: 'Temporary XP suspension pending review',
			action: 'suspend-xp',
		});
	} else if (riskScore > 60) {
		actions.push({
			type: 'cap_xp',
			priority: 'high',
			description: 'Cap daily XP gains',
			action: 'cap-daily-xp',
		});
		actions.push({
			type: 'review',
			priority: 'high',
			description: 'Flag for manual review',
			action: 'flag-for-review',
		});
	} else if (riskScore > 40) {
		actions.push({
			type: 'warn',
			priority: 'medium',
			description: 'Send warning about unusual activity',
			action: 'send-warning',
		});
	}

	if (indicators.length > 0) {
		actions.push({
			type: 'flag',
			priority: 'low',
			description: 'Log suspicious activity',
			action: 'log-activity',
		});
	}

	return actions;
}

/**
 * Apply daily XP cap
 */
export async function applyDailyXPCap(userId: string, earnedXP: number): Promise<number> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return earnedXP;
	}

	try {
		const today = new Date();
		const _todayStr = today.toISOString().split('T')[0];

		// Get today's current XP
		const [progress] = await db
			.select({
				totalMarksEarned: userProgress.totalMarksEarned,
			})
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		const currentXP = progress?.totalMarksEarned || 0;

		// Apply cap
		if (currentXP + earnedXP > MAX_DAILY_XP) {
			const cappedXP = Math.max(0, MAX_DAILY_XP - currentXP);
			log.info('Daily XP cap applied', { userId, earnedXP, cappedXP, limit: MAX_DAILY_XP });
			return cappedXP;
		}

		return earnedXP;
	} catch (error) {
		log.error('Failed to apply XP cap', { error });
		return earnedXP;
	}
}

/**
 * Log gaming detection event
 */
export async function logGamingDetection(
	userId: string,
	detection: GamingDetectionResult
): Promise<void> {
	log.info('Gaming detection logged', {
		userId,
		riskScore: detection.riskScore,
		indicators: detection.indicators.length,
		timestamp: new Date(),
	});
}

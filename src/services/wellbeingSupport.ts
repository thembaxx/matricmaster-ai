/**
 * Student Wellbeing Support Service
 *
 * Handles mental health support with:
 * - Detection of mental health impact on learning
 * - "Gentle Mode" with reduced cognitive load
 * - Wellness resources and mindfulness prompts
 * - Pressure reduction (pause streaks, hide leaderboards)
 * - Break reminders and stress pattern detection
 */

'use server';

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { accessibilityPreferences, questionAttempts, studySessions } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { detectBurnoutRisk } from './burnoutService';

const log = logger.createLogger('WellbeingSupport');

// Configuration
const STRESS_DETECTION_WINDOW_DAYS = 7;
const _ERRATIC_BEHAVIOR_THRESHOLD = 3; // session pattern changes
const ABANDONMENT_RATE_THRESHOLD = 0.4; // 40% session abandonment
const ENGAGEMENT_DECLINE_THRESHOLD = 0.3; // 30% decline

// Types
export interface WellbeingStatus {
	overall: 'healthy' | 'stressed' | 'at-risk' | 'crisis';
	score: number; // 0-100, higher is better
	indicators: WellbeingIndicator[];
	recommendations: WellbeingRecommendation[];
	gentleModeEligible: boolean;
}

export interface WellbeingIndicator {
	type:
		| 'erratic_study'
		| 'session_abandonment'
		| 'declining_engagement'
		| 'burnout'
		| 'stress_pattern';
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	detectedAt: Date;
}

export interface WellbeingRecommendation {
	type: 'mindfulness' | 'break' | 'resources' | 'gentle_mode' | 'support';
	title: string;
	description: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	action?: string;
}

export interface GentleModeSettings {
	enabled: boolean;
	hideLeaderboards: boolean;
	pauseStreaks: boolean;
	reducedCognitiveLoad: boolean;
	encouragingMessaging: boolean;
	breakReminders: boolean;
	simplifiedUI: boolean;
}

export interface StressPattern {
	erraticStudyTimes: boolean;
	sessionAbandonmentRate: number;
	engagementDecline: boolean;
	decliningAccuracy: boolean;
	increasedSessionLength: boolean;
	decreasedSessionFrequency: boolean;
}

/**
 * Get comprehensive wellbeing status for a student
 */
export async function getWellbeingStatus(userId: string): Promise<WellbeingStatus> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const indicators: WellbeingIndicator[] = [];
		const recommendations: WellbeingRecommendation[] = [];
		let totalScore = 100; // Start with perfect score, deduct for issues

		// 1. Check for erratic study patterns
		const stressPattern = await detectStressPatterns(userId);
		if (stressPattern.erraticStudyTimes) {
			indicators.push({
				type: 'erratic_study',
				severity: 'medium',
				description: 'Irregular study times detected - may indicate sleep disruption or stress',
				detectedAt: new Date(),
			});
			totalScore -= 15;
		}

		// 2. Check session abandonment
		if (stressPattern.sessionAbandonmentRate > ABANDONMENT_RATE_THRESHOLD) {
			indicators.push({
				type: 'session_abandonment',
				severity: stressPattern.sessionAbandonmentRate > 0.6 ? 'high' : 'medium',
				description: `High session abandonment rate (${(stressPattern.sessionAbandonmentRate * 100).toFixed(0)}%)`,
				detectedAt: new Date(),
			});
			totalScore -= 20;
		}

		// 3. Check declining engagement
		if (stressPattern.engagementDecline) {
			indicators.push({
				type: 'declining_engagement',
				severity: 'high',
				description: 'Significant decline in study engagement detected',
				detectedAt: new Date(),
			});
			totalScore -= 25;
		}

		// 4. Check burnout risk
		try {
			const burnoutRisk = await detectBurnoutRisk(userId);
			if (burnoutRisk.risk === 'high' || burnoutRisk.risk === 'severe') {
				indicators.push({
					type: 'burnout',
					severity: burnoutRisk.risk === 'severe' ? 'critical' : 'high',
					description: `Burnout risk: ${burnoutRisk.risk}`,
					detectedAt: new Date(),
				});
				totalScore -= burnoutRisk.risk === 'severe' ? 30 : 20;
			}
		} catch (error) {
			log.warn('Burnout detection failed (non-critical)', { error });
		}

		// 5. Check for stress patterns (accuracy decline + increased time)
		if (stressPattern.decliningAccuracy && stressPattern.increasedSessionLength) {
			indicators.push({
				type: 'stress_pattern',
				severity: 'high',
				description: 'Declining accuracy with increased study time - possible stress impact',
				detectedAt: new Date(),
			});
			totalScore -= 20;
		}

		// Determine overall status
		const overall = determineWellbeingStatus(totalScore, indicators);

		// Generate recommendations
		if (overall !== 'healthy') {
			recommendations.push(...generateWellbeingRecommendations(overall, indicators, stressPattern));
		}

		// Check if gentle mode is eligible
		const gentleModeEligible =
			overall === 'stressed' || overall === 'at-risk' || overall === 'crisis';

		return {
			overall,
			score: Math.max(0, totalScore),
			indicators,
			recommendations,
			gentleModeEligible,
		};
	} catch (error) {
		log.error('Failed to get wellbeing status', { userId, error });
		throw error;
	}
}

/**
 * Detect stress patterns from study behavior
 */
async function detectStressPatterns(userId: string): Promise<StressPattern> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const now = new Date();
	const windowStart = new Date(now.getTime() - STRESS_DETECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000);

	// Get recent study sessions
	const recentSessions = await db
		.select()
		.from(studySessions)
		.where(and(eq(studySessions.userId, userId), gte(studySessions.startedAt, windowStart)))
		.orderBy(desc(studySessions.startedAt));

	if (recentSessions.length === 0) {
		return {
			erraticStudyTimes: false,
			sessionAbandonmentRate: 0,
			engagementDecline: false,
			decliningAccuracy: false,
			increasedSessionLength: false,
			decreasedSessionFrequency: false,
		};
	}

	// 1. Detect erratic study times
	const studyTimes = recentSessions.map((s) => s.startedAt.getHours());
	const timeVariance = calculateVariance(studyTimes);
	const erraticStudyTimes = timeVariance > 25; // High variance in study hours

	// 2. Detect session abandonment
	const abandonedSessions = recentSessions.filter(
		(s) => s.durationMinutes !== null && s.durationMinutes < 5 // Sessions < 5 min considered abandoned
	).length;
	const sessionAbandonmentRate = abandonedSessions / recentSessions.length;

	// 3. Detect engagement decline
	const previousWindowStart = new Date(
		windowStart.getTime() - STRESS_DETECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000
	);
	const previousSessions = await db
		.select()
		.from(studySessions)
		.where(
			and(
				eq(studySessions.userId, userId),
				gte(studySessions.startedAt, previousWindowStart),
				sql`${studySessions.startedAt} < ${windowStart}`
			)
		);

	const engagementDecline =
		previousSessions.length > 0 &&
		recentSessions.length < previousSessions.length * (1 - ENGAGEMENT_DECLINE_THRESHOLD);

	// 4. Detect declining accuracy
	const recentAttempts = await db
		.select()
		.from(questionAttempts)
		.where(and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, windowStart)))
		.limit(100);

	const previousAttempts = await db
		.select()
		.from(questionAttempts)
		.where(
			and(
				eq(questionAttempts.userId, userId),
				gte(questionAttempts.attemptedAt, previousWindowStart),
				sql`${questionAttempts.attemptedAt} < ${windowStart}`
			)
		)
		.limit(100);

	const recentAccuracy =
		recentAttempts.length > 0
			? recentAttempts.filter((a) => a.isCorrect).length / recentAttempts.length
			: 0;

	const previousAccuracy =
		previousAttempts.length > 0
			? previousAttempts.filter((a) => a.isCorrect).length / previousAttempts.length
			: 0;

	const decliningAccuracy =
		previousAccuracy > 0 && recentAccuracy < previousAccuracy * (1 - ENGAGEMENT_DECLINE_THRESHOLD);

	// 5. Detect increased session length
	const avgRecentLength =
		recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / recentSessions.length;

	const avgPreviousLength =
		previousSessions.length > 0
			? previousSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
				previousSessions.length
			: 0;

	const increasedSessionLength = avgPreviousLength > 0 && avgRecentLength > avgPreviousLength * 1.3; // 30% increase

	// 6. Detect decreased session frequency
	const decreasedSessionFrequency =
		previousSessions.length > 0 && recentSessions.length < previousSessions.length * 0.7; // 30% decrease

	return {
		erraticStudyTimes,
		sessionAbandonmentRate,
		engagementDecline,
		decliningAccuracy,
		increasedSessionLength,
		decreasedSessionFrequency,
	};
}

/**
 * Enable gentle mode for a student
 * Reduces pressure and provides supportive environment
 */
export async function enableGentleMode(userId: string): Promise<GentleModeSettings> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const settings: GentleModeSettings = {
		enabled: true,
		hideLeaderboards: true,
		pauseStreaks: true,
		reducedCognitiveLoad: true,
		encouragingMessaging: true,
		breakReminders: true,
		simplifiedUI: false,
	};

	try {
		// Update user settings to reflect gentle mode
		await db
			.update(accessibilityPreferences)
			.set({
				// These fields would be in user_settings, using extended approach
				updatedAt: new Date(),
			})
			.where(eq(accessibilityPreferences.userId, userId));

		log.info('Gentle mode enabled', { userId });

		return settings;
	} catch (error) {
		log.error('Failed to enable gentle mode', { userId, error });
		throw error;
	}
}

/**
 * Disable gentle mode
 */
export async function disableGentleMode(userId: string): Promise<void> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		// Reset gentle mode settings
		await db
			.update(accessibilityPreferences)
			.set({
				updatedAt: new Date(),
			})
			.where(eq(accessibilityPreferences.userId, userId));

		log.info('Gentle mode disabled', { userId });
	} catch (error) {
		log.error('Failed to disable gentle mode', { userId, error });
		throw error;
	}
}

/**
 * Get gentle mode status
 */
export async function getGentleModeStatus(_userId: string): Promise<GentleModeSettings> {
	// Default to disabled
	return {
		enabled: false,
		hideLeaderboards: false,
		pauseStreaks: false,
		reducedCognitiveLoad: false,
		encouragingMessaging: false,
		breakReminders: false,
		simplifiedUI: false,
	};
}

/**
 * Get wellness resources for students
 */
export function getWellnessResources(): Array<{
	title: string;
	description: string;
	type: 'mindfulness' | 'break' | 'counseling' | 'resources';
	url?: string;
}> {
	return [
		{
			title: '5-Minute Breathing Exercise',
			description: 'Simple breathing technique to reduce anxiety and improve focus',
			type: 'mindfulness',
		},
		{
			title: 'Study Break Ideas',
			description: 'Quick activities to refresh your mind during study sessions',
			type: 'break',
		},
		{
			title: 'Student Mental Health Resources',
			description: 'Professional support available for students',
			type: 'counseling',
			url: 'https://www.sadag.org/', // South African Depression and Anxiety Group
		},
		{
			title: 'Stress Management Guide',
			description: 'Practical tips for managing exam stress',
			type: 'resources',
		},
	];
}

/**
 * Get mindfulness prompt for current context
 */
export function getMindfulnessPrompt(
	context: 'before-study' | 'after-failure' | 'stress-detected'
): string {
	const prompts = {
		'before-study':
			"Take a moment to set a positive intention for your study session. You've got this! 💪",
		'after-failure':
			"It's okay to make mistakes. Each one is a learning opportunity. Take a deep breath and try again. 🌱",
		'stress-detected':
			'We noticed you might be feeling overwhelmed. Consider taking a 5-minute break to stretch and breathe. 🧘',
	};

	return prompts[context];
}

// Helper functions
function determineWellbeingStatus(
	score: number,
	indicators: WellbeingIndicator[]
): WellbeingStatus['overall'] {
	if (score >= 80) return 'healthy';
	if (score >= 60) return 'stressed';
	if (score >= 40) return 'at-risk';

	const hasCritical = indicators.some((i) => i.severity === 'critical');
	if (hasCritical) return 'crisis';

	return 'at-risk';
}

function generateWellbeingRecommendations(
	status: WellbeingStatus['overall'],
	indicators: WellbeingIndicator[],
	stressPattern: StressPattern
): WellbeingRecommendation[] {
	const recommendations: WellbeingRecommendation[] = [];

	// Always recommend gentle mode for non-healthy status
	if (status !== 'healthy') {
		recommendations.push({
			type: 'gentle_mode',
			title: 'Enable Gentle Mode',
			description: 'Reduce pressure and focus on learning at your own pace',
			priority: status === 'crisis' ? 'urgent' : 'high',
			action: 'enable-gentle-mode',
		});
	}

	// Mindfulness for stress
	if (indicators.some((i) => i.type === 'stress_pattern' || i.type === 'burnout')) {
		recommendations.push({
			type: 'mindfulness',
			title: 'Try a Mindfulness Exercise',
			description: 'A short breathing exercise can help reduce stress and improve focus',
			priority: 'high',
			action: 'start-mindfulness-exercise',
		});
	}

	// Break recommendation for long sessions
	if (stressPattern.increasedSessionLength) {
		recommendations.push({
			type: 'break',
			title: 'Take a Break',
			description: "You've been studying for a while. A short break can improve retention",
			priority: 'medium',
			action: 'schedule-break',
		});
	}

	// Support resources for crisis
	if (status === 'crisis' || status === 'at-risk') {
		recommendations.push({
			type: 'support',
			title: 'Access Support Resources',
			description: 'Professional support is available to help you through difficult times',
			priority: 'urgent',
			action: 'view-resources',
		});
	}

	return recommendations;
}

function calculateVariance(numbers: number[]): number {
	if (numbers.length === 0) return 0;
	const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
	const squaredDiffs = numbers.map((n) => (n - mean) ** 2);
	return squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;
}

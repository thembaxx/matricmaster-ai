/**
 * Healthy Gaming and Anxiety Prevention Service
 *
 * Handles gamification balance with:
 * - Detect stress patterns from gaming behavior
 * - "Zen Mode" that disables competitive features
 * - Optional leaderboard hiding
 * - Learning > scores reminders
 * - Progress-focused messaging
 * - Achievement pacing to prevent overwhelm
 */

'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { studySessions, userAchievements } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('HealthyGaming');

// Configuration
const COMPULSIVE_CHECK_THRESHOLD = 10; // Leaderboard checks per hour
const ACHIEVEMENT_OVERWHELM_THRESHOLD = 5; // Achievements per hour
const STRESS_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours continuous

// Types
export interface GamingHealthStatus {
	overallScore: number; // 0-100, higher is healthier
	stressIndicators: StressIndicator[];
	recommendations: GamingRecommendation[];
	zenModeEligible: boolean;
}

export interface StressIndicator {
	type: 'compulsive_checking' | 'achievement_hunting' | 'excessive_play' | 'rank_obsession';
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	detectedAt: Date;
}

export interface GamingRecommendation {
	type: 'zen_mode' | 'break' | 'perspective' | 'hide_leaderboard' | 'pace_achievements';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	title: string;
	description: string;
	action?: string;
}

export interface ZenModeSettings {
	enabled: boolean;
	hideLeaderboards: boolean;
	hideAchievements: boolean;
	disableStreaks: boolean;
	progressOnly: boolean;
	calmingMessages: boolean;
	breakReminders: boolean;
	breakFrequencyMinutes: number;
}

export interface LeaderboardCheck {
	userId: string;
	checkedAt: Date;
	frequency: number; // checks per hour
}

/**
 * Get gaming health status for a student
 */
export async function getGamingHealthStatus(userId: string): Promise<GamingHealthStatus> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const stressIndicators: StressIndicator[] = [];
		const recommendations: GamingRecommendation[] = [];
		let overallScore = 100; // Start perfect, deduct for issues

		// 1. Check for compulsive leaderboard checking
		const leaderboardCheckFrequency = await getLeaderboardCheckFrequency(userId);
		if (leaderboardCheckFrequency > COMPULSIVE_CHECK_THRESHOLD) {
			stressIndicators.push({
				type: 'compulsive_checking',
				severity: leaderboardCheckFrequency > COMPULSIVE_CHECK_THRESHOLD * 2 ? 'high' : 'medium',
				description: `Frequent leaderboard checking (${leaderboardCheckFrequency}/hour)`,
				detectedAt: new Date(),
			});
			overallScore -= 20;
		}

		// 2. Check for achievement hunting behavior
		const achievementRate = await getAchievementRate(userId);
		if (achievementRate > ACHIEVEMENT_OVERWHELM_THRESHOLD) {
			stressIndicators.push({
				type: 'achievement_hunting',
				severity: 'medium',
				description: 'Rapid achievement completion - focus on learning, not badges',
				detectedAt: new Date(),
			});
			overallScore -= 15;
		}

		// 3. Check for excessive play sessions
		const currentSessionLength = await getCurrentSessionLength(userId);
		if (currentSessionLength > STRESS_SESSION_DURATION_MS) {
			stressIndicators.push({
				type: 'excessive_play',
				severity: currentSessionLength > STRESS_SESSION_DURATION_MS * 1.5 ? 'high' : 'medium',
				description: `Long study session (${(currentSessionLength / 60000).toFixed(0)} minutes)`,
				detectedAt: new Date(),
			});
			overallScore -= 20;
		}

		// Generate recommendations
		if (stressIndicators.length > 0) {
			recommendations.push(...generateGamingRecommendations(stressIndicators));
		}

		const zenModeEligible = overallScore < 70;

		return {
			overallScore: Math.max(0, overallScore),
			stressIndicators,
			recommendations,
			zenModeEligible,
		};
	} catch (error) {
		log.error('Failed to get gaming health status', { userId, error });
		throw error;
	}
}

/**
 * Enable Zen Mode
 */
export async function enableZenMode(userId: string): Promise<ZenModeSettings> {
	const settings: ZenModeSettings = {
		enabled: true,
		hideLeaderboards: true,
		hideAchievements: false,
		disableStreaks: false,
		progressOnly: true,
		calmingMessages: true,
		breakReminders: true,
		breakFrequencyMinutes: 30,
	};

	log.info('Zen mode enabled', { userId });

	return settings;
}

/**
 * Disable Zen Mode
 */
export async function disableZenMode(userId: string): Promise<void> {
	log.info('Zen mode disabled', { userId });
}

/**
 * Get Zen Mode status
 */
export async function getZenModeStatus(_userId: string): Promise<ZenModeSettings> {
	return {
		enabled: false,
		hideLeaderboards: false,
		hideAchievements: false,
		disableStreaks: false,
		progressOnly: false,
		calmingMessages: false,
		breakReminders: false,
		breakFrequencyMinutes: 30,
	};
}

/**
 * Get progress-focused message
 */
export function getProgressFocusedMessage(): string {
	const messages = [
		'Remember: learning is more important than scores! 📚',
		'Focus on understanding, not just completing quizzes! 🎯',
		'Your progress matters more than your rank! 💪',
		'Every question you attempt is a step forward! ⭐',
		'Quality of learning > quantity of XP! 🌱',
	];

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get calming message for stress moments
 */
export function getCalmingMessage(): string {
	const messages = [
		"Take a deep breath. You're doing great! 🧘",
		"It's okay to take breaks. Your brain needs rest too! 💙",
		"Don't stress about rankings. Focus on your own journey! 🌟",
		'Learning is a marathon, not a sprint! 🏃',
	];

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Check if leaderboard should be hidden for user
 */
export async function shouldHideLeaderboard(userId: string): Promise<boolean> {
	const status = await getGamingHealthStatus(userId);
	return status.stressIndicators.some((i) => i.type === 'compulsive_checking');
}

/**
 * Get leaderboard check frequency
 */
async function getLeaderboardCheckFrequency(_userId: string): Promise<number> {
	// Would query leaderboard_check_logs table
	// Simplified implementation
	return 0;
}

/**
 * Get achievement rate
 */
async function getAchievementRate(userId: string): Promise<number> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return 0;
	}

	try {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		const [count] = await db
			.select({ count: userAchievements.id })
			.from(userAchievements)
			.where(and(eq(userAchievements.userId, userId), gte(userAchievements.earnedAt, oneHourAgo)));

		return count?.count || 0;
	} catch (error) {
		log.warn('Failed to get achievement rate', { error });
		return 0;
	}
}

/**
 * Get current session length
 */
async function getCurrentSessionLength(userId: string): Promise<number> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return 0;
	}

	try {
		const [lastSession] = await db
			.select({ startedAt: studySessions.startedAt })
			.from(studySessions)
			.where(eq(studySessions.userId, userId))
			.orderBy(desc(studySessions.startedAt))
			.limit(1);

		if (!lastSession?.startedAt) {
			return 0;
		}

		return Date.now() - lastSession.startedAt.getTime();
	} catch (error) {
		log.warn('Failed to get current session length', { error });
		return 0;
	}
}

/**
 * Generate gaming recommendations
 */
function generateGamingRecommendations(
	stressIndicators: StressIndicator[]
): GamingRecommendation[] {
	const recommendations: GamingRecommendation[] = [];

	const hasCompulsiveChecking = stressIndicators.some((i) => i.type === 'compulsive_checking');
	const hasExcessivePlay = stressIndicators.some((i) => i.type === 'excessive_play');
	const hasAchievementHunting = stressIndicators.some((i) => i.type === 'achievement_hunting');

	if (hasCompulsiveChecking) {
		recommendations.push({
			type: 'hide_leaderboard',
			priority: 'high',
			title: 'Hide Leaderboard Temporarily',
			description: 'Focus on your own progress instead of comparing to others',
			action: 'hide-leaderboard',
		});
	}

	if (hasExcessivePlay) {
		recommendations.push({
			type: 'break',
			priority: 'urgent',
			title: 'Take a Break',
			description: "You've been studying for a while. Time to refresh your mind!",
			action: 'take-break',
		});
	}

	if (hasAchievementHunting) {
		recommendations.push({
			type: 'pace_achievements',
			priority: 'medium',
			title: 'Focus on Learning',
			description: 'Achievements will come naturally. Focus on understanding the material!',
			action: 'focus-on-learning',
		});
	}

	// Always recommend zen mode if there are stress indicators
	if (stressIndicators.length > 0) {
		recommendations.push({
			type: 'zen_mode',
			priority: 'high',
			title: 'Enable Zen Mode',
			description: 'Switch to a calmer, progress-focused experience',
			action: 'enable-zen-mode',
		});
	}

	return recommendations;
}

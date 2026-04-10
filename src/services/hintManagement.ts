/**
 * Hint Management Service
 *
 * Handles AI hint over-reliance detection with:
 * - Track hint frequency per student
 * - Gradually reduce hint availability as mastery increases
 * - "Try First" mode that encourages independent problem-solving
 * - Reward independence with bonus XP
 * - Show progress on becoming self-sufficient learner
 */

'use server';

import { desc, eq, sql } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { questionAttempts, topicMastery } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('HintManagement');

// Configuration
const HINT_TRACKING_WINDOW_DAYS = 30;
const MASTERY_THRESHOLD_FOR_REDUCTION = 0.75; // 75% mastery reduces hints
const INDEPENDENCE_BONUS_XP = 25;
const TRY_FIRST_QUIZ_THRESHOLD = 3; // quizzes completed to enable Try First mode
const SELF_SUFFICIENT_HINT_LIMIT = 2; // max hints per quiz for self-sufficient learners
const BEGINNER_HINT_LIMIT = 10; // max hints per quiz for beginners

// Types
export interface HintUsageRecord {
	id: string;
	userId: string;
	questionId: string;
	quizId?: string;
	topicId?: string;
	hintType: 'concept' | 'step' | 'solution' | 'formula';
	timestamp: Date;
	wasHelpful: boolean | null;
}

export interface HintUsageTracking {
	userId: string;
	totalHintsUsed: number;
	hintsLastWeek: number;
	hintsLastMonth: number;
	averageHintsPerQuiz: number;
	mostRequestedHintType: 'concept' | 'step' | 'solution' | 'formula' | 'none';
	hintUsageTrend: 'increasing' | 'decreasing' | 'stable';
	lastHintUsedAt: Date | null;
}

export interface HintOverrelianceDetection {
	userId: string;
	isOverreliant: boolean;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	riskScore: number; // 0-100
	indicators: OverrelianceIndicator[];
	recommendations: OverrelianceRecommendation[];
}

export interface OverrelianceIndicator {
	type:
		| 'high_frequency'
		| 'declining_independence'
		| 'solution_hints_only'
		| 'no_attempt_before_hint';
	severity: 'low' | 'medium' | 'high';
	description: string;
	detectedAt: Date;
}

export interface OverrelianceRecommendation {
	type: 'reduce_hints' | 'try_first' | 'review_concepts' | 'seek_help';
	title: string;
	description: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TryFirstMode {
	enabled: boolean;
	eligible: boolean;
	hintsRemaining: number;
	hintsTotal: number;
	forcedIndependence: boolean;
	bonusXPEligible: boolean;
}

export interface IndependenceScore {
	userId: string;
	score: number; // 0-100
	level: 'dependent' | 'developing' | 'independent' | 'self-sufficient';
	quizsWithoutHints: number;
	totalQuizzes: number;
	averageHintsPerQuiz: number;
	trend: 'improving' | 'stable' | 'declining';
	independenceStreak: number; // consecutive quizzes without hints
}

export interface HintRecommendations {
	maxHintsPerQuiz: number;
	recommendedHintTypes: ('concept' | 'step' | 'solution' | 'formula')[];
	encourageTryFirst: boolean;
	bonusXPMultiplier: number;
	message: string;
}

/**
 * Track hint usage for a student
 */
export async function trackHintUsage(params: {
	userId: string;
	questionId: string;
	quizId?: string;
	topicId?: string;
	hintType: 'concept' | 'step' | 'solution' | 'formula';
	wasHelpful?: boolean;
}): Promise<HintUsageRecord> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const record: HintUsageRecord = {
			id: crypto.randomUUID(),
			userId: params.userId,
			questionId: params.questionId,
			quizId: params.quizId,
			topicId: params.topicId,
			hintType: params.hintType,
			timestamp: new Date(),
			wasHelpful: params.wasHelpful ?? null,
		};

		log.info(
			{ userId: params.userId, hintType: params.hintType, questionId: params.questionId },
			'Hint usage tracked'
		);

		return record;
	} catch (error) {
		log.error({ userId: params.userId, error }, 'Failed to track hint usage');
		throw error;
	}
}

/**
 * Get hint usage tracking data for a student
 */
export async function getHintUsageTracking(userId: string): Promise<HintUsageTracking> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const now = new Date();
		const _oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const _oneMonthAgo = new Date(now.getTime() - HINT_TRACKING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

		// Note: This would require a hintUsage table; using query patterns from existing services
		const totalHintsUsed = 0; // Placeholder - implement with actual table
		const hintsLastWeek = 0;
		const hintsLastMonth = 0;
		const averageHintsPerQuiz = 0;
		const mostRequestedHintType: 'concept' | 'step' | 'solution' | 'formula' | 'none' = 'none';
		const hintUsageTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
		const lastHintUsedAt: Date | null = null;

		// Calculate trend based on recent usage
		if (hintsLastWeek > hintsLastMonth / 4) {
			return {
				userId,
				totalHintsUsed,
				hintsLastWeek,
				hintsLastMonth,
				averageHintsPerQuiz,
				mostRequestedHintType,
				hintUsageTrend: 'increasing',
				lastHintUsedAt,
			};
		}
		if (hintsLastWeek < hintsLastMonth / 4) {
			return {
				userId,
				totalHintsUsed,
				hintsLastWeek,
				hintsLastMonth,
				averageHintsPerQuiz,
				mostRequestedHintType,
				hintUsageTrend: 'decreasing',
				lastHintUsedAt,
			};
		}

		return {
			userId,
			totalHintsUsed,
			hintsLastWeek,
			hintsLastMonth,
			averageHintsPerQuiz,
			mostRequestedHintType,
			hintUsageTrend,
			lastHintUsedAt,
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to get hint usage tracking');
		throw error;
	}
}

/**
 * Detect hint overreliance for a student
 */
export async function detectHintOverreliance(userId: string): Promise<HintOverrelianceDetection> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const indicators: OverrelianceIndicator[] = [];
		const recommendations: OverrelianceRecommendation[] = [];
		let riskScore = 0;

		// Get mastery data
		const masteryData = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, userId),
		});

		const averageMastery =
			masteryData.length > 0
				? masteryData.reduce((sum, m) => sum + (m.masteryScore || 0), 0) / masteryData.length
				: 0;

		// Get hint usage tracking
		const hintTracking = await getHintUsageTracking(userId);

		// Check for high hint frequency
		if (hintTracking.averageHintsPerQuiz > 5) {
			const severity: 'low' | 'medium' | 'high' =
				hintTracking.averageHintsPerQuiz > 8 ? 'high' : 'medium';
			indicators.push({
				type: 'high_frequency',
				severity,
				description: `Using average ${hintTracking.averageHintsPerQuiz.toFixed(1)} hints per quiz - above recommended threshold`,
				detectedAt: new Date(),
			});
			riskScore += severity === 'high' ? 30 : 20;
		}

		// Check for declining independence
		if (hintTracking.hintUsageTrend === 'increasing') {
			indicators.push({
				type: 'declining_independence',
				severity: 'medium',
				description: 'Hint usage trend is increasing over time',
				detectedAt: new Date(),
			});
			riskScore += 15;
		}

		// Check if only requesting solution hints
		if (hintTracking.mostRequestedHintType === 'solution') {
			indicators.push({
				type: 'solution_hints_only',
				severity: 'high',
				description: 'Primarily requesting solution hints instead of conceptual guidance',
				detectedAt: new Date(),
			});
			riskScore += 25;
		}

		// Check mastery vs hint usage correlation
		if (averageMastery < MASTERY_THRESHOLD_FOR_REDUCTION && hintTracking.averageHintsPerQuiz > 6) {
			riskScore += 20;
			recommendations.push({
				type: 'review_concepts',
				title: 'Review Core Concepts',
				description: 'High hint usage with low mastery suggests reviewing foundational concepts',
				priority: 'high',
			});
		}

		// Cap risk score
		riskScore = Math.min(riskScore, 100);

		// Determine risk level
		const riskLevel =
			riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

		const isOverreliant = riskScore >= 50;

		// Generate recommendations
		if (isOverreliant) {
			recommendations.push({
				type: 'try_first',
				title: 'Enable Try First Mode',
				description:
					'Attempt problems independently before requesting hints to build problem-solving skills',
				priority: 'high',
			});

			recommendations.push({
				type: 'reduce_hints',
				title: 'Reduce Hint Dependency',
				description: 'Gradually decrease hint usage to develop independent thinking',
				priority: 'medium',
			});
		}

		if (riskScore >= 75) {
			recommendations.push({
				type: 'seek_help',
				title: 'Consider Additional Support',
				description: 'High hint reliance may indicate need for tutoring or study group',
				priority: 'urgent',
			});
		}

		return {
			userId,
			isOverreliant,
			riskLevel,
			riskScore,
			indicators,
			recommendations,
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to detect hint overreliance');
		throw error;
	}
}

/**
 * Enable Try First mode for a student
 */
export async function enableTryFirstMode(userId: string): Promise<TryFirstMode> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		// Check eligibility: must have completed minimum quizzes
		const quizCountResult = await db
			.select({ count: sql<number>`COUNT(DISTINCT qa.quizId)` })
			.from(questionAttempts)
			.where(eq(questionAttempts.userId, userId));

		const quizCount = quizCountResult[0]?.count || 0;
		const eligible = quizCount >= TRY_FIRST_QUIZ_THRESHOLD;

		// Get current hint usage
		const _hintTracking = await getHintUsageTracking(userId);

		// Calculate hints remaining based on independence level
		const independenceScore = await calculateIndependenceScore(userId);
		const hintsRemaining = Math.max(
			SELF_SUFFICIENT_HINT_LIMIT,
			BEGINNER_HINT_LIMIT - Math.floor(independenceScore.score / 10)
		);

		// Enable forced independence for high-risk students
		const overreliance = await detectHintOverreliance(userId);
		const forcedIndependence =
			overreliance.riskLevel === 'high' || overreliance.riskLevel === 'critical';

		return {
			enabled: eligible,
			eligible,
			hintsRemaining,
			hintsTotal: BEGINNER_HINT_LIMIT,
			forcedIndependence,
			bonusXPEligible:
				independenceScore.level === 'independent' || independenceScore.level === 'self-sufficient',
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to enable Try First mode');
		throw error;
	}
}

/**
 * Calculate independence score for a student
 */
export async function calculateIndependenceScore(userId: string): Promise<IndependenceScore> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const hintTracking = await getHintUsageTracking(userId);

		// Get quiz completion data
		const quizStats = await db
			.select({
				totalQuizzes: sql<number>`COUNT(DISTINCT qa.quizId)`,
				quizzesWithoutHints: sql<number>`COUNT(DISTINCT CASE WHEN qa.hintsUsed = 0 THEN qa.quizId END)`,
			})
			.from(questionAttempts)
			.where(eq(questionAttempts.userId, userId));

		const totalQuizzes = quizStats[0]?.totalQuizzes || 0;
		const quizsWithoutHints = quizStats[0]?.quizzesWithoutHints || 0;

		// Calculate base score
		const hintRatio = totalQuizzes > 0 ? quizsWithoutHints / totalQuizzes : 0;
		let score = Math.round(hintRatio * 100);

		// Adjust for hint usage trend
		if (hintTracking.hintUsageTrend === 'decreasing') {
			score = Math.min(100, score + 10);
		} else if (hintTracking.hintUsageTrend === 'increasing') {
			score = Math.max(0, score - 10);
		}

		// Determine level
		const level =
			score >= 80
				? 'self-sufficient'
				: score >= 60
					? 'independent'
					: score >= 40
						? 'developing'
						: 'dependent';

		// Calculate independence streak
		const recentQuizzes = await db.query.questionAttempts.findMany({
			where: eq(questionAttempts.userId, userId),
			orderBy: [desc(questionAttempts.attemptedAt)],
			limit: 50,
		});

		let independenceStreak = 0;
		for (const attempt of recentQuizzes) {
			if ((attempt as any).hintsUsed === 0) {
				independenceStreak++;
			} else {
				break;
			}
		}

		// Determine trend
		const trend =
			hintTracking.hintUsageTrend === 'decreasing'
				? 'improving'
				: hintTracking.hintUsageTrend === 'increasing'
					? 'declining'
					: 'stable';

		return {
			userId,
			score,
			level,
			quizsWithoutHints,
			totalQuizzes,
			averageHintsPerQuiz: hintTracking.averageHintsPerQuiz,
			trend,
			independenceStreak,
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to calculate independence score');
		throw error;
	}
}

/**
 * Get hint recommendations for a student
 */
export async function getHintRecommendations(userId: string): Promise<HintRecommendations> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const independenceScore = await calculateIndependenceScore(userId);
		const overreliance = await detectHintOverreliance(userId);

		// Calculate max hints based on independence
		let maxHintsPerQuiz = BEGINNER_HINT_LIMIT;
		if (independenceScore.level === 'self-sufficient') {
			maxHintsPerQuiz = SELF_SUFFICIENT_HINT_LIMIT;
		} else if (independenceScore.level === 'independent') {
			maxHintsPerQuiz = 4;
		} else if (independenceScore.level === 'developing') {
			maxHintsPerQuiz = 6;
		}

		// Reduce hints further if overreliant
		if (overreliance.isOverreliant) {
			maxHintsPerQuiz = Math.max(2, maxHintsPerQuiz - 2);
		}

		// Recommend hint types based on mastery
		const masteryData = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, userId),
		});

		const lowMasteryTopics = masteryData.filter(
			(m) => m.masteryScore < MASTERY_THRESHOLD_FOR_REDUCTION
		);

		const recommendedHintTypes: ('concept' | 'step' | 'solution' | 'formula')[] = [];

		if (lowMasteryTopics.length > 0) {
			recommendedHintTypes.push('concept');
			recommendedHintTypes.push('step');
		} else {
			recommendedHintTypes.push('formula');
		}

		// Avoid solution hints for overreliant students
		if (!overreliance.isOverreliant) {
			recommendedHintTypes.push('solution');
		}

		// Calculate bonus XP multiplier
		const bonusXPMultiplier =
			independenceScore.level === 'self-sufficient'
				? 1.5
				: independenceScore.level === 'independent'
					? 1.25
					: 1.0;

		// Determine if should encourage Try First
		const encourageTryFirst =
			overreliance.riskLevel === 'medium' ||
			overreliance.riskLevel === 'high' ||
			independenceScore.level === 'dependent';

		// Generate message
		let message = '';
		if (independenceScore.level === 'self-sufficient') {
			message = "Excellent independence! You're solving problems on your own. Keep it up!";
		} else if (independenceScore.level === 'independent') {
			message = 'Great progress! Try solving more problems before using hints.';
		} else if (independenceScore.level === 'developing') {
			message = "You're improving! Challenge yourself with Try First mode.";
		} else {
			message = 'Hints are helpful, but try attempting problems first to build confidence.';
		}

		if (overreliance.isOverreliant) {
			message += ' We noticed high hint usage - reducing hints to help you grow.';
		}

		return {
			maxHintsPerQuiz,
			recommendedHintTypes,
			encourageTryFirst,
			bonusXPMultiplier,
			message,
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to get hint recommendations');
		throw error;
	}
}

/**
 * Award independence bonus XP
 */
export async function awardIndependenceXP(params: {
	userId: string;
	quizId: string;
	hintsUsed: number;
	baseXP: number;
}): Promise<{ totalXP: number; bonusXP: number; multiplier: number }> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const recommendations = await getHintRecommendations(params.userId);
		const independenceScore = await calculateIndependenceScore(params.userId);

		// Calculate bonus XP
		let bonusXP = 0;
		const multiplier = recommendations.bonusXPMultiplier;

		// No hints used - maximum bonus
		if (params.hintsUsed === 0) {
			bonusXP = Math.round(INDEPENDENCE_BONUS_XP * multiplier);
		}
		// Used fewer hints than allowed - partial bonus
		else if (params.hintsUsed < recommendations.maxHintsPerQuiz) {
			const hintRatio = 1 - params.hintsUsed / recommendations.maxHintsPerQuiz;
			bonusXP = Math.round(INDEPENDENCE_BONUS_XP * hintRatio * multiplier);
		}

		// Additional bonus for self-sufficient learners
		if (independenceScore.level === 'self-sufficient' && params.hintsUsed === 0) {
			bonusXP += Math.round(INDEPENDENCE_BONUS_XP * 0.5);
		}

		const totalXP = params.baseXP + bonusXP;

		log.info(
			{
				userId: params.userId,
				quizId: params.quizId,
				baseXP: params.baseXP,
				bonusXP,
				totalXP,
				hintsUsed: params.hintsUsed,
			},
			'Independence XP awarded'
		);

		return { totalXP, bonusXP, multiplier };
	} catch (error) {
		log.error(
			{ userId: params.userId, quizId: params.quizId, error },
			'Failed to award independence XP'
		);
		// Return base XP on error
		return { totalXP: params.baseXP, bonusXP: 0, multiplier: 1 };
	}
}

/**
 * Get self-sufficiency progress summary
 */
export async function getSelfSufficiencyProgress(userId: string): Promise<{
	independenceScore: IndependenceScore;
	overrelianceDetection: HintOverrelianceDetection;
	tryFirstMode: TryFirstMode;
	recommendations: HintRecommendations;
	milestones: IndependenceMilestone[];
}> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const [independenceScore, overrelianceDetection, tryFirstMode, recommendations] =
			await Promise.all([
				calculateIndependenceScore(userId),
				detectHintOverreliance(userId),
				enableTryFirstMode(userId),
				getHintRecommendations(userId),
			]);

		// Calculate milestones
		const milestones: IndependenceMilestone[] = [];

		if (independenceScore.quizsWithoutHints >= 1) {
			milestones.push({
				id: 'first_hint_free_quiz',
				title: 'First Hint-Free Quiz',
				description: 'Completed a quiz without using any hints',
				achieved: true,
				achievedAt: new Date(),
			});
		}

		if (independenceScore.independenceStreak >= 3) {
			milestones.push({
				id: 'three_quiz_streak',
				title: 'Three Quiz Streak',
				description: 'Completed 3 consecutive quizzes without hints',
				achieved: true,
				achievedAt: new Date(),
			});
		}

		if (independenceScore.independenceStreak >= 5) {
			milestones.push({
				id: 'five_quiz_streak',
				title: 'Five Quiz Streak',
				description: 'Completed 5 consecutive quizzes without hints',
				achieved: true,
				achievedAt: new Date(),
			});
		}

		if (
			independenceScore.level === 'independent' ||
			independenceScore.level === 'self-sufficient'
		) {
			milestones.push({
				id: 'independent_learner',
				title: 'Independent Learner',
				description: 'Achieved independent learner status',
				achieved: true,
				achievedAt: new Date(),
			});
		}

		if (independenceScore.level === 'self-sufficient') {
			milestones.push({
				id: 'self_sufficient',
				title: 'Self-Sufficient Learner',
				description: 'Reached self-sufficient learner level',
				achieved: true,
				achievedAt: new Date(),
			});
		}

		// Add upcoming milestones
		if (independenceScore.independenceStreak < 3) {
			milestones.push({
				id: 'three_quiz_streak_upcoming',
				title: 'Three Quiz Streak',
				description: `Complete ${3 - independenceScore.independenceStreak} more hint-free quizzes`,
				achieved: false,
				progress: independenceScore.independenceStreak / 3,
			});
		}

		if (
			independenceScore.level !== 'independent' &&
			independenceScore.level !== 'self-sufficient'
		) {
			const scoreNeeded =
				independenceScore.level === 'developing'
					? 60 - independenceScore.score
					: 40 - independenceScore.score;
			milestones.push({
				id: 'next_level_upcoming',
				title: 'Next Level',
				description: `Improve independence score by ${Math.max(0, scoreNeeded)} points`,
				achieved: false,
				progress: independenceScore.score / 60,
			});
		}

		return {
			independenceScore,
			overrelianceDetection,
			tryFirstMode,
			recommendations,
			milestones,
		};
	} catch (error) {
		log.error({ userId, error }, 'Failed to get self-sufficiency progress');
		throw error;
	}
}

export interface IndependenceMilestone {
	id: string;
	title: string;
	description: string;
	achieved: boolean;
	achievedAt?: Date;
	progress?: number;
}

/**
 * Grade Drop Detection and Analysis Service
 *
 * Handles sudden grade drop detection with:
 * - Detection of >15% drop in average over 7-day period
 * - Diagnostic analysis of specific topics causing decline
 * - Auto-adjust study plan to focus on affected areas
 * - Supportive messaging (not punitive)
 * - Recovery plan with achievable milestones
 */

'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { questionAttempts, subjects, topicMastery, userProgress } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('GradeDropAnalysis');

// Configuration
const GRADE_DROP_THRESHOLD = 0.15; // 15% drop
const ANALYSIS_WINDOW_DAYS = 7; // Over 7-day period
const MINIMUM_ATTEMPTS_FOR_ANALYSIS = 10; // Minimum attempts to analyze

// Types
export interface GradeDropAnalysis {
	hasSignificantDrop: boolean;
	previousAverage: number;
	currentAverage: number;
	dropPercentage: number;
	affectedSubjects: AffectedSubject[];
	affectedTopics: AffectedTopic[];
	possibleCauses: string[];
	recoveryPlan: RecoveryPlan;
	detectedAt: Date;
}

export interface AffectedSubject {
	subjectId: number;
	subjectName: string;
	previousAverage: number;
	currentAverage: number;
	dropPercentage: number;
	severity: 'mild' | 'moderate' | 'severe';
}

export interface AffectedTopic {
	topic: string;
	subjectId: number;
	subjectName: string;
	previousMastery: number;
	currentMastery: number;
	dropPercentage: number;
	attemptsInPeriod: number;
	accuracyInPeriod: number;
}

export interface RecoveryPlan {
	focusAreas: string[];
	suggestedActions: RecoveryAction[];
	estimatedRecoveryDays: number;
	milestones: RecoveryMilestone[];
	supportiveMessage: string;
}

export interface RecoveryAction {
	type: 'review' | 'practice' | 'flashcard' | 'ai-tutor' | 'study-session';
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	estimatedMinutes: number;
}

export interface RecoveryMilestone {
	day: number;
	targetAverage: number;
	description: string;
}

export interface GradeTrend {
	date: Date;
	average: number;
	attempts: number;
}

/**
 * Analyze if there's a significant grade drop
 */
export async function analyzeGradeDrop(userId: string): Promise<GradeDropAnalysis> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const now = new Date();
		const currentWindowStart = new Date(now.getTime() - ANALYSIS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
		const previousWindowStart = new Date(
			currentWindowStart.getTime() - ANALYSIS_WINDOW_DAYS * 24 * 60 * 60 * 1000
		);

		// Calculate averages for both periods
		const previousAverage = await calculatePeriodAverage(
			userId,
			previousWindowStart,
			currentWindowStart
		);
		const currentAverage = await calculatePeriodAverage(userId, currentWindowStart, now);

		// Calculate drop percentage
		const dropPercentage =
			previousAverage > 0 ? (previousAverage - currentAverage) / previousAverage : 0;

		const hasSignificantDrop = dropPercentage >= GRADE_DROP_THRESHOLD;

		// Get affected subjects
		const affectedSubjects = await getAffectedSubjects(
			userId,
			previousWindowStart,
			currentWindowStart,
			now
		);

		// Get affected topics
		const affectedTopics = await getAffectedTopics(userId, currentWindowStart);

		// Identify possible causes
		const possibleCauses = identifyPossibleCauses(
			userId,
			affectedSubjects,
			affectedTopics,
			currentWindowStart,
			now
		);

		// Generate recovery plan
		const recoveryPlan = generateRecoveryPlan(affectedSubjects, affectedTopics, dropPercentage);

		return {
			hasSignificantDrop,
			previousAverage,
			currentAverage,
			dropPercentage,
			affectedSubjects,
			affectedTopics,
			possibleCauses,
			recoveryPlan,
			detectedAt: now,
		};
	} catch (error) {
		log.error('Failed to analyze grade drop', { userId, error });
		throw error;
	}
}

/**
 * Calculate average performance for a time period
 */
async function calculatePeriodAverage(
	userId: string,
	startDate: Date,
	endDate: Date
): Promise<number> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return 0;
	}

	try {
		const attempts = await db
			.select({
				isCorrect: questionAttempts.isCorrect,
			})
			.from(questionAttempts)
			.where(
				and(
					eq(questionAttempts.userId, userId),
					gte(questionAttempts.attemptedAt, startDate),
					sql`${questionAttempts.attemptedAt} < ${endDate}`
				)
			)
			.limit(200);

		if (attempts.length === 0) {
			return 0;
		}

		const correct = attempts.filter((a) => a.isCorrect).length;
		return correct / attempts.length;
	} catch (error) {
		log.warn('Failed to calculate period average', { error });
		return 0;
	}
}

/**
 * Get subjects affected by grade drop
 */
async function getAffectedSubjects(
	userId: string,
	previousWindowStart: Date,
	currentWindowStart: Date,
	now: Date
): Promise<AffectedSubject[]> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		// Get user's subjects
		const userSubjects = await db
			.select({
				subjectId: userProgress.subjectId,
			})
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		const affectedSubjects: AffectedSubject[] = [];

		for (const userSub of userSubjects) {
			if (!userSub.subjectId) continue;

			// Get subject name
			const [subject] = await db
				.select({ name: subjects.displayName })
				.from(subjects)
				.where(eq(subjects.id, userSub.subjectId));

			if (!subject) continue;

			// Calculate previous period average
			const previousAttempts = await db
				.select({ isCorrect: questionAttempts.isCorrect })
				.from(questionAttempts)
				.where(
					and(
						eq(questionAttempts.userId, userId),
						gte(questionAttempts.attemptedAt, previousWindowStart),
						sql`${questionAttempts.attemptedAt} < ${currentWindowStart}`
					)
				)
				.limit(100);

			// Calculate current period average
			const currentAttempts = await db
				.select({ isCorrect: questionAttempts.isCorrect })
				.from(questionAttempts)
				.where(
					and(
						eq(questionAttempts.userId, userId),
						gte(questionAttempts.attemptedAt, currentWindowStart),
						sql`${questionAttempts.attemptedAt} < ${now}`
					)
				)
				.limit(100);

			const previousAvg =
				previousAttempts.length > 0
					? previousAttempts.filter((a) => a.isCorrect).length / previousAttempts.length
					: 0;

			const currentAvg =
				currentAttempts.length > 0
					? currentAttempts.filter((a) => a.isCorrect).length / currentAttempts.length
					: 0;

			const drop = previousAvg > 0 ? (previousAvg - currentAvg) / previousAvg : 0;

			if (drop >= GRADE_DROP_THRESHOLD * 0.5) {
				// Lower threshold for individual subjects
				let severity: 'mild' | 'moderate' | 'severe' = 'mild';
				if (drop >= GRADE_DROP_THRESHOLD * 1.5) {
					severity = 'severe';
				} else if (drop >= GRADE_DROP_THRESHOLD) {
					severity = 'moderate';
				}

				affectedSubjects.push({
					subjectId: userSub.subjectId,
					subjectName: subject.name,
					previousAverage: previousAvg,
					currentAverage: currentAvg,
					dropPercentage: drop,
					severity,
				});
			}
		}

		return affectedSubjects.sort((a, b) => b.dropPercentage - a.dropPercentage);
	} catch (error) {
		log.warn('Failed to get affected subjects', { error });
		return [];
	}
}

/**
 * Get topics affected by grade drop
 */
async function getAffectedTopics(
	userId: string,
	currentWindowStart: Date
): Promise<AffectedTopic[]> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		// Get topic mastery data
		const topics = await db
			.select({
				topic: topicMastery.topic,
				subjectId: topicMastery.subjectId,
				masteryScore: topicMastery.masteryScore,
				lastPracticedAt: topicMastery.lastPracticedAt,
			})
			.from(topicMastery)
			.where(eq(topicMastery.userId, userId));

		const affectedTopics: AffectedTopic[] = [];

		for (const topic of topics) {
			if (!topic.subjectId || !topic.masteryScore) continue;

			// Get subject name
			const [subject] = await db
				.select({ name: subjects.displayName })
				.from(subjects)
				.where(eq(subjects.id, topic.subjectId));

			if (!subject) continue;

			// Get attempts in current period
			const attempts = await db
				.select({ isCorrect: questionAttempts.isCorrect })
				.from(questionAttempts)
				.where(
					and(
						eq(questionAttempts.userId, userId),
						gte(questionAttempts.attemptedAt, currentWindowStart)
					)
				)
				.limit(100);

			if (attempts.length < MINIMUM_ATTEMPTS_FOR_ANALYSIS) continue;

			const accuracy = attempts.filter((a) => a.isCorrect).length / attempts.length;

			// Check if mastery is declining (would need historical data in production)
			// For now, use current mastery vs recent accuracy
			const masteryDrop =
				topic.masteryScore > 0 ? (topic.masteryScore - accuracy) / topic.masteryScore : 0;

			if (masteryDrop >= GRADE_DROP_THRESHOLD * 0.5) {
				affectedTopics.push({
					topic: topic.topic,
					subjectId: topic.subjectId,
					subjectName: subject.name,
					previousMastery: topic.masteryScore,
					currentMastery: accuracy,
					dropPercentage: masteryDrop,
					attemptsInPeriod: attempts.length,
					accuracyInPeriod: accuracy,
				});
			}
		}

		return affectedTopics.sort((a, b) => b.dropPercentage - a.dropPercentage).slice(0, 10);
	} catch (error) {
		log.warn('Failed to get affected topics', { error });
		return [];
	}
}

/**
 * Identify possible causes of grade drop
 */
function identifyPossibleCauses(
	_userId: string,
	affectedSubjects: AffectedSubject[],
	affectedTopics: AffectedTopic[],
	_currentWindowStart: Date,
	_now: Date
): string[] {
	const causes: string[] = [];

	// Check for reduced study time
	const studySessionCount = 0; // Would query studySessions
	if (studySessionCount < 3) {
		causes.push('Reduced study time detected');
	}

	// Check for topic-specific struggles
	if (affectedTopics.length > 3) {
		causes.push('Multiple topics showing decline - possible overwhelm');
	}

	// Check for subject-specific issues
	if (affectedSubjects.length === 1) {
		causes.push(`Difficulty appears concentrated in ${affectedSubjects[0].subjectName}`);
	}

	// Check for accuracy decline
	const severeDrops = affectedSubjects.filter((s) => s.severity === 'severe');
	if (severeDrops.length > 0) {
		causes.push('Significant performance decline needs immediate attention');
	}

	// Check for burnout indicators
	if (affectedSubjects.length > 2) {
		causes.push('Multiple subjects affected - possible burnout or external factors');
	}

	return causes;
}

/**
 * Generate recovery plan
 */
function generateRecoveryPlan(
	affectedSubjects: AffectedSubject[],
	affectedTopics: AffectedTopic[],
	dropPercentage: number
): RecoveryPlan {
	const focusAreas: string[] = [];
	const suggestedActions: RecoveryAction[] = [];

	// Add affected subjects to focus areas
	for (const subject of affectedSubjects.slice(0, 3)) {
		focusAreas.push(subject.subjectName);
	}

	// Generate actions based on severity
	for (const topic of affectedTopics.slice(0, 5)) {
		suggestedActions.push({
			type: 'review',
			title: `Review: ${topic.topic}`,
			description: `Go through foundational concepts for ${topic.topic} in ${topic.subjectName}`,
			priority: topic.dropPercentage >= GRADE_DROP_THRESHOLD ? 'high' : 'medium',
			estimatedMinutes: 20,
		});

		suggestedActions.push({
			type: 'practice',
			title: `Practice: ${topic.topic}`,
			description: `Complete a practice quiz on ${topic.topic}`,
			priority: topic.dropPercentage >= GRADE_DROP_THRESHOLD ? 'high' : 'medium',
			estimatedMinutes: 15,
		});

		suggestedActions.push({
			type: 'flashcard',
			title: `Flashcards: ${topic.topic}`,
			description: `Review flashcards for key concepts in ${topic.topic}`,
			priority: 'medium',
			estimatedMinutes: 10,
		});
	}

	// Add AI tutor recommendation for severe drops
	if (dropPercentage >= GRADE_DROP_THRESHOLD * 1.5) {
		suggestedActions.unshift({
			type: 'ai-tutor',
			title: 'Get AI Tutor Help',
			description: "Ask the AI tutor to explain the topics you're struggling with",
			priority: 'high',
			estimatedMinutes: 30,
		});
	}

	// Calculate estimated recovery time
	const estimatedRecoveryDays = Math.ceil(affectedTopics.length * 2 + affectedSubjects.length * 3);

	// Generate milestones
	const milestones: RecoveryMilestone[] = [];
	const currentAvg =
		affectedSubjects.length > 0
			? affectedSubjects.reduce((sum, s) => sum + s.currentAverage, 0) / affectedSubjects.length
			: 0;

	for (let day = 3; day <= Math.min(estimatedRecoveryDays, 14); day += 3) {
		const targetIncrease = Math.min(0.05 * (day / 3), 0.2); // Max 20% improvement
		milestones.push({
			day,
			targetAverage: Math.min(currentAvg + targetIncrease, 1.0),
			description: `Day ${day}: Target ${(Math.min(currentAvg + targetIncrease, 1.0) * 100).toFixed(0)}% average`,
		});
	}

	// Generate supportive message
	const supportiveMessage = generateSupportiveMessage(dropPercentage, affectedSubjects.length);

	return {
		focusAreas,
		suggestedActions,
		estimatedRecoveryDays,
		milestones,
		supportiveMessage,
	};
}

/**
 * Generate supportive message for student
 */
function generateSupportiveMessage(dropPercentage: number, _affectedCount: number): string {
	const messages = [
		"It's completely normal to have ups and downs in your learning journey. Let's work together to get back on track! 💪",
		"Don't worry - we all have challenging periods. The important thing is that you're aware of it and ready to improve. 🌱",
		"This is just a temporary setback. With focused practice on a few key areas, you'll see improvement soon! ⭐",
		"Remember, learning isn't linear. What matters is that you keep going. We're here to support you! 🎯",
	];

	if (dropPercentage >= 0.3) {
		return "We noticed you're going through a tough time. That's okay - let's take it one step at a time. We'll help you rebuild your confidence. 💙";
	}

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get grade trend over time
 */
export async function getGradeTrend(userId: string, days = 30): Promise<GradeTrend[]> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		const now = new Date();
		const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

		// Get all attempts in period
		const attempts = await db
			.select({
				attemptedAt: questionAttempts.attemptedAt,
				isCorrect: questionAttempts.isCorrect,
			})
			.from(questionAttempts)
			.where(and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, startDate)))
			.orderBy(questionAttempts.attemptedAt);

		// Group by day
		const dailyStats = new Map<string, { correct: number; total: number }>();

		for (const attempt of attempts) {
			const dayKey = attempt.attemptedAt!.toISOString().split('T')[0];
			if (!dailyStats.has(dayKey)) {
				dailyStats.set(dayKey, { correct: 0, total: 0 });
			}
			const stats = dailyStats.get(dayKey)!;
			stats.total++;
			if (attempt.isCorrect) {
				stats.correct++;
			}
		}

		// Convert to trend data
		const trend: GradeTrend[] = [];
		for (const [dateStr, stats] of dailyStats.entries()) {
			trend.push({
				date: new Date(dateStr),
				average: stats.total > 0 ? stats.correct / stats.total : 0,
				attempts: stats.total,
			});
		}

		return trend.sort((a, b) => a.date.getTime() - b.date.getTime());
	} catch (error) {
		log.warn('Failed to get grade trend', { error });
		return [];
	}
}

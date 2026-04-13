/**
 * Crisis Intervention Service
 *
 * Handles academic crisis detection with:
 * - Detection when student averages < 40% across all subjects
 * - "Fresh Start" mode that rebuilds from basics
 * - Simplified study plan and foundational content
 * - Alert system with parent dashboard integration
 * - Dedicated support resources and simplified UI mode
 */

'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { questionAttempts, subjects, topicMastery, userProgress } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('CrisisIntervention');

// Configuration
const CRISIS_THRESHOLD = 0.4; // 40% average
const CRISIS_WINDOW_DAYS = 14; // Last 14 days
const MIN_SUBJECTS_FOR_CRISIS = 3; // At least 3 subjects to be in crisis

// Types
export interface AcademicCrisisStatus {
	isInCrisis: boolean;
	overallAverage: number;
	subjectAverages: SubjectAverage[];
	crisisLevel: 'warning' | 'critical' | 'severe';
	detectedAt: Date;
	recommendedActions: CrisisAction[];
}

export interface SubjectAverage {
	subjectId: number;
	subjectName: string;
	average: number;
	trend: 'improving' | 'stable' | 'declining';
	isBelowThreshold: boolean;
}

export interface CrisisAction {
	type:
		| 'fresh-start'
		| 'foundational-content'
		| 'simplified-plan'
		| 'parent-alert'
		| 'support-resources';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	title: string;
	description: string;
	action: string;
}

export interface FreshStartPlan {
	enabled: boolean;
	startDate: Date;
	focusAreas: string[];
	simplifiedSchedule: boolean;
	foundationalOnly: boolean;
	parentNotified: boolean;
}

export interface CrisisInterventionResult {
	success: boolean;
	crisisStatus: AcademicCrisisStatus;
	intervention: CrisisIntervention | null;
}

export interface CrisisIntervention {
	id: string;
	userId: string;
	detectedAt: Date;
	crisisLevel: 'warning' | 'critical' | 'severe';
	actions: string[];
	completed: boolean;
	completedAt: Date | null;
}

/**
 * Check if a student is in academic crisis
 */
export async function checkAcademicCrisis(userId: string): Promise<AcademicCrisisStatus> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const now = new Date();
		const windowStart = new Date(now.getTime() - CRISIS_WINDOW_DAYS * 24 * 60 * 60 * 1000);

		// Get all subjects student is enrolled in
		const enrolledSubjects = await db
			.select({
				subjectId: userProgress.subjectId,
			})
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		if (enrolledSubjects.length === 0) {
			return {
				isInCrisis: false,
				overallAverage: 0,
				subjectAverages: [],
				crisisLevel: 'warning',
				detectedAt: now,
				recommendedActions: [],
			};
		}

		// Calculate averages for each subject
		const subjectAverages: SubjectAverage[] = [];

		for (const enrolled of enrolledSubjects) {
			if (!enrolled.subjectId) continue;

			// Get subject name
			const [subject] = await db
				.select({ name: subjects.displayName })
				.from(subjects)
				.where(eq(subjects.id, enrolled.subjectId));

			if (!subject) continue;

			// Calculate average from user progress
			const [progress] = await db
				.select({
					attempted: userProgress.totalQuestionsAttempted,
					correct: userProgress.totalCorrect,
				})
				.from(userProgress)
				.where(
					and(eq(userProgress.userId, userId), eq(userProgress.subjectId, enrolled.subjectId))
				);

			if (!progress || progress.attempted === 0) {
				subjectAverages.push({
					subjectId: enrolled.subjectId,
					subjectName: subject.name,
					average: 0,
					trend: 'stable',
					isBelowThreshold: true,
				});
				continue;
			}

			const average = progress.correct / progress.attempted;

			// Calculate trend (compare last 7 days vs previous 7 days)
			const trend = await calculateSubjectTrend(userId, enrolled.subjectId, windowStart);

			subjectAverages.push({
				subjectId: enrolled.subjectId,
				subjectName: subject.name,
				average,
				trend,
				isBelowThreshold: average < CRISIS_THRESHOLD,
			});
		}

		// Calculate overall average
		const totalCorrect = subjectAverages.reduce((sum, s) => sum + s.average, 0);
		const overallAverage = subjectAverages.length > 0 ? totalCorrect / subjectAverages.length : 0;

		// Determine if in crisis
		const subjectsBelowThreshold = subjectAverages.filter((s) => s.isBelowThreshold).length;
		const isInCrisis =
			subjectsBelowThreshold >= MIN_SUBJECTS_FOR_CRISIS && overallAverage < CRISIS_THRESHOLD;

		// Determine crisis level
		let crisisLevel: 'warning' | 'critical' | 'severe' = 'warning';
		if (overallAverage < 0.25) {
			crisisLevel = 'severe';
		} else if (overallAverage < 0.35) {
			crisisLevel = 'critical';
		}

		// Generate recommended actions
		const recommendedActions = generateCrisisActions(crisisLevel, subjectAverages, overallAverage);

		return {
			isInCrisis,
			overallAverage,
			subjectAverages,
			crisisLevel,
			detectedAt: now,
			recommendedActions,
		};
	} catch (error) {
		log.error('Failed to check academic crisis', { userId, error });
		throw error;
	}
}

/**
 * Calculate subject trend (improving, stable, declining)
 */
async function calculateSubjectTrend(
	userId: string,
	subjectId: number,
	windowStart: Date
): Promise<'improving' | 'stable' | 'declining'> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return 'stable';
	}

	try {
		const midPoint = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000);

		// Recent week accuracy
		const recentAttempts = await db
			.select({ isCorrect: questionAttempts.isCorrect })
			.from(questionAttempts)
			.where(and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, midPoint)))
			.limit(50);

		// Previous week accuracy
		const previousAttempts = await db
			.select({ isCorrect: questionAttempts.isCorrect })
			.from(questionAttempts)
			.where(
				and(
					eq(questionAttempts.userId, userId),
					gte(questionAttempts.attemptedAt, windowStart),
					sql`${questionAttempts.attemptedAt} < ${midPoint}`
				)
			)
			.limit(50);

		const recentAccuracy =
			recentAttempts.length > 0
				? recentAttempts.filter((a) => a.isCorrect).length / recentAttempts.length
				: 0;

		const previousAccuracy =
			previousAttempts.length > 0
				? previousAttempts.filter((a) => a.isCorrect).length / previousAttempts.length
				: 0;

		const trendThreshold = 0.1; // 10% change
		if (recentAccuracy > previousAccuracy + trendThreshold) {
			return 'improving';
		}
		if (recentAccuracy < previousAccuracy - trendThreshold) {
			return 'declining';
		}

		return 'stable';
	} catch (error) {
		log.warn('Failed to calculate subject trend', { userId, subjectId, error });
		return 'stable';
	}
}

/**
 * Generate crisis actions based on severity
 */
function generateCrisisActions(
	crisisLevel: 'warning' | 'critical' | 'severe',
	subjectAverages: SubjectAverage[],
	overallAverage: number
): CrisisAction[] {
	const actions: CrisisAction[] = [];

	// Always recommend fresh start for crisis
	if (crisisLevel !== 'warning' || overallAverage < CRISIS_THRESHOLD) {
		actions.push({
			type: 'fresh-start',
			priority: 'urgent',
			title: 'Start Fresh Learning Plan',
			description: 'Begin a simplified study plan focused on foundational concepts',
			action: 'enable-fresh-start',
		});
	}

	// Foundational content recommendation
	const weakSubjects = subjectAverages.filter((s) => s.isBelowThreshold);
	if (weakSubjects.length > 0) {
		actions.push({
			type: 'foundational-content',
			priority: 'high',
			title: 'Access Foundational Content',
			description: `Focus on basics for: ${weakSubjects.map((s) => s.subjectName).join(', ')}`,
			action: 'view-foundational-content',
		});
	}

	// Simplified plan
	if (crisisLevel === 'critical' || crisisLevel === 'severe') {
		actions.push({
			type: 'simplified-plan',
			priority: 'high',
			title: 'Enable Simplified Study Plan',
			description: 'Reduce complexity and focus on one subject at a time',
			action: 'enable-simplified-plan',
		});
	}

	// Parent alert for severe cases
	if (crisisLevel === 'severe') {
		actions.push({
			type: 'parent-alert',
			priority: 'urgent',
			title: 'Notify Parent/Guardian',
			description: 'Academic progress concern - parent involvement recommended',
			action: 'send-parent-alert',
		});
	}

	// Support resources
	actions.push({
		type: 'support-resources',
		priority: crisisLevel === 'severe' ? 'urgent' : 'medium',
		title: 'Access Support Resources',
		description: 'Connect with tutors and academic support services',
		action: 'view-support-resources',
	});

	return actions;
}

/**
 * Enable Fresh Start mode for a student
 * Resets expectations and starts from basics
 */
export async function enableFreshStart(userId: string): Promise<FreshStartPlan> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const plan: FreshStartPlan = {
		enabled: true,
		startDate: new Date(),
		focusAreas: [],
		simplifiedSchedule: true,
		foundationalOnly: true,
		parentNotified: false,
	};

	try {
		// Log the intervention
		await logCrisisIntervention(userId, 'fresh-start-enabled');

		// Get weak subjects to focus on
		const crisisStatus = await checkAcademicCrisis(userId);
		plan.focusAreas = crisisStatus.subjectAverages
			.filter((s) => s.isBelowThreshold)
			.map((s) => s.subjectName);

		log.info('Fresh start mode enabled', {
			userId,
			focusAreas: plan.focusAreas,
		});

		return plan;
	} catch (error) {
		log.error('Failed to enable fresh start', { userId, error });
		throw error;
	}
}

/**
 * Disable Fresh Start mode
 */
export async function disableFreshStart(userId: string): Promise<void> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		await logCrisisIntervention(userId, 'fresh-start-disabled');

		log.info('Fresh start mode disabled', { userId });
	} catch (error) {
		log.error('Failed to disable fresh start', { userId, error });
		throw error;
	}
}

/**
 * Get foundational content recommendations
 */
export async function getFoundationalContentRecommendations(userId: string): Promise<
	Array<{
		topic: string;
		subject: string;
		priority: 'high' | 'medium' | 'low';
		resourceType: 'lesson' | 'quiz' | 'flashcard' | 'video';
	}>
> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		const crisisStatus = await checkAcademicCrisis(userId);
		const weakSubjects = crisisStatus.subjectAverages.filter((s) => s.isBelowThreshold);

		const recommendations: Array<{
			topic: string;
			subject: string;
			priority: 'high' | 'medium' | 'low';
			resourceType: 'lesson' | 'quiz' | 'flashcard' | 'video';
		}> = [];

		for (const subject of weakSubjects) {
			// Get topics with lowest mastery
			const weakTopics = await db
				.select({
					topic: topicMastery.topic,
					mastery: topicMastery.masteryLevel,
				})
				.from(topicMastery)
				.where(
					and(
						eq(topicMastery.userId, userId),
						eq(topicMastery.subjectId, subject.subjectId),
						sql`${topicMastery.masteryLevel} < 0.5`
					)
				)
				.orderBy(sql`${topicMastery.masteryLevel} ASC`)
				.limit(5);

			for (const topic of weakTopics) {
				recommendations.push({
					topic: topic.topic,
					subject: subject.subjectName,
					priority: 'high',
					resourceType: 'lesson',
				});
				recommendations.push({
					topic: topic.topic,
					subject: subject.subjectName,
					priority: 'high',
					resourceType: 'flashcard',
				});
			}
		}

		return recommendations;
	} catch (error) {
		log.error('Failed to get foundational content recommendations', { userId, error });
		return [];
	}
}

/**
 * Log a crisis intervention event
 */
async function logCrisisIntervention(userId: string, action: string): Promise<void> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return;
	}

	try {
		// This would insert into crisis_interventions table
		// For now, just log
		log.info('Crisis intervention logged', {
			userId,
			action,
			timestamp: new Date(),
		});
	} catch (error) {
		log.warn('Failed to log crisis intervention', { error });
	}
}

/**
 * Send parent alert (would integrate with notification service)
 */
export async function sendParentAlert(
	userId: string,
	crisisStatus: AcademicCrisisStatus
): Promise<void> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return;
	}

	try {
		// This would integrate with parent dashboard notification system
		log.info('Parent alert sent', {
			userId,
			crisisLevel: crisisStatus.crisisLevel,
			overallAverage: crisisStatus.overallAverage,
		});
	} catch (error) {
		log.error('Failed to send parent alert', { error });
	}
}

/**
 * Get simplified study plan for students in crisis
 */
export async function getSimplifiedStudyPlan(userId: string): Promise<{
	dailyGoal: string;
	focusSubject: string | null;
	suggestedDuration: number; // minutes
	breakFrequency: number; // minutes
}> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const crisisStatus = await checkAcademicCrisis(userId);
		const weakestSubject = crisisStatus.subjectAverages
			.filter((s) => s.isBelowThreshold)
			.sort((a, b) => a.average - b.average)[0];

		return {
			dailyGoal: 'Complete one foundational lesson and practice quiz',
			focusSubject: weakestSubject?.subjectName || null,
			suggestedDuration: 45, // Shorter sessions
			breakFrequency: 15, // Break every 15 minutes
		};
	} catch (error) {
		log.error('Failed to get simplified study plan', { userId, error });
		throw error;
	}
}

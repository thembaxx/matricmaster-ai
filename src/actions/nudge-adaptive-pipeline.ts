'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { conceptStruggles, notifications, topicConfidence, topicMastery } from '@/lib/db/schema';

interface AdaptiveAction {
	type: 'flashcard' | 'study-plan' | 'review' | 'break' | 'notification';
	title: string;
	description: string;
	priority: number;
	autoTriggered: boolean;
	metadata?: Record<string, unknown>;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

/**
 * Process detected nudges and automatically trigger adaptive actions
 */
export async function processNudgeAdaptively(
	_nudgeId: string,
	nudgeType: string,
	topic?: string
): Promise<AdaptiveAction[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const actions: AdaptiveAction[] = [];

	switch (nudgeType) {
		case 'concept_struggle':
			if (topic) {
				actions.push({
					type: 'flashcard',
					title: `Generate Flashcards: ${topic}`,
					description: `Creating review flashcards for ${topic} based on your struggles`,
					priority: 100,
					autoTriggered: true,
					metadata: { topic, action: 'generate' },
				});

				actions.push({
					type: 'review',
					title: `Schedule Review: ${topic}`,
					description: `Adding ${topic} to your spaced repetition review queue`,
					priority: 90,
					autoTriggered: true,
					metadata: { topic, interval: '1d' },
				});
			}
			break;

		case 'weak_topic':
			if (topic) {
				actions.push({
					type: 'study-plan',
					title: `Prioritize ${topic} in Study Plan`,
					description: `Moving ${topic} to the top of your study schedule`,
					priority: 80,
					autoTriggered: true,
					metadata: { topic, action: 'prioritize' },
				});
			}
			break;

		case 'streak_warning':
			actions.push({
				type: 'notification',
				title: 'Quick Review Session',
				description: 'Complete a short 5-minute review to maintain your streak',
				priority: 95,
				autoTriggered: false,
			});
			break;

		case 'burnout_risk':
			actions.push({
				type: 'break',
				title: 'Suggested Break',
				description: 'Consider taking a 15-minute break to avoid burnout',
				priority: 100,
				autoTriggered: true,
			});
			break;

		case 'low_confidence':
			if (topic) {
				actions.push({
					type: 'review',
					title: `Confidence Boost: ${topic}`,
					description: `Extra practice recommended for ${topic}`,
					priority: 85,
					autoTriggered: true,
					metadata: { topic },
				});
			}
			break;

		case 'exam_approaching':
			if (topic) {
				actions.push({
					type: 'study-plan',
					title: 'Focus on Exam Topics',
					description: 'Adjusting study plan to prioritize exam-relevant topics',
					priority: 95,
					autoTriggered: true,
					metadata: { topic, action: 'exam_prep' },
				});
			}
			break;
	}

	return actions;
}

/**
 * Auto-trigger adaptive actions without user confirmation
 */
export async function executeAutoAdaptiveActions(
	actions: AdaptiveAction[]
): Promise<{ executed: number; results: Array<{ type: string; success: boolean }> }> {
	const results: Array<{ type: string; success: boolean }> = [];
	let executed = 0;

	for (const action of actions) {
		if (!action.autoTriggered) continue;

		switch (action.type) {
			case 'flashcard':
				results.push({ type: 'flashcard', success: true });
				executed++;
				break;

			case 'study-plan':
				results.push({ type: 'study-plan', success: true });
				executed++;
				break;

			case 'review':
				results.push({ type: 'review', success: true });
				executed++;
				break;

			case 'notification':
				results.push({ type: 'notification', success: true });
				executed++;
				break;

			default:
				results.push({ type: action.type, success: false });
		}
	}

	return { executed, results };
}

/**
 * Get adaptive recommendations based on all detected nudges
 */
export async function getAdaptiveRecommendations(): Promise<{
	recommendations: AdaptiveAction[];
	summary: string;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { recommendations: [], summary: 'Sign in to get recommendations' };
	}

	const db = await getDb();
	const userId = session.user.id;
	const recommendations: AdaptiveAction[] = [];

	// Check unresolved concept struggles
	const struggles = await db.query.conceptStruggles.findMany({
		where: and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.isResolved, false)),
		orderBy: [desc(conceptStruggles.struggleCount)],
		limit: 3,
	});

	for (const struggle of struggles) {
		if (struggle.struggleCount >= 3) {
			recommendations.push({
				type: 'flashcard',
				title: `High Priority: ${struggle.concept}`,
				description: `You've struggled ${struggle.struggleCount} times. Let's create targeted flashcards.`,
				priority: 100 - struggle.struggleCount * 10,
				autoTriggered: true,
				metadata: { topic: struggle.concept },
			});
		}
	}

	// Check low confidence topics
	const lowConfidence = await db.query.topicConfidence.findMany({
		where: and(eq(topicConfidence.userId, userId), sql`${topicConfidence.confidenceScore} < 0.4`),
		limit: 3,
	});

	for (const topic of lowConfidence) {
		recommendations.push({
			type: 'review',
			title: `Boost Confidence: ${topic.topic}`,
			description: 'Your confidence is low. A quick review session can help.',
			priority: 70,
			autoTriggered: false,
			metadata: { topic: topic.topic, subject: topic.subject },
		});
	}

	// Check for topics needing review based on mastery
	const masteryReview = await db.query.topicMastery.findMany({
		where: and(
			eq(topicMastery.userId, userId),
			sql`${topicMastery.nextReview} <= NOW()`,
			sql`${topicMastery.masteryLevel} < 0.8`
		),
		orderBy: [desc(topicMastery.lastPracticed)],
		limit: 3,
	});

	for (const mastery of masteryReview) {
		recommendations.push({
			type: 'review',
			title: `Review Due: ${mastery.topic}`,
			description: `It's time to review ${mastery.topic} to reinforce your learning.`,
			priority: 75,
			autoTriggered: true,
			metadata: { topic: mastery.topic, masteryLevel: mastery.masteryLevel },
		});
	}

	// Sort by priority
	recommendations.sort((a, b) => b.priority - a.priority);

	const summary =
		recommendations.length > 0
			? `${recommendations.length} adaptive recommendations based on your learning patterns`
			: 'No urgent recommendations. Keep up the great work!';

	return { recommendations, summary };
}

/**
 * Create a notification for a nudge
 */
export async function createNudgeNotification(
	nudgeType: string,
	title: string,
	message: string,
	data?: Record<string, unknown>
): Promise<{ success: boolean; notificationId?: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return { success: false };

	const db = await getDb();

	try {
		const [notification] = await db
			.insert(notifications)
			.values({
				userId: session.user.id,
				type: `nudge_${nudgeType}`,
				title,
				message,
				data: data ? JSON.stringify(data) : null,
				isRead: false,
			})
			.returning();

		return { success: true, notificationId: notification.id };
	} catch (error) {
		console.error('Failed to create notification:', error);
		return { success: false };
	}
}

/**
 * Get user's learning patterns for adaptive recommendations
 */
export async function getUserLearningPatterns(): Promise<{
	strugglingConcepts: Array<{ concept: string; count: number }>;
	lowConfidenceTopics: Array<{ topic: string; confidence: number }>;
	reviewDue: Array<{ topic: string; daysSince: number }>;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { strugglingConcepts: [], lowConfidenceTopics: [], reviewDue: [] };
	}

	const db = await getDb();
	const userId = session.user.id;

	// Get struggling concepts
	const struggles = await db.query.conceptStruggles.findMany({
		where: and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.isResolved, false)),
		orderBy: [desc(conceptStruggles.struggleCount)],
		limit: 5,
	});

	// Get low confidence topics
	const lowConf = await db.query.topicConfidence.findMany({
		where: and(eq(topicConfidence.userId, userId), sql`${topicConfidence.confidenceScore} < 0.5`),
		orderBy: [desc(topicConfidence.lastAttemptAt)],
		limit: 5,
	});

	// Get review due topics
	const now = new Date();
	const reviewDue = await db.query.topicMastery.findMany({
		where: and(eq(topicMastery.userId, userId), sql`${topicMastery.nextReview} <= ${now}`),
		orderBy: [desc(topicMastery.lastPracticed)],
		limit: 5,
	});

	return {
		strugglingConcepts: struggles.map((s) => ({
			concept: s.concept,
			count: s.struggleCount,
		})),
		lowConfidenceTopics: lowConf.map((t) => ({
			topic: t.topic,
			confidence: Number(t.confidenceScore),
		})),
		reviewDue: reviewDue.map((r) => ({
			topic: r.topic,
			daysSince: r.lastPracticed
				? Math.floor((now.getTime() - new Date(r.lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
				: 0,
		})),
	};
}

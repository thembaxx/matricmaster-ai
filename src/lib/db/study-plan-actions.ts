'use server';

import { and, desc, eq } from 'drizzle-orm';
import type { WeakTopic } from '@/lib/quiz-grader';
import { dbManager, getDb } from './index';
import { type NewStudyPlan, type StudyPlan, studyPlans } from './schema';

/**
 * Create a new study plan
 */
export async function createStudyPlanAction(
	userId: string,
	title: string,
	targetExamDate?: Date,
	focusAreas?: string,
	weeklyGoals?: string
): Promise<{ success: boolean; plan?: StudyPlan; error?: string }> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = await getDb();
		const [plan] = await db
			.insert(studyPlans)
			.values({
				userId,
				title,
				targetExamDate: targetExamDate ? new Date(targetExamDate) : null,
				focusAreas,
				weeklyGoals,
				isActive: true,
			} as NewStudyPlan)
			.returning();

		return { success: true, plan };
	} catch (error) {
		console.debug('[Study Plan] Error creating plan:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create study plan',
		};
	}
}

/**
 * Get user's study plans
 */
export async function getStudyPlansAction(userId: string): Promise<StudyPlan[]> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return [];
		}

		const db = await getDb();
		return db
			.select()
			.from(studyPlans)
			.where(eq(studyPlans.userId, userId))
			.orderBy(desc(studyPlans.createdAt));
	} catch (error) {
		console.debug('[Study Plan] Error getting plans:', error);
		return [];
	}
}

/**
 * Get user's active study plan
 */
export async function getActiveStudyPlanAction(userId: string): Promise<StudyPlan | null> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return null;
		}

		const db = await getDb();
		const [plan] = await db
			.select()
			.from(studyPlans)
			.where(and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)))
			.limit(1);

		return plan ?? null;
	} catch (error) {
		console.debug('[Study Plan] Error getting active plan:', error);
		return null;
	}
}

/**
 * Update a study plan
 */
export async function updateStudyPlanAction(
	planId: string,
	userId: string,
	data: {
		title?: string;
		targetExamDate?: Date;
		focusAreas?: string;
		weeklyGoals?: string;
		isActive?: boolean;
	}
): Promise<{ success: boolean; plan?: StudyPlan }> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = await getDb();
		const [plan] = await db
			.update(studyPlans)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
			.returning();

		return { success: !!plan, plan };
	} catch (error) {
		console.debug('[Study Plan] Error updating plan:', error);
		return { success: false };
	}
}

/**
 * Delete a study plan
 */
export async function deleteStudyPlanAction(
	planId: string,
	userId: string
): Promise<{ success: boolean }> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = await getDb();
		const result = await db
			.delete(studyPlans)
			.where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.debug('[Study Plan] Error deleting plan:', error);
		return { success: false };
	}
}

/**
 * Deactivate a study plan (soft delete)
 */
export async function deactivateStudyPlanAction(
	planId: string,
	userId: string
): Promise<{ success: boolean }> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = await getDb();
		const result = await db
			.update(studyPlans)
			.set({ isActive: false, updatedAt: new Date() })
			.where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.debug('[Study Plan] Error deactivating plan:', error);
		return { success: false };
	}
}

// ============================================================================
// STUDY PLAN ADJUSTMENT FOR WEAK TOPICS
// ============================================================================

interface StudyPlanAdjustment {
	topicsPrioritized: string[];
	difficultyAdjustments: Array<{
		topic: string;
		newDifficulty: 'easier' | 'harder' | 'same';
		reason: string;
	}>;
	focusAreasUpdated: boolean;
	sessionsReordered: boolean;
}

interface AdjustStudyPlanResult {
	success: boolean;
	adjustment?: StudyPlanAdjustment;
	error?: string;
}

/**
 * Adjusts the user's active study plan based on weak topics detected from quiz performance
 */
export async function adjustStudyPlanForWeakTopics(
	userId: string,
	weakTopics: WeakTopic[]
): Promise<AdjustStudyPlanResult> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = await getDb();

		// Get the user's active study plan
		const [activePlan] = await db
			.select()
			.from(studyPlans)
			.where(and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)))
			.limit(1);

		if (!activePlan) {
			return {
				success: false,
				error: 'No active study plan found. Create a study plan first.',
			};
		}

		// Build adjustment summary
		const adjustment: StudyPlanAdjustment = {
			topicsPrioritized: [],
			difficultyAdjustments: [],
			focusAreasUpdated: false,
			sessionsReordered: false,
		};

		// Extract weak topic names for focus areas
		const weakTopicNames = weakTopics.map((t) => t.topic);

		// Parse existing focus areas
		let existingFocusAreas: string[] = [];
		if (activePlan.focusAreas) {
			try {
				existingFocusAreas = JSON.parse(activePlan.focusAreas);
			} catch {
				existingFocusAreas = activePlan.focusAreas.split(',').map((t) => t.trim());
			}
		}

		// Merge weak topics into focus areas (preserve existing, add new ones)
		const updatedFocusAreas = [...new Set([...existingFocusAreas, ...weakTopicNames])];

		// Determine difficulty adjustments based on struggle level
		for (const weakTopic of weakTopics) {
			adjustment.topicsPrioritized.push(weakTopic.topic);

			let newDifficulty: 'easier' | 'harder' | 'same';
			let reason: string;

			switch (weakTopic.struggleLevel) {
				case 'high':
					newDifficulty = 'easier';
					reason = 'High struggle level detected - recommend easier practice';
					break;
				case 'medium':
					if (weakTopic.accuracy < 0.3) {
						newDifficulty = 'easier';
						reason = 'Very low accuracy - recommend foundational practice';
					} else {
						newDifficulty = 'same';
						reason = 'Medium struggle level - maintain current difficulty';
					}
					break;
				case 'low':
					newDifficulty = 'same';
					reason = 'Borderline mastery - continue current difficulty';
					break;
				default:
					newDifficulty = 'same';
					reason = 'Unknown struggle level';
			}

			adjustment.difficultyAdjustments.push({
				topic: weakTopic.topic,
				newDifficulty,
				reason,
			});
		}

		// Check if focus areas changed
		adjustment.focusAreasUpdated = updatedFocusAreas.length > existingFocusAreas.length;
		adjustment.sessionsReordered = weakTopics.length > 0;

		// Update the study plan with new focus areas
		const focusAreasJson = JSON.stringify(updatedFocusAreas);

		// Build weekly goals update based on weak topics
		let weeklyGoals = activePlan.weeklyGoals || '';
		if (weakTopics.length > 0) {
			const weakTopicsSummary = weakTopics
				.map((t) => `${t.topic} (${Math.round(t.accuracy * 100)}% accuracy)`)
				.join(', ');
			const newGoal = `\n[Auto-generated] Focus on improving: ${weakTopicsSummary}`;
			weeklyGoals = weeklyGoals.includes('[Auto-generated]')
				? weeklyGoals.replace(/\[Auto-generated\].*$/m, newGoal)
				: weeklyGoals + newGoal;
		}

		// Update the study plan
		await db
			.update(studyPlans)
			.set({
				focusAreas: focusAreasJson,
				weeklyGoals,
				updatedAt: new Date(),
			})
			.where(and(eq(studyPlans.id, activePlan.id), eq(studyPlans.userId, userId)));

		return {
			success: true,
			adjustment,
		};
	} catch (error) {
		console.debug('[Study Plan] Error adjusting plan for weak topics:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to adjust study plan',
		};
	}
}

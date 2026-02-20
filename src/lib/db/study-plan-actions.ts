'use server';

import { and, desc, eq } from 'drizzle-orm';
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

		const db = getDb();
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
		console.error('[Study Plan] Error creating plan:', error);
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

		const db = getDb();
		return db
			.select()
			.from(studyPlans)
			.where(eq(studyPlans.userId, userId))
			.orderBy(desc(studyPlans.createdAt));
	} catch (error) {
		console.error('[Study Plan] Error getting plans:', error);
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

		const db = getDb();
		const [plan] = await db
			.select()
			.from(studyPlans)
			.where(and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)))
			.limit(1);

		return plan ?? null;
	} catch (error) {
		console.error('[Study Plan] Error getting active plan:', error);
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

		const db = getDb();
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
		console.error('[Study Plan] Error updating plan:', error);
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

		const db = getDb();
		const result = await db
			.delete(studyPlans)
			.where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[Study Plan] Error deleting plan:', error);
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

		const db = getDb();
		const result = await db
			.update(studyPlans)
			.set({ isActive: false, updatedAt: new Date() })
			.where(and(eq(studyPlans.id, planId), eq(studyPlans.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[Study Plan] Error deactivating plan:', error);
		return { success: false };
	}
}

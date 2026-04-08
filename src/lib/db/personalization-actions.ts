import { eq } from 'drizzle-orm';
import { db } from './index';
import {
	type AdaptiveLearningMetrics,
	adaptiveLearningMetrics,
	type PersonalizedStudyPlans,
	personalizedStudyPlans,
	type UserLearningPreferences,
	userLearningPreferences,
} from './schema';

// ============================================================================
// USER LEARNING PREFERENCES ACTIONS
// ============================================================================

export async function getUserLearningPreferences(userId: string) {
	const result = await db
		.select()
		.from(userLearningPreferences)
		.where(eq(userLearningPreferences.userId, userId))
		.limit(1);

	return result[0] || null;
}

export async function createUserLearningPreferences(data: UserLearningPreferences) {
	const result = await db.insert(userLearningPreferences).values(data).returning();

	return result[0];
}

export async function updateUserLearningPreferences(
	userId: string,
	data: Partial<Omit<UserLearningPreferences, 'userId' | 'createdAt'>>
) {
	const result = await db
		.update(userLearningPreferences)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(userLearningPreferences.userId, userId))
		.returning();

	return result[0];
}

export async function upsertUserLearningPreferences(
	userId: string,
	data: Omit<UserLearningPreferences, 'userId' | 'createdAt' | 'updatedAt'>
) {
	const result = await db
		.insert(userLearningPreferences)
		.values({ userId, ...data })
		.onConflictDoUpdate({
			target: userLearningPreferences.userId,
			set: { ...data, updatedAt: new Date() },
		})
		.returning();

	return result[0];
}

// ============================================================================
// ADAPTIVE LEARNING METRICS ACTIONS
// ============================================================================

export async function getAdaptiveLearningMetrics(userId: string, limit = 50) {
	return await db
		.select()
		.from(adaptiveLearningMetrics)
		.where(eq(adaptiveLearningMetrics.userId, userId))
		.orderBy(adaptiveLearningMetrics.createdAt)
		.limit(limit);
}

export async function createAdaptiveLearningMetrics(data: AdaptiveLearningMetrics) {
	const result = await db.insert(adaptiveLearningMetrics).values(data).returning();

	return result[0];
}

export async function getAdaptiveMetricsBySubject(userId: string, subjectId: number) {
	return await db
		.select()
		.from(adaptiveLearningMetrics)
		.where(
			eq(adaptiveLearningMetrics.userId, userId) && eq(adaptiveLearningMetrics.subjectId, subjectId)
		)
		.orderBy(adaptiveLearningMetrics.createdAt);
}

// ============================================================================
// PERSONALIZED STUDY PLANS ACTIONS
// ============================================================================

export async function getPersonalizedStudyPlans(userId: string) {
	return await db
		.select()
		.from(personalizedStudyPlans)
		.where(eq(personalizedStudyPlans.userId, userId))
		.orderBy(personalizedStudyPlans.createdAt);
}

export async function getActiveStudyPlan(userId: string) {
	const result = await db
		.select()
		.from(personalizedStudyPlans)
		.where(eq(personalizedStudyPlans.userId, userId) && eq(personalizedStudyPlans.isActive, true))
		.limit(1);

	return result[0] || null;
}

export async function createPersonalizedStudyPlan(data: PersonalizedStudyPlans) {
	const result = await db.insert(personalizedStudyPlans).values(data).returning();

	return result[0];
}

export async function updatePersonalizedStudyPlan(
	planId: string,
	data: Partial<Omit<PersonalizedStudyPlans, 'id' | 'userId' | 'createdAt'>>
) {
	const result = await db
		.update(personalizedStudyPlans)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(personalizedStudyPlans.id, planId))
		.returning();

	return result[0];
}

export async function deactivateStudyPlan(planId: string) {
	const result = await db
		.update(personalizedStudyPlans)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(personalizedStudyPlans.id, planId))
		.returning();

	return result[0];
}

'use server';

import { getAuth } from '@/lib/auth';
import {
	adjustStudyPlanForWeakTopics,
	getActiveStudyPlanAction,
} from '@/lib/db/study-plan-actions';
import type { WeakTopic } from '@/lib/quiz-grader';

/**
 * Bridge: AI Tutor → Study Plan
 * After a tutoring session identifies weak areas, adjusts the study plan.
 * Called from the AI tutor UI when the user clicks "Add to study plan".
 */

export interface TutorWeakArea {
	topic: string;
	subject: string;
	confidence: number;
}

export async function addTutorWeakAreasToStudyPlan(
	weakAreas: TutorWeakArea[]
): Promise<{ success: boolean; adjustment?: string; error?: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return { success: false, error: 'Not authenticated' };
	}

	if (weakAreas.length === 0) {
		return { success: false, error: 'No weak areas identified' };
	}

	// Check if user has an active study plan
	const activePlan = await getActiveStudyPlanAction(session.user.id);
	if (!activePlan) {
		return {
			success: false,
			error: 'No active study plan. Create a study plan first to track weak areas.',
		};
	}

	// Convert tutor weak areas to the WeakTopic format
	const weakTopics: WeakTopic[] = weakAreas.map((area) => ({
		topic: area.topic,
		subject: area.subject,
		accuracy: area.confidence,
		questionsAttempted: 1,
		correctAnswers: area.confidence >= 0.5 ? 1 : 0,
		struggleLevel: (area.confidence < 0.4 ? 'high' : area.confidence < 0.6 ? 'medium' : 'low') as
			| 'high'
			| 'medium'
			| 'low',
		isTimeStruggle: false,
	}));

	const result = await adjustStudyPlanForWeakTopics(session.user.id, weakTopics);

	if (!result.success) {
		return { success: false, error: result.error };
	}

	const prioritized = result.adjustment?.topicsPrioritized || [];
	return {
		success: true,
		adjustment:
			prioritized.length > 0
				? `Added ${prioritized.length} topic(s) to your study plan: ${prioritized.join(', ')}`
				: 'Study plan updated',
	};
}

export async function getStudyPlanStatus(): Promise<{
	hasActivePlan: boolean;
	planTitle?: string;
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return { hasActivePlan: false };

	const activePlan = await getActiveStudyPlanAction(session.user.id);
	return {
		hasActivePlan: !!activePlan,
		planTitle: activePlan?.title,
	};
}

'use server';

import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { generateFlashcardsFromWeakTopics, syncMasteryToConfidence } from './adaptive-learning';
import {
	checkAndUnlockAchievements,
	claimLoginBonus,
	syncLeaderboard,
	updateStreak,
} from './gamification';
import { trackStudySession } from './study-planning';

export async function onQuizCompleted(
	subjectId: number,
	topic: string,
	durationMinutes: number,
	questionsAttempted: number,
	correctAnswers: number,
	_isPerfect: boolean
) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return;

	await trackStudySession(subjectId, topic, durationMinutes, questionsAttempted, correctAnswers);

	const newAchievements = await checkAndUnlockAchievements();

	const { streakDays } = await updateStreak();

	await syncLeaderboard('weekly');

	if (streakDays === 1) {
		await claimLoginBonus();
	}

	return {
		achievementsUnlocked: newAchievements,
		streakDays,
	};
}

export async function onFlashcardReviewed(_rating: number, topic: string, _subject: string) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return;

	const newAchievements = await checkAndUnlockAchievements();

	await updateStreak();

	await syncMasteryToConfidence(session.user.id);

	const weakTopics = await getWeakTopicsFromDb();
	if (weakTopics.some((w: (typeof weakTopics)[number]) => w.topic === topic)) {
		await generateFlashcardsFromWeakTopics(session.user.id, [topic]);
	}

	return {
		achievementsUnlocked: newAchievements,
	};
}

async function getWeakTopicsFromDb() {
	const db = await dbManager.getDb();
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const { topicConfidence } = await import('@/lib/db/schema');

	return db.query.topicConfidence.findMany({
		where: sql`${topicConfidence.userId} = ${session.user.id} AND ${topicConfidence.confidenceScore} < 0.5`,
	});
}

export async function onStudyPlanCreated(planId: string, focusAreas: string[]) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return;

	const { generateCalendarEventsFromPlan } = await import('./study-planning');
	await generateCalendarEventsFromPlan(planId);

	await generateFlashcardsFromWeakTopics(session.user.id, focusAreas);

	await checkAndUnlockAchievements();
}

export async function onBuddyMatched(_buddyId: string) {
	const newAchievements = await checkAndUnlockAchievements();

	await syncLeaderboard('weekly');

	return {
		achievementsUnlocked: newAchievements,
	};
}

import { sql } from 'drizzle-orm';

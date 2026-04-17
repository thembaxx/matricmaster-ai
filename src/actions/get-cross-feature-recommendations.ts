'use server';

import { ensureAuthenticated } from '@/lib/db/actions';
import { dbManager, getDb } from '@/lib/db/index';
import { getMistakesFromStore, getWeakTopicsForUser } from '@/lib/db/learning-loop-actions';
import { getDueFlashcards } from '@/lib/db/review-queue-actions';
import { subjects } from '@/lib/db/schema';
import { getActiveStudyPlanAction } from '@/lib/db/study-plan-actions';

interface Recommendation {
	id: string;
	type: 'quiz' | 'flashcard' | 'study-plan' | 'tutoring' | 'past-paper';
	priority: number;
	title: string;
	reason: string;
	actionUrl: string;
	estimatedMinutes: number;
	sourceFeature: string;
}

interface UnvisitedMistake {
	id: string;
	topic: string;
	subjectSlug: string;
	questionText: string;
}

interface WeakTopicInfo {
	slug: string;
	name: string;
	subjectSlug: string;
	rank: number;
	masteryLevel: number;
}

async function getUnvisitedMistakes(): Promise<UnvisitedMistake[]> {
	try {
		await ensureAuthenticated();
		const mistakes = await getMistakesFromStore();

		if (mistakes.length === 0) return [];

		const uniqueTopics = new Map<string, UnvisitedMistake>();
		for (const mistake of mistakes.slice(0, 5)) {
			const key = mistake.topic;
			if (!uniqueTopics.has(key)) {
				uniqueTopics.set(key, {
					id: mistake.questionId,
					topic: mistake.topic,
					subjectSlug: mistake.subject.toLowerCase().replace(/\s+/g, '-'),
					questionText: mistake.questionText,
				});
			}
		}

		return Array.from(uniqueTopics.values());
	} catch (error) {
		console.debug('[Cross-Feature] Error getting unvisited mistakes:', error);
		return [];
	}
}

async function getWeakTopics(): Promise<WeakTopicInfo[]> {
	try {
		await ensureAuthenticated();
		const weakTopics = await getWeakTopicsForUser();

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) return [];

		const db = await getDb();
		const subjectMap = new Map<string, string>();
		const allSubjects = await db.select({ id: subjects.id, slug: subjects.slug }).from(subjects);
		for (const s of allSubjects) {
			subjectMap.set(String(s.id), s.slug);
		}

		return weakTopics
			.map((topic, index) => ({
				slug: topic.topic.toLowerCase().replace(/\s+/g, '-'),
				name: topic.topic,
				subjectSlug: subjectMap.get(String(topic.subjectId)) || 'mathematics',
				rank: index,
				masteryLevel: topic.masteryLevel,
			}))
			.slice(0, 3);
	} catch (error) {
		console.debug('[Cross-Feature] Error getting weak topics:', error);
		return [];
	}
}

async function getFlashcardsDueForUser(): Promise<number> {
	try {
		const user = await ensureAuthenticated();
		const dueCards = await getDueFlashcards(user.id);
		return dueCards.length;
	} catch (error) {
		console.debug('[Cross-Feature] Error getting flashcards due:', error);
		return 0;
	}
}

async function getStudyPlanInfo(): Promise<{ hasPlan: boolean; planTitle?: string }> {
	try {
		const user = await ensureAuthenticated();
		const activePlan = await getActiveStudyPlanAction(user.id);
		return {
			hasPlan: !!activePlan,
			planTitle: activePlan?.title,
		};
	} catch (error) {
		console.debug('[Cross-Feature] Error getting study plan info:', error);
		return { hasPlan: false };
	}
}

export async function getCrossFeatureRecommendations(): Promise<Recommendation[]> {
	const [mistakes, weakTopics, flashcardCount, studyPlan] = await Promise.all([
		getUnvisitedMistakes(),
		getWeakTopics(),
		getFlashcardsDueForUser(),
		getStudyPlanInfo(),
	]);

	const recommendations: Recommendation[] = [];

	if (mistakes.length > 0) {
		const topMistake = mistakes[0];
		recommendations.push({
			id: `mistake-review-${topMistake.id}`,
			type: 'quiz',
			priority: 95,
			title: `Review: ${topMistake.topic}`,
			reason: 'You got this wrong recently',
			actionUrl: `/quiz/${topMistake.subjectSlug}?topic=${encodeURIComponent(topMistake.topic)}`,
			estimatedMinutes: 10,
			sourceFeature: 'Review Queue',
		});
	}

	for (const topic of weakTopics) {
		recommendations.push({
			id: `weak-topic-${topic.slug}`,
			type: 'quiz',
			priority: 80 - topic.rank * 10,
			title: `Practice: ${topic.name}`,
			reason: `${topic.masteryLevel.toFixed(0)}% mastery - needs work`,
			actionUrl: `/quiz/${topic.subjectSlug}?topic=${encodeURIComponent(topic.name)}`,
			estimatedMinutes: 15,
			sourceFeature: 'Progress',
		});
	}

	if (flashcardCount > 0) {
		recommendations.push({
			id: 'flashcards-due',
			type: 'flashcard',
			priority: 85,
			title: `${flashcardCount} cards due`,
			reason: 'Spaced repetition waiting',
			actionUrl: '/flashcards',
			estimatedMinutes: Math.min(flashcardCount * 2, 30),
			sourceFeature: 'Flashcards',
		});
	}

	if (studyPlan.hasPlan) {
		recommendations.push({
			id: 'study-plan-active',
			type: 'study-plan',
			priority: 90,
			title: studyPlan.planTitle || 'Continue your study plan',
			reason: 'Keep up your momentum',
			actionUrl: '/study-plan',
			estimatedMinutes: 30,
			sourceFeature: 'Study Planner',
		});
	} else {
		recommendations.push({
			id: 'study-plan-create',
			type: 'study-plan',
			priority: 60,
			title: 'Create a study plan',
			reason: 'Organize your exam prep',
			actionUrl: '/study-plan/create',
			estimatedMinutes: 5,
			sourceFeature: 'Study Planner',
		});
	}

	return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

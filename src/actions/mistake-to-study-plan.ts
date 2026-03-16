'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarEvents, pastPapers, questions } from '@/lib/db/schema';

function generateId(): string {
	return crypto.randomUUID();
}

export interface MistakeWithContent {
	topic: string;
	subject: string;
	questionId: string;
	recommendedPastPaper?: {
		id: string;
		title: string;
		difficulty: string;
	};
	recommendedLesson?: {
		id: string;
		title: string;
		topic: string;
	};
}

export async function addMistakeToStudyPlanAction(
	mistakes: Array<{ topic: string; questionId: string; subject: string }>
): Promise<{ success: boolean; eventsAdded: number; recommendations: MistakeWithContent[] }> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, eventsAdded: 0, recommendations: [] };
	}

	const db = dbManager.getDb();

	const activePlan = await db.query.studyPlans.findFirst({
		where: (plans, { eq, and }) => and(eq(plans.userId, session.user.id), eq(plans.isActive, true)),
	});

	if (!activePlan) {
		return { success: false, eventsAdded: 0, recommendations: [] };
	}

	const now = new Date();
	let eventsAdded = 0;

	for (const mistake of mistakes) {
		const eventDate = new Date(now);
		eventDate.setDate(eventDate.getDate() + 1);

		await db.insert(calendarEvents).values({
			id: generateId(),
			userId: session.user.id,
			studyPlanId: activePlan.id,
			title: `Review: ${mistake.topic}`,
			description: 'Auto-generated from quiz mistakes. Review this topic to improve.',
			eventType: 'study',
			startTime: eventDate,
			endTime: new Date(eventDate.getTime() + 30 * 60 * 1000),
			isCompleted: false,
		});
		eventsAdded++;
	}

	revalidatePath('/study-plan');

	const recommendations = await getMistakeContentRecommendations(mistakes);

	return { success: true, eventsAdded, recommendations };
}

export async function getMistakeContentRecommendations(
	mistakes: Array<{ topic: string; subject: string; questionId: string }>
): Promise<MistakeWithContent[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = dbManager.getDb();
	const results: MistakeWithContent[] = [];

	for (const mistake of mistakes) {
		const papers = await db.query.pastPapers.findMany({
			where: and(eq(pastPapers.isExtracted, true)),
			limit: 20,
		});

		const relevantPaper = papers.find(
			(p) => p.subject.toLowerCase() === mistake.subject.toLowerCase()
		);

		const easierQuestions = await db.query.questions.findMany({
			where: and(eq(questions.topic, mistake.topic), eq(questions.difficulty, 'easy')),
			limit: 1,
		});

		results.push({
			...mistake,
			recommendedPastPaper: relevantPaper
				? {
						id: relevantPaper.id,
						title: `${relevantPaper.subject} - ${relevantPaper.paper}`,
						difficulty: 'medium',
					}
				: undefined,
			recommendedLesson:
				easierQuestions.length > 0
					? {
							id: easierQuestions[0].id,
							title: `Practice: ${mistake.topic} (Easy)`,
							topic: mistake.topic,
						}
					: undefined,
		});
	}

	return results;
}

export async function getRecentMistakesAction(
	limit = 10
): Promise<Array<{ topic: string; questionId: string; subject: string }>> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = dbManager.getDb();

	const attempts = await db.query.questionAttempts.findMany({
		where: (attempts, { eq, and }) =>
			and(eq(attempts.userId, session.user.id), eq(attempts.isCorrect, false)),
		orderBy: (attempts, { desc }) => [desc(attempts.attemptedAt)],
		limit,
	});

	return attempts.map((a) => ({
		topic: a.topic,
		questionId: a.questionId,
		subject: a.topic.split(' ')[0] || 'General',
	}));
}

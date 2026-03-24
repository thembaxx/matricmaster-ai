'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	calendarEvents,
	conceptStruggles,
	pastPapers,
	questionAttempts,
	questions,
	studyPlans,
	subjects,
	topicMastery,
} from '@/lib/db/schema';

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
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, eventsAdded: 0, recommendations: [] };
	}

	const db = dbManager.getDb() as DbType;

	const activePlan = await db.query.studyPlans.findFirst({
		where: and(eq(studyPlans.userId, session.user.id), eq(studyPlans.isActive, true)),
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
			description: 'From quiz mistakes. Review this topic to improve.',
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

	const db = dbManager.getDb() as DbType;
	const results: MistakeWithContent[] = [];

	for (const mistake of mistakes) {
		const papers = await db.query.pastPapers.findMany({
			where: and(eq(pastPapers.isExtracted, true)),
			limit: 20,
		});

		const relevantPaper = papers.find(
			(p: (typeof papers)[number]) => p.subject.toLowerCase() === mistake.subject.toLowerCase()
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
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = dbManager.getDb() as DbType;

	const attempts = await db.query.questionAttempts.findMany({
		where: and(eq(questionAttempts.userId, session.user.id), eq(questionAttempts.isCorrect, false)),
		orderBy: [desc(questionAttempts.attemptedAt)],
		limit,
	});

	return attempts.map((a: (typeof attempts)[number]) => ({
		topic: a.topic,
		questionId: a.questionId,
		subject: a.topic.split(' ')[0] || 'General',
	}));
}

export async function getUnvisitedMistakesCountAction(): Promise<number> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return 0;

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return 0;

	const db = dbManager.getDb() as DbType;
	const now = new Date();

	const unvisitedAttempts = await db.query.questionAttempts.findMany({
		where: and(
			eq(questionAttempts.userId, session.user.id),
			eq(questionAttempts.isCorrect, false),
			sql`${questionAttempts.nextReviewAt} <= ${now.toISOString()} OR ${questionAttempts.nextReviewAt} IS NULL`
		),
	});

	const unresolvedStruggles = await db.query.conceptStruggles.findMany({
		where: and(
			eq(conceptStruggles.userId, session.user.id),
			eq(conceptStruggles.isResolved, false)
		),
	});

	const uniqueMistakeTopics = new Set(
		unvisitedAttempts.map((a: (typeof unvisitedAttempts)[number]) => `${a.topic}-${a.questionId}`)
	);

	return Math.max(uniqueMistakeTopics.size, unresolvedStruggles.length);
}

export interface MistakeForPractice {
	questionId: string;
	topic: string;
	subject: string;
	subjectId: number;
	wasCorrect?: boolean;
}

export async function getMistakesForPracticeAction(limit = 10): Promise<MistakeForPractice[]> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = dbManager.getDb() as DbType;
	const now = new Date();

	const attempts = await db.query.questionAttempts.findMany({
		where: and(
			eq(questionAttempts.userId, session.user.id),
			eq(questionAttempts.isCorrect, false),
			sql`${questionAttempts.nextReviewAt} <= ${now.toISOString()} OR ${questionAttempts.nextReviewAt} IS NULL`
		),
		orderBy: [desc(questionAttempts.attemptedAt)],
		limit,
	});

	const topicSet = new Set<string>(attempts.map((a: (typeof attempts)[number]) => a.topic));
	const topicSubjectMap = new Map<string, { subject: string; subjectId: number }>();

	for (const topic of topicSet) {
		const subjectParts = topic.split(' ');
		const potentialSubject = subjectParts[0];

		const allSubjects = await db.query.subjects.findMany({
			where: sql`LOWER(${subjects.name}) LIKE LOWER(${`%${potentialSubject}%`})`,
			limit: 1,
		});

		if (allSubjects.length > 0) {
			topicSubjectMap.set(topic, {
				subject: allSubjects[0].name,
				subjectId: allSubjects[0].id,
			});
		} else {
			topicSubjectMap.set(topic, {
				subject: potentialSubject,
				subjectId: 1,
			});
		}
	}

	return attempts.map((a: (typeof attempts)[number]) => {
		const subjectInfo = topicSubjectMap.get(a.topic) || {
			subject: a.topic.split(' ')[0] || 'General',
			subjectId: 1,
		};
		return {
			questionId: a.questionId,
			topic: a.topic,
			subject: subjectInfo.subject,
			subjectId: subjectInfo.subjectId,
		};
	});
}

export async function resolveMistakeAction(mistake: {
	topic: string;
	questionId: string;
	wasCorrect: boolean;
}): Promise<{ success: boolean; masteryImproved: boolean }> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, masteryImproved: false };
	}

	const db = dbManager.getDb() as DbType;
	let masteryImproved = false;

	if (mistake.wasCorrect) {
		const allSubjects = await db.query.subjects.findMany({
			limit: 1,
		});
		const defaultSubjectId = allSubjects[0]?.id || 1;

		const existingMastery = await db.query.topicMastery.findFirst({
			where: and(eq(topicMastery.userId, session.user.id), eq(topicMastery.topic, mistake.topic)),
		});

		if (existingMastery) {
			const newCorrect = existingMastery.questionsCorrect + 1;
			const newAttempted = existingMastery.questionsAttempted + 1;
			const newMastery = newCorrect / newAttempted;

			await db
				.update(topicMastery)
				.set({
					questionsCorrect: newCorrect,
					questionsAttempted: newAttempted,
					masteryLevel: newMastery.toFixed(2),
					lastPracticed: new Date(),
					consecutiveCorrect: existingMastery.consecutiveCorrect + 1,
					updatedAt: new Date(),
				})
				.where(eq(topicMastery.id, existingMastery.id));

			masteryImproved = newMastery > Number(existingMastery.masteryLevel);
		} else {
			await db.insert(topicMastery).values({
				userId: session.user.id,
				subjectId: defaultSubjectId,
				topic: mistake.topic,
				masteryLevel: '1.0',
				questionsAttempted: 1,
				questionsCorrect: 1,
				consecutiveCorrect: 1,
				lastPracticed: new Date(),
			});
			masteryImproved = true;
		}

		const existingStruggle = await db.query.conceptStruggles.findFirst({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.concept, mistake.topic)
			),
		});

		if (existingStruggle) {
			if (existingStruggle.struggleCount <= 1) {
				await db
					.update(conceptStruggles)
					.set({
						isResolved: true,
						updatedAt: new Date(),
					})
					.where(eq(conceptStruggles.id, existingStruggle.id));
			} else {
				await db
					.update(conceptStruggles)
					.set({
						struggleCount: existingStruggle.struggleCount - 1,
						updatedAt: new Date(),
					})
					.where(eq(conceptStruggles.id, existingStruggle.id));
			}
		}

		await db
			.update(questionAttempts)
			.set({
				isCorrect: true,
				attemptedAt: new Date(),
			})
			.where(
				and(
					eq(questionAttempts.userId, session.user.id),
					eq(questionAttempts.questionId, mistake.questionId)
				)
			);
	}

	revalidatePath('/dashboard');
	revalidatePath('/study-plan');

	return { success: true, masteryImproved };
}

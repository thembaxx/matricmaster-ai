'use server';

import { and, desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { calendarEvents, studyPlans, studySessions, topicMastery } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

export interface StudyPlanWithEvents {
	plan: typeof studyPlans.$inferSelect;
	events: (typeof calendarEvents.$inferSelect)[];
	progress: {
		totalTopics: number;
		completedTopics: number;
		masteryPercentage: number;
	};
}

export async function getStudyPlanWithEvents(
	planId: string
): Promise<{ success: boolean; error?: string; data?: StudyPlanWithEvents | null }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const plan = await db.query.studyPlans.findFirst({
			where: and(eq(studyPlans.id, planId), eq(studyPlans.userId, session.user.id)),
		});

		if (!plan) return { success: true, data: null };

		const events = await db.query.calendarEvents.findMany({
			where: and(
				eq(calendarEvents.studyPlanId, planId),
				eq(calendarEvents.userId, session.user.id)
			),
			orderBy: [desc(calendarEvents.startTime)],
		});

		const focusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
		const topics = Array.isArray(focusAreas) ? focusAreas : [];

		let completedTopics = 0;
		let totalMastery = 0;

		for (const topic of topics) {
			const mastery = await db.query.topicMastery.findFirst({
				where: and(eq(topicMastery.userId, session.user.id), eq(topicMastery.topic, topic)),
			});

			if (mastery && Number(mastery.masteryLevel) >= 0.8) {
				completedTopics++;
			}
			totalMastery += mastery ? Number(mastery.masteryLevel) : 0;
		}

		return {
			success: true,
			data: {
				plan,
				events,
				progress: {
					totalTopics: topics.length,
					completedTopics,
					masteryPercentage: topics.length > 0 ? (totalMastery / topics.length) * 100 : 0,
				},
			},
		};
	} catch (error) {
		console.error('getStudyPlanWithEvents failed:', error);
		return { success: false, error: 'Failed to get study plan' };
	}
}

export async function generateCalendarEventsFromPlan(
	planId: string
): Promise<{ success: boolean; error?: string; data?: (typeof calendarEvents.$inferInsert)[] }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const plan = await db.query.studyPlans.findFirst({
			where: and(eq(studyPlans.id, planId), eq(studyPlans.userId, session.user.id)),
		});

		if (!plan || !plan.targetExamDate) return { success: true, data: [] };

		const focusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
		if (!Array.isArray(focusAreas) || focusAreas.length === 0) return { success: true, data: [] };

		const examDate = new Date(plan.targetExamDate);
		const now = new Date();
		const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		const studyDaysPerWeek = 6;
		const totalStudySessions = Math.floor((daysUntilExam / 7) * studyDaysPerWeek);
		const sessionsPerTopic = Math.floor(totalStudySessions / focusAreas.length);

		const events: (typeof calendarEvents.$inferInsert)[] = [];

		for (let i = 0; i < focusAreas.length; i++) {
			const topic = focusAreas[i];

			for (let j = 0; j < sessionsPerTopic; j++) {
				const sessionDate = new Date(now);
				sessionDate.setDate(
					sessionDate.getDate() +
						Math.floor((i * sessionsPerTopic + j) * (daysUntilExam / totalStudySessions))
				);
				sessionDate.setHours(16 + (j % 3), 0, 0, 0);

				const endTime = new Date(sessionDate);
				endTime.setHours(endTime.getHours() + 1);

				events.push({
					userId: session.user.id,
					title: `Study: ${topic}`,
					description: `Focus session for ${topic}`,
					eventType: 'study',
					startTime: sessionDate,
					endTime,
					isAllDay: false,
					studyPlanId: planId,
					isCompleted: false,
				});
			}
		}

		if (events.length > 0) {
			await db.insert(calendarEvents).values(events);
		}

		return { success: true, data: events };
	} catch (error) {
		console.error('generateCalendarEventsFromPlan failed:', error);
		return { success: false, error: 'Failed to generate calendar events' };
	}
}

export async function trackStudySession(
	subjectId: number,
	topic: string,
	durationMinutes: number,
	questionsAttempted: number,
	correctAnswers: number
): Promise<{ success: boolean; error?: string; session?: typeof studySessions.$inferSelect }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const [studySession] = await db
			.insert(studySessions)
			.values({
				userId: session.user.id,
				subjectId,
				sessionType: 'practice',
				topic,
				durationMinutes,
				questionsAttempted,
				correctAnswers,
				marksEarned: correctAnswers * 2,
				completedAt: new Date(),
			})
			.returning();

		const mastery = await db.query.topicMastery.findFirst({
			where: and(
				eq(topicMastery.userId, session.user.id),
				eq(topicMastery.subjectId, subjectId),
				eq(topicMastery.topic, topic)
			),
		});

		const totalAttempted = (mastery?.questionsAttempted || 0) + questionsAttempted;
		const totalCorrect = (mastery?.questionsCorrect || 0) + correctAnswers;
		const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;

		if (mastery) {
			await db
				.update(topicMastery)
				.set({
					questionsAttempted: totalAttempted,
					questionsCorrect: totalCorrect,
					masteryLevel: accuracy.toFixed(2),
					lastPracticed: new Date(),
					consecutiveCorrect: accuracy >= 0.8 ? (mastery.consecutiveCorrect || 0) + 1 : 0,
					updatedAt: new Date(),
				})
				.where(eq(topicMastery.id, mastery.id));
		} else {
			await db.insert(topicMastery).values({
				userId: session.user.id,
				subjectId,
				topic,
				questionsAttempted: totalAttempted,
				questionsCorrect: totalCorrect,
				masteryLevel: accuracy.toFixed(2),
				lastPracticed: new Date(),
			});
		}

		return { success: true, session: studySession };
	} catch (error) {
		console.error('trackStudySession failed:', error);
		return { success: false, error: 'Failed to track study session' };
	}
}

export async function getStudyStats(): Promise<{
	success: boolean;
	error?: string;
	data?: {
		totalSessions: number;
		totalMinutes: number;
		totalQuestions: number;
		accuracy: number;
		averageSessionLength: number;
	};
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const recentSessions = await db.query.studySessions.findMany({
			where: eq(studySessions.userId, session.user.id),
			orderBy: [desc(studySessions.startedAt)],
			limit: 30,
		});

		const totalMinutes = recentSessions.reduce(
			(sum: number, s: typeof studySessions.$inferSelect) => sum + (s.durationMinutes || 0),
			0
		);
		const totalQuestions = recentSessions.reduce(
			(sum: number, s: typeof studySessions.$inferSelect) => sum + s.questionsAttempted,
			0
		);
		const totalCorrect = recentSessions.reduce(
			(sum: number, s: typeof studySessions.$inferSelect) => sum + s.correctAnswers,
			0
		);

		return {
			success: true,
			data: {
				totalSessions: recentSessions.length,
				totalMinutes,
				totalQuestions,
				accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
				averageSessionLength: recentSessions.length > 0 ? totalMinutes / recentSessions.length : 0,
			},
		};
	} catch (error) {
		console.error('getStudyStats failed:', error);
		return { success: false, error: 'Failed to get study stats' };
	}
}

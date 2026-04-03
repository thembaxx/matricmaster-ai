import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import { calendarEvents, questionAttempts, questions } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return await dbManager.getDb();
}

const STRUGGLE_THRESHOLD = 0.6;

export interface ScheduleChange {
	originalEventId: string;
	newDate: Date;
	reason: 'missed_goal' | 'struggling_topic';
}

export async function detectMissedGoals(userId: string): Promise<string[]> {
	const db = await getDb();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const missedEvents = await db
		.select({ id: calendarEvents.id })
		.from(calendarEvents)
		.where(
			and(
				eq(calendarEvents.userId, userId),
				eq(calendarEvents.isCompleted, false),
				lt(calendarEvents.startTime, today)
			)
		);

	return missedEvents.map((e: { id: string }) => e.id);
}

export async function detectStrugglingTopics(userId: string): Promise<string[]> {
	const db = await getDb();

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const topicScores = await db
		.select({
			topic: questions.topic,
			totalAttempts: sql<number>`count(*)::int`,
			correctAttempts: sql<number>`count(case when ${questionAttempts.isCorrect} = true then 1 end)::int`,
		})
		.from(questionAttempts)
		.innerJoin(questions, eq(questions.id, sql`${questionAttempts.questionId}::uuid`))
		.where(
			and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, sevenDaysAgo))
		)
		.groupBy(questions.topic);

	const strugglingTopics = topicScores
		.filter(
			(t: { totalAttempts: number; correctAttempts: number; topic: string }) =>
				t.totalAttempts >= 3 && t.correctAttempts / t.totalAttempts < STRUGGLE_THRESHOLD
		)
		.map((t: { topic: string }) => t.topic);

	return strugglingTopics;
}

export async function rescheduleMissedGoals(userId: string): Promise<ScheduleChange[]> {
	const missedGoalIds = await detectMissedGoals(userId);

	if (missedGoalIds.length === 0) return [];

	const db = await getDb();

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(9, 0, 0, 0);

	const changes: ScheduleChange[] = [];

	for (const eventId of missedGoalIds) {
		const event = await db
			.select()
			.from(calendarEvents)
			.where(eq(calendarEvents.id, eventId))
			.limit(1)
			.then((rows) => rows[0]);

		if (event) {
			const originalDuration = event.endTime.getTime() - event.startTime.getTime();

			await db
				.update(calendarEvents)
				.set({
					startTime: tomorrow,
					endTime: new Date(tomorrow.getTime() + originalDuration),
				})
				.where(eq(calendarEvents.id, eventId));

			changes.push({
				originalEventId: eventId,
				newDate: tomorrow,
				reason: 'missed_goal',
			});

			tomorrow.setDate(tomorrow.getDate() + 1);
		}
	}

	return changes;
}

export async function addExtraPracticeForStruggling(
	userId: string,
	topics: string[]
): Promise<number> {
	if (topics.length === 0) return 0;

	const db = await getDb();

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(14, 0, 0, 0);

	let added = 0;
	for (const topic of topics.slice(0, 3)) {
		await db.insert(calendarEvents).values({
			userId,
			title: `Extra Practice: ${topic}`,
			description: 'You struggled with this topic recently',
			startTime: tomorrow,
			endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000),
			eventType: 'practice',
			isCompleted: false,
		});

		tomorrow.setHours(tomorrow.getHours() + 2);
		added++;
	}

	return added;
}

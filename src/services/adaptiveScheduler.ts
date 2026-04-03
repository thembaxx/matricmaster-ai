'use server';

import { and, eq, lt, sql } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { calendarEvents, conceptStruggles, quizResults } from '@/lib/db/schema';

export interface ScheduleAdjustment {
	type: 'reschedule' | 'extra_practice' | 'reminder';
	originalEventId?: string;
	newDate?: Date;
	topic?: string;
	subject?: string;
	reason: string;
}

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function analyzeAndAdjust(userId: string): Promise<ScheduleAdjustment[]> {
	const db = await getDb();
	const adjustments: ScheduleAdjustment[] = [];
	const now = new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// 1. Find past study events that were not completed
	const missedEvents = await db
		.select({
			id: calendarEvents.id,
			title: calendarEvents.title,
			subjectId: calendarEvents.subjectId,
			startTime: calendarEvents.startTime,
			endTime: calendarEvents.endTime,
		})
		.from(calendarEvents)
		.where(
			and(
				eq(calendarEvents.userId, userId),
				eq(calendarEvents.isCompleted, false),
				lt(calendarEvents.startTime, today)
			)
		)
		.limit(10);

	// 2. Reschedule missed events to next available slots
	let nextSlot = new Date();
	nextSlot.setDate(nextSlot.getDate() + 1);
	nextSlot.setHours(9, 0, 0, 0);

	for (const event of missedEvents) {
		const originalDuration =
			new Date(event.endTime).getTime() - new Date(event.startTime).getTime();

		await db
			.update(calendarEvents)
			.set({
				startTime: nextSlot,
				endTime: new Date(nextSlot.getTime() + originalDuration),
				updatedAt: now,
			})
			.where(eq(calendarEvents.id, event.id));

		adjustments.push({
			type: 'reschedule',
			originalEventId: event.id,
			newDate: new Date(nextSlot),
			reason: `"${event.title}" was missed — moved to ${nextSlot.toLocaleDateString('en-ZA', { weekday: 'long', month: 'short', day: 'numeric' })}`,
		});

		nextSlot = new Date(nextSlot);
		nextSlot.setDate(nextSlot.getDate() + 1);
	}

	// 2b. Check recent quiz scores below 60% and flag for extra practice
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const lowScoreQuizzes = await db
		.select({
			quizId: quizResults.quizId,
			percentage: quizResults.percentage,
			completedAt: quizResults.completedAt,
		})
		.from(quizResults)
		.where(
			and(
				eq(quizResults.userId, userId),
				sql`${quizResults.percentage} < 60`,
				sql`${quizResults.completedAt} >= ${sevenDaysAgo}`
			)
		)
		.limit(5);

	for (const quiz of lowScoreQuizzes) {
		const pct = Number(quiz.percentage);
		adjustments.push({
			type: 'extra_practice',
			reason: `Quiz scored ${pct}% — below the 60% threshold. Consider extra practice on this topic.`,
		});
	}

	// 3. Find unresolved struggles and add extra practice
	const struggles = await db
		.select({
			concept: conceptStruggles.concept,
			struggleCount: conceptStruggles.struggleCount,
		})
		.from(conceptStruggles)
		.where(
			and(
				eq(conceptStruggles.userId, userId),
				eq(conceptStruggles.isResolved, false),
				sql`${conceptStruggles.struggleCount} >= 3`
			)
		)
		.limit(3);

	let practiceSlot = new Date();
	practiceSlot.setDate(practiceSlot.getDate() + 1);
	practiceSlot.setHours(14, 0, 0, 0);

	for (const struggle of struggles) {
		// Check if extra practice already exists for this topic this week
		const weekFromNow = new Date();
		weekFromNow.setDate(weekFromNow.getDate() + 7);

		const existingPractice = await db
			.select({ id: calendarEvents.id })
			.from(calendarEvents)
			.where(
				and(
					eq(calendarEvents.userId, userId),
					eq(calendarEvents.eventType, 'practice'),
					sql`${calendarEvents.title} ILIKE ${`%${struggle.concept}%`}`,
					sql`${calendarEvents.startTime} > ${now}`,
					sql`${calendarEvents.startTime} < ${weekFromNow}`
				)
			)
			.limit(1);

		if (existingPractice.length === 0) {
			await db.insert(calendarEvents).values({
				userId,
				title: `Extra Practice: ${struggle.concept}`,
				description: `You struggled with "${struggle.concept}" ${struggle.struggleCount} times. Let's work on it!`,
				startTime: practiceSlot,
				endTime: new Date(practiceSlot.getTime() + 30 * 60 * 1000),
				eventType: 'practice',
				isCompleted: false,
			});

			adjustments.push({
				type: 'extra_practice',
				topic: struggle.concept,
				newDate: new Date(practiceSlot),
				reason: `Extra practice added for "${struggle.concept}" — you struggled with it ${struggle.struggleCount} times`,
			});

			practiceSlot = new Date(practiceSlot);
			practiceSlot.setHours(practiceSlot.getHours() + 2);
		}
	}

	// 4. Generate reminders for upcoming study sessions
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	const dayAfter = new Date(tomorrow);
	dayAfter.setDate(dayAfter.getDate() + 1);

	const tomorrowEvents = await db
		.select({
			id: calendarEvents.id,
			title: calendarEvents.title,
			startTime: calendarEvents.startTime,
		})
		.from(calendarEvents)
		.where(
			and(
				eq(calendarEvents.userId, userId),
				eq(calendarEvents.isCompleted, false),
				sql`${calendarEvents.startTime} >= ${tomorrow}`,
				sql`${calendarEvents.startTime} < ${dayAfter}`
			)
		);

	for (const event of tomorrowEvents) {
		adjustments.push({
			type: 'reminder',
			originalEventId: event.id,
			reason: `Reminder: "${event.title}" is scheduled for tomorrow`,
		});
	}

	return adjustments;
}

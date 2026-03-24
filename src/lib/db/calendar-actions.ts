'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './auth-utils';
import { getDb } from './index';
import { calendarEvents } from './schema';

// Helper to parse JSON string to array
function parseJsonField<T>(value: unknown, defaultValue: T): T {
	if (value === null || value === undefined) return defaultValue;
	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch (error) {
			console.warn('Failed to parse JSON field:', error);
			return defaultValue;
		}
	}
	if (Array.isArray(value)) return value as T;
	return defaultValue;
}

// Helper to stringify array to JSON string
function stringifyField(value: unknown): string {
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return JSON.stringify(value);
	return JSON.stringify(value);
}

/**
 * Create a calendar event
 * Uses session-based authentication to prevent IDOR
 */
export async function createCalendarEvent(
	_userId: string,
	data: {
		title: string;
		description?: string;
		eventType: string;
		subjectId?: number;
		startTime: Date;
		endTime: Date;
		isAllDay?: boolean;
		location?: string;
		reminderMinutes?: number[];
		recurrenceRule?: string;
		examId?: string;
		lessonId?: number;
		studyPlanId?: string;
	}
) {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const db = await getDb();
		const [event] = await db
			.insert(calendarEvents)
			.values({
				userId: activeUserId,
				title: data.title,
				description: data.description,
				eventType: data.eventType,
				subjectId: data.subjectId,
				startTime: data.startTime,
				endTime: data.endTime,
				isAllDay: data.isAllDay ?? false,
				location: data.location,
				reminderMinutes: data.reminderMinutes ? stringifyField(data.reminderMinutes) : undefined,
				recurrenceRule: data.recurrenceRule,
				examId: data.examId,
				lessonId: data.lessonId,
				studyPlanId: data.studyPlanId,
			})
			.returning();
		return { success: true, event };
	} catch (error) {
		console.debug('[Calendar] Error creating event:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get user's calendar events
 * Verifies identity via session to prevent IDOR
 */
export async function getCalendarEvents(
	_userId: string,
	options?: {
		startDate?: Date;
		endDate?: Date;
		eventType?: string;
	}
) {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const db = await getDb();
		const query = db.select().from(calendarEvents).where(eq(calendarEvents.userId, activeUserId));

		// Note: Drizzle doesn't support complex where clauses easily in one call
		// We'll filter in JavaScript for date ranges
		const events = await query;

		let filtered = events;

		// Filter by date range
		if (options?.startDate) {
			filtered = filtered.filter(
				(e: (typeof filtered)[number]) => new Date(e.startTime) >= options.startDate!
			);
		}
		if (options?.endDate) {
			filtered = filtered.filter(
				(e: (typeof filtered)[number]) => new Date(e.startTime) <= options.endDate!
			);
		}

		// Filter by event type
		if (options?.eventType) {
			filtered = filtered.filter(
				(e: (typeof filtered)[number]) => e.eventType === options.eventType
			);
		}

		// Parse JSON fields
		return filtered
			.sort(
				(a: (typeof filtered)[number], b: (typeof filtered)[number]) =>
					new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
			)
			.map((e: (typeof filtered)[number]) => ({
				...e,
				reminderMinutes: parseJsonField<number[]>(e.reminderMinutes, []),
			}));
	} catch (error) {
		console.debug('[Calendar] Error getting events:', error);
		return [];
	}
}

/**
 * Get a single calendar event
 * Verifies ownership via session to prevent IDOR
 */
export async function getCalendarEvent(eventId: string, _userId: string) {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const db = await getDb();
		const [event] = await db
			.select()
			.from(calendarEvents)
			.where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, activeUserId)))
			.limit(1);

		if (!event) return null;

		return {
			...event,
			reminderMinutes: parseJsonField<number[]>(event.reminderMinutes, []),
		};
	} catch (error) {
		console.debug('[Calendar] Error getting event:', error);
		return null;
	}
}

/**
 * Update a calendar event
 * Verifies ownership via session to prevent IDOR
 */
export async function updateCalendarEvent(
	eventId: string,
	_userId: string,
	data: {
		title?: string;
		description?: string;
		eventType?: string;
		subjectId?: number;
		startTime?: Date;
		endTime?: Date;
		isAllDay?: boolean;
		location?: string;
		reminderMinutes?: number[];
		recurrenceRule?: string;
		isCompleted?: boolean;
	}
) {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const db = await getDb();
		const [updated] = await db
			.update(calendarEvents)
			.set({
				title: data.title,
				description: data.description,
				eventType: data.eventType,
				subjectId: data.subjectId,
				startTime: data.startTime,
				endTime: data.endTime,
				isAllDay: data.isAllDay,
				location: data.location,
				reminderMinutes: data.reminderMinutes ? stringifyField(data.reminderMinutes) : undefined,
				recurrenceRule: data.recurrenceRule,
				isCompleted: data.isCompleted,
				updatedAt: new Date(),
			})
			.where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, activeUserId)))
			.returning();
		return { success: true, event: updated };
	} catch (error) {
		console.debug('[Calendar] Error updating event:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Delete a calendar event
 * Verifies ownership via session to prevent IDOR
 */
export async function deleteCalendarEvent(eventId: string, _userId: string) {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const db = await getDb();
		await db
			.delete(calendarEvents)
			.where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, activeUserId)));
		return { success: true };
	} catch (error) {
		console.debug('[Calendar] Error deleting event:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Mark event as completed
 */
export async function completeCalendarEvent(eventId: string, _userId: string) {
	return updateCalendarEvent(eventId, _userId, { isCompleted: true });
}

/**
 * Get upcoming events (next 7 days)
 * Verifies identity via session to prevent IDOR
 */
export async function getUpcomingEvents(_userId: string, days = 7) {
	const now = new Date();
	const endDate = new Date();
	endDate.setDate(endDate.getDate() + days);

	return getCalendarEvents(_userId, { startDate: now, endDate });
}

/**
 * Get today's events
 * Verifies identity via session to prevent IDOR
 */
export async function getTodayEvents(_userId: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return getCalendarEvents(_userId, { startDate: today, endDate: tomorrow });
}

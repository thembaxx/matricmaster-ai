'use server';

import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { calendarEvents, studyPlans, userProgress, whatsappPreferences } from '@/lib/db/schema';

async function getDatabase() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function sendUpcomingStudyReminders(): Promise<{ sent: number; errors: string[] }> {
	const result = { sent: 0, errors: [] as string[] };

	try {
		const db = await getDatabase();
		const now = new Date();
		const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000);

		const upcomingSessions = await db
			.select({
				sessionId: calendarEvents.id,
				userId: calendarEvents.userId,
				title: calendarEvents.title,
				subjectName: calendarEvents.eventType,
				scheduledDate: calendarEvents.startTime,
				duration: calendarEvents.endTime,
				phoneNumber: whatsappPreferences.phoneNumber,
				studyRemindersEnabled: whatsappPreferences.isOptedIn,
			})
			.from(calendarEvents)
			.innerJoin(studyPlans, eq(calendarEvents.studyPlanId, studyPlans.id))
			.innerJoin(whatsappPreferences, eq(calendarEvents.userId, whatsappPreferences.userId))
			.where(
				and(
					eq(studyPlans.isActive, true),
					eq(whatsappPreferences.isOptedIn, true),
					eq(whatsappPreferences.isVerified, true),
					gte(calendarEvents.startTime, now),
					lte(calendarEvents.startTime, reminderWindow),
					isNull(calendarEvents.isCompleted)
				)
			)
			.orderBy(desc(calendarEvents.startTime));

		for (const session of upcomingSessions) {
			try {
				const minutesUntil = Math.round(
					(new Date(session.scheduledDate).getTime() - now.getTime()) / (1000 * 60)
				);

				console.debug(`Would send WhatsApp reminder to ${session.phoneNumber}:`, {
					topic: session.title,
					subject: session.subjectName,
					minutesUntil,
					duration: session.duration,
				});

				result.sent++;
			} catch (error) {
				result.errors.push(`Failed to send to ${session.phoneNumber}: ${error}`);
			}
		}
	} catch (error) {
		result.errors.push(`Database error: ${error}`);
	}

	return result;
}

export async function getDailyProgressSummary(userId: string, date: Date) {
	const db = await getDatabase();
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(startOfDay);
	endOfDay.setDate(endOfDay.getDate() + 1);

	const sessions = await db
		.select({
			id: calendarEvents.id,
			title: calendarEvents.title,
			subjectName: calendarEvents.eventType,
			startTime: calendarEvents.startTime,
			endTime: calendarEvents.endTime,
			isCompleted: calendarEvents.isCompleted,
		})
		.from(calendarEvents)
		.where(
			and(
				eq(calendarEvents.userId, userId),
				gte(calendarEvents.startTime, startOfDay),
				lte(calendarEvents.startTime, endOfDay)
			)
		);

	const completedSessions = sessions.filter((s) => s.isCompleted);
	const totalMinutes = completedSessions.reduce((sum, s) => {
		if (s.startTime && s.endTime) {
			return (
				sum + Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000)
			);
		}
		return sum;
	}, 0);

	const subjects = [...new Set(sessions.map((s) => s.subjectName).filter(Boolean))];

	const [progress] = await db
		.select({ streakDays: userProgress.streakDays })
		.from(userProgress)
		.where(eq(userProgress.userId, userId))
		.limit(1);

	return {
		sessionsCompleted: completedSessions.length,
		totalSessions: sessions.length,
		totalMinutes,
		subjectsStudied: subjects,
		streak: progress?.streakDays || 0,
	};
}

export async function rescheduleSessionViaWhatsApp(
	userId: string,
	sessionId: string,
	newDate: Date
): Promise<{ success: boolean; error?: string }> {
	try {
		const db = await getDatabase();

		const [updated] = await db
			.update(calendarEvents)
			.set({
				startTime: newDate,
				updatedAt: new Date(),
			})
			.where(and(eq(calendarEvents.id, sessionId), eq(calendarEvents.userId, userId)))
			.returning();

		return { success: !!updated };
	} catch (error) {
		return { success: false, error: String(error) };
	}
}

export async function completeSessionViaWhatsApp(
	userId: string,
	sessionId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const db = await getDatabase();

		await db
			.update(calendarEvents)
			.set({
				isCompleted: true,
				updatedAt: new Date(),
			})
			.where(and(eq(calendarEvents.id, sessionId), eq(calendarEvents.userId, userId)));

		return { success: true };
	} catch (error) {
		return { success: false, error: String(error) };
	}
}

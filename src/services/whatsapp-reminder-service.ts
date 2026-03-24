import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { whatsappPreferences } from '@/lib/db/schema';
import {
	sendAchievementNotification,
	sendBuddyScoreNotification,
	sendDailyTip,
	sendStudyReminder,
} from './whatsapp-service';

export type ReminderType = 'study_reminder' | 'achievement_share' | 'buddy_update' | 'daily_tip';

export interface ScheduledReminder {
	id: string;
	userId: string;
	type: ReminderType;
	scheduledFor: Date;
	data?: Record<string, unknown>;
}

interface UserWithPhone {
	userId: string;
	phoneNumber: string;
	notificationTypes: string[];
	quietHoursStart: string | null;
	quietHoursEnd: string | null;
}

const DAILY_TIPS = [
	'Break your study sessions into 25-minute chunks with 5-minute breaks using the Pomodoro technique.',
	'Teaching someone else what you learned helps solidify the knowledge in your own mind.',
	'Spaced repetition works best! Review topics at increasing intervals: 1 day, 3 days, 1 week.',
	'Stay hydrated while studying. Even mild dehydration can affect concentration and memory.',
	'Get enough sleep! Your brain consolidates learning during sleep, especially REM sleep.',
	'Switch between different subjects to keep your brain engaged and prevent burnout.',
	'Practice past exam papers under timed conditions to build exam stamina.',
	'Use mnemonics for difficult concepts - create memorable phrases or stories.',
	'Active recall is more effective than passive re-reading. Test yourself often!',
	'Create a study space with minimal distractions. Your brain will associate it with learning.',
];

function getRandomTip(): string {
	return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
}

function getNextScheduledTime(
	frequency: 'daily' | 'weekly' | 'custom',
	hour: number,
	minute: number,
	dayOfWeek?: number
): Date {
	const now = new Date();
	const next = new Date();
	next.setHours(hour, minute, 0, 0);

	if (frequency === 'daily') {
		if (next <= now) next.setDate(next.getDate() + 1);
	} else if (frequency === 'weekly') {
		const targetDay = dayOfWeek ?? 1;
		const currentDay = now.getDay();
		const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
		next.setDate(next.getDate() + daysUntil);
		if (next <= now) next.setDate(next.getDate() + 7);
	}

	return next;
}

export async function scheduleStudyReminder(
	userId: string,
	phoneNumber: string,
	frequency: 'daily' | 'weekly' | 'custom',
	hour = 9,
	minute = 0,
	dayOfWeek?: number
): Promise<void> {
	getNextScheduledTime(frequency, hour, minute, dayOfWeek);
	const dbClient = await db();

	await dbClient
		.insert(whatsappPreferences)
		.values({
			userId,
			phoneNumber,
			reminderFrequency: frequency,
			reminderTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
			reminderDays: dayOfWeek?.toString() || null,
			notificationTypes: ['study_reminder'],
		})
		.onConflictDoUpdate({
			target: whatsappPreferences.userId,
			set: {
				reminderFrequency: frequency,
				reminderTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
				reminderDays: dayOfWeek?.toString() || null,
				updatedAt: new Date(),
			},
		});
}

export async function cancelReminder(userId: string): Promise<void> {
	const dbClient = await db();
	await dbClient
		.update(whatsappPreferences)
		.set({
			notificationTypes: [],
			updatedAt: new Date(),
		})
		.where(eq(whatsappPreferences.userId, userId));
}

export async function updateReminderPreferences(
	userId: string,
	preferences: {
		frequency?: 'daily' | 'weekly' | 'custom';
		hour?: number;
		minute?: number;
		dayOfWeek?: number;
		notificationTypes?: string[];
		quietHoursStart?: string;
		quietHoursEnd?: string;
	}
): Promise<void> {
	const updates: Record<string, unknown> = { updatedAt: new Date() };

	if (preferences.frequency !== undefined) {
		updates.reminderFrequency = preferences.frequency;
	}
	if (preferences.hour !== undefined && preferences.minute !== undefined) {
		updates.reminderTime = `${preferences.hour.toString().padStart(2, '0')}:${preferences.minute.toString().padStart(2, '0')}`;
	}
	if (preferences.dayOfWeek !== undefined) {
		updates.reminderDays = preferences.dayOfWeek.toString();
	}
	if (preferences.notificationTypes !== undefined) {
		updates.notificationTypes = preferences.notificationTypes;
	}
	if (preferences.quietHoursStart !== undefined) {
		updates.quietHoursStart = preferences.quietHoursStart;
	}
	if (preferences.quietHoursEnd !== undefined) {
		updates.quietHoursEnd = preferences.quietHoursEnd;
	}

	const dbClient = await db();
	await dbClient
		.update(whatsappPreferences)
		.set(updates)
		.where(eq(whatsappPreferences.userId, userId));
}

export async function processStudyReminders(): Promise<{
	processed: number;
	sent: number;
	failed: number;
}> {
	const now = new Date();
	const currentHour = now.getHours().toString().padStart(2, '0');
	const currentMinute = now.getMinutes().toString().padStart(2, '0');
	const currentTime = `${currentHour}:${currentMinute}`;
	const currentDay = now.getDay().toString();
	const dbClient = await db();

	const usersToNotify = await dbClient
		.select()
		.from(whatsappPreferences)
		.where(
			and(
				sql`${whatsappPreferences.notificationTypes} @> ${['study_reminder']}`,
				sql`${whatsappPreferences.isVerified} = true`,
				sql`${whatsappPreferences.isOptedIn} = true`,
				sql`${whatsappPreferences.reminderTime} = ${currentTime}`,
				sql`${whatsappPreferences.reminderDays} IS NULL OR ${whatsappPreferences.reminderDays} = ${currentDay}`
			)
		);

	let sent = 0;
	let failed = 0;

	for (const user of usersToNotify) {
		try {
			await sendStudyReminder(user.phoneNumber, user.userId);
			sent++;
		} catch {
			failed++;
		}
	}

	return { processed: usersToNotify.length, sent, failed };
}

export async function processDailyTips(): Promise<{ sent: number; failed: number }> {
	const tip = getRandomTip();
	const dayOfWeek = new Date().getDay();

	if (dayOfWeek !== 0) return { sent: 0, failed: 0 };
	const dbClient = await db();

	const usersToNotify = await dbClient
		.select()
		.from(whatsappPreferences)
		.where(
			and(
				sql`${whatsappPreferences.notificationTypes} @> ${['daily_tip']}`,
				sql`${whatsappPreferences.isVerified} = true`,
				sql`${whatsappPreferences.isOptedIn} = true`
			)
		);

	let sent = 0;
	let failed = 0;

	for (const user of usersToNotify) {
		try {
			const success = await sendDailyTip(user.phoneNumber, tip);
			if (success) sent++;
			else failed++;
		} catch {
			failed++;
		}
	}

	return { sent, failed };
}

export async function sendAchievementToBuddies(
	achieverId: string,
	achievement: { title: string; description: string; icon?: string }
): Promise<void> {
	const dbClient = await db();
	const buddies = await dbClient
		.select({
			buddyId: whatsappPreferences.userId,
			phoneNumber: whatsappPreferences.phoneNumber,
		})
		.from(whatsappPreferences)
		.innerJoin(sql`study_buddies`, sql`study_buddies.user_id_2 = ${whatsappPreferences.userId}`)
		.where(
			and(
				sql`study_buddies.user_id_1 = ${achieverId}`,
				sql`${whatsappPreferences.notificationTypes} @> ${['achievement_share']}`,
				sql`${whatsappPreferences.isVerified} = true`
			)
		);

	for (const buddy of buddies) {
		if (buddy.phoneNumber) {
			await sendAchievementNotification(buddy.phoneNumber, achievement);
		}
	}
}

export async function sendBuddyScoreUpdate(
	loserId: string,
	buddyName: string,
	score: number,
	topic?: string
): Promise<void> {
	const dbClient = await db();
	const loserPrefs = await dbClient.query.whatsappPreferences.findFirst({
		where: eq(whatsappPreferences.userId, loserId),
	});

	if (
		loserPrefs?.phoneNumber &&
		loserPrefs.isVerified &&
		loserPrefs.notificationTypes?.includes('buddy_update')
	) {
		await sendBuddyScoreNotification(loserPrefs.phoneNumber, buddyName, score, topic);
	}
}

export async function getUserPreferences(userId: string): Promise<UserWithPhone | null> {
	const dbClient = await db();
	const prefs = await dbClient.query.whatsappPreferences.findFirst({
		where: eq(whatsappPreferences.userId, userId),
	});

	if (!prefs) return null;

	return {
		userId: prefs.userId,
		phoneNumber: prefs.phoneNumber,
		notificationTypes: prefs.notificationTypes || [],
		quietHoursStart: prefs.quietHoursStart,
		quietHoursEnd: prefs.quietHoursEnd,
	};
}

export async function verifyPhoneNumber(userId: string, code: string): Promise<boolean> {
	const dbClient = await db();
	const prefs = await dbClient.query.whatsappPreferences.findFirst({
		where: and(
			eq(whatsappPreferences.userId, userId),
			eq(whatsappPreferences.verificationCode, code)
		),
	});

	if (!prefs) return false;

	const isExpired = prefs.verificationExpires && new Date(prefs.verificationExpires) < new Date();
	if (isExpired) return false;

	await dbClient
		.update(whatsappPreferences)
		.set({
			isVerified: true,
			verificationCode: null,
			verificationExpires: null,
			updatedAt: new Date(),
		})
		.where(eq(whatsappPreferences.userId, userId));

	return true;
}

export async function generateVerificationCode(userId: string): Promise<string | null> {
	const dbClient = await db();
	const prefs = await dbClient.query.whatsappPreferences.findFirst({
		where: eq(whatsappPreferences.userId, userId),
	});

	if (!prefs?.phoneNumber) return null;

	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expires = new Date(Date.now() + 10 * 60 * 1000);

	await dbClient
		.update(whatsappPreferences)
		.set({
			verificationCode: code,
			verificationExpires: expires,
			updatedAt: new Date(),
		})
		.where(eq(whatsappPreferences.userId, userId));

	return code;
}

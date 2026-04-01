/**
 * Scheduled & Adaptive WhatsApp Notification Service
 *
 * Purpose: Manages scheduled reminders, adaptive triggers, and intelligent notification
 * delivery based on user state (progress, burnout risk, energy patterns, gamification, etc.).
 *
 * This is the high-level notification orchestration layer. It decides WHEN and WHY to send
 * messages, then delegates actual message delivery to whatsapp-service.ts.
 *
 * For the core WhatsApp API client (send/receive, webhook handling, rate limiting),
 * see: whatsapp-service.ts
 */

import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { whatsappPreferences } from '@/lib/db/schema';
import {
	rateLimitedSend,
	sendAchievementNotification,
	sendBuddyScoreNotification,
	sendDailyTip,
	sendStudyReminder,
} from './whatsapp-service';

export type ReminderType =
	| 'study_reminder'
	| 'achievement_share'
	| 'buddy_update'
	| 'daily_tip'
	| 'weak_topic'
	| 'burnout'
	| 'energy'
	| 'gamification'
	| 'buddy_challenge'
	| 'offline_sync';

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

async function checkNotificationPermission(
	userId: string,
	notificationType: string
): Promise<{ allowed: boolean; phoneNumber: string | null }> {
	const dbClient = await db();
	const prefs = await dbClient.query.whatsappPreferences.findFirst({
		where: eq(whatsappPreferences.userId, userId),
	});

	if (!prefs) return { allowed: false, phoneNumber: null };
	if (!prefs.isOptedIn || !prefs.isVerified) return { allowed: false, phoneNumber: null };
	if (!prefs.notificationTypes?.includes(notificationType))
		return { allowed: false, phoneNumber: null };
	if (!prefs.phoneNumber) return { allowed: false, phoneNumber: null };

	const now = new Date();
	if (prefs.quietHoursStart && prefs.quietHoursEnd) {
		const currentHour = now.getHours();
		const startHour = Number.parseInt(prefs.quietHoursStart.split(':')[0], 10);
		const endHour = Number.parseInt(prefs.quietHoursEnd.split(':')[0], 10);
		if (startHour <= endHour) {
			if (currentHour >= startHour && currentHour < endHour) {
				return { allowed: false, phoneNumber: prefs.phoneNumber };
			}
		} else {
			if (currentHour >= startHour || currentHour < endHour) {
				return { allowed: false, phoneNumber: prefs.phoneNumber };
			}
		}
	}

	return { allowed: true, phoneNumber: prefs.phoneNumber };
}

export async function sendWeakTopicAlert(
	userId: string,
	weakTopics: Array<{ topic: string; subject: string; accuracy: number }>
): Promise<boolean> {
	const permission = await checkNotificationPermission(userId, 'study_reminder');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Weak topic alert blocked for user ${userId}: permission denied`);
		return false;
	}

	const topWeak = weakTopics.slice(0, 3);
	if (topWeak.length === 0) return false;

	const topicsList = topWeak
		.map((t) => `• ${t.subject}: ${t.topic} (${Math.round(t.accuracy)}%)`)
		.join('\n');

	const message = `📚 Your Lumni Study Report

These topics need attention:
${topicsList}

💡 Tip: Start with easier questions to build confidence, then work up.

Practice now: lumni.ai/practice`;

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(`Weak topic alert sent to user ${userId}: ${success}`);
		return success;
	} catch (error) {
		console.error(`Failed to send weak topic alert to user ${userId}:`, error);
		return false;
	}
}

export async function sendBurnoutCheckIn(
	userId: string,
	burnoutRisk: { risk: 'low' | 'medium' | 'high'; factors: string[]; recommendations: string[] }
): Promise<boolean> {
	if (burnoutRisk.risk === 'low') return false;

	const permission = await checkNotificationPermission(userId, 'study_reminder');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Burnout check-in blocked for user ${userId}: permission denied`);
		return false;
	}

	const isHigh = burnoutRisk.risk === 'high';
	const message = isHigh
		? `⚠️ Wellness Check-In

We noticed you've been studying very hard. Your wellbeing matters more than any exam.

${burnoutRisk.recommendations.slice(0, 2).join('\n')}

Take a break today. You've earned it. 💙

lumni.ai`
		: `💙 Quick Check-In

You've been putting in great effort! Remember to pace yourself.

${burnoutRisk.recommendations[0] || 'Take short breaks between study sessions.'}

Keep going, but don't forget to rest!

lumni.ai`;

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(`Burnout check-in sent to user ${userId} (risk: ${burnoutRisk.risk}): ${success}`);
		return success;
	} catch (error) {
		console.error(`Failed to send burnout check-in to user ${userId}:`, error);
		return false;
	}
}

export async function sendEnergyOptimizedSuggestion(
	userId: string,
	energyPattern: { peakHour: number; peakEnergy: number; suggestedTime: string }
): Promise<boolean> {
	const permission = await checkNotificationPermission(userId, 'study_reminder');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Energy suggestion blocked for user ${userId}: permission denied`);
		return false;
	}

	const timeOfDay =
		energyPattern.peakHour >= 5 && energyPattern.peakHour < 12
			? 'morning'
			: energyPattern.peakHour >= 12 && energyPattern.peakHour < 17
				? 'afternoon'
				: 'evening';

	const message = `⚡ Your Best Study Time

Your energy peaks in the ${timeOfDay} around ${energyPattern.suggestedTime}.

This is your ideal window for tackling difficult topics. Save easier review for lower-energy times.

Peak energy detected: ${Math.round(energyPattern.peakEnergy)}%

lumni.ai/planner`;

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(`Energy suggestion sent to user ${userId}: ${success}`);
		return success;
	} catch (error) {
		console.error(`Failed to send energy suggestion to user ${userId}:`, error);
		return false;
	}
}

export async function sendGamificationUpdate(
	userId: string,
	streak: number,
	level: number
): Promise<boolean> {
	const permission = await checkNotificationPermission(userId, 'gamification');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Gamification update blocked for user ${userId}: permission denied`);
		return false;
	}

	let message: string;
	if (streak === 0) {
		message = `🔥 Your streak has ended!

Don't worry — start fresh today. Even 5 minutes of practice counts.

lumni.ai/practice`;
	} else if (streak % 7 === 0) {
		message = `🔥 ${streak} Day Streak!

Incredible consistency! You've studied for ${streak} days straight.

Level: ${level}

Keep the momentum going!

lumni.ai`;
	} else if (streak === 6) {
		message = `🔥 6 Days! One more day to hit a week!

Don't break your streak — do a quick quiz today.

Level: ${level}

lumni.ai/practice`;
	} else {
		message = `🔥 ${streak} Day Streak

Level: ${level}

Keep it up! Every question counts.

lumni.ai`;
	}

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(
			`Gamification update sent to user ${userId} (streak: ${streak}, level: ${level}): ${success}`
		);
		return success;
	} catch (error) {
		console.error(`Failed to send gamification update to user ${userId}:`, error);
		return false;
	}
}

export async function sendBuddyChallengeInvite(
	userId: string,
	buddyName: string
): Promise<boolean> {
	const permission = await checkNotificationPermission(userId, 'buddy_update');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Buddy challenge invite blocked for user ${userId}: permission denied`);
		return false;
	}

	const message = `🏃 Challenge from ${buddyName}!

${buddyName} has challenged you to a study duel!

Head to lumni.ai to accept and see who scores higher.

May the best student win!`;

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(`Buddy challenge invite sent to user ${userId} from ${buddyName}: ${success}`);
		return success;
	} catch (error) {
		console.error(`Failed to send buddy challenge invite to user ${userId}:`, error);
		return false;
	}
}

export async function sendOfflineSyncReminder(userId: string): Promise<boolean> {
	const permission = await checkNotificationPermission(userId, 'study_reminder');
	if (!permission.allowed || !permission.phoneNumber) {
		console.log(`Offline sync reminder blocked for user ${userId}: permission denied`);
		return false;
	}

	const message = `📱 Pending Sync Reminder

You have unsaved study progress waiting to sync.

Connect to the internet and open the app to sync your data — don't lose your hard work!

lumni.ai`;

	try {
		const success = await rateLimitedSend(permission.phoneNumber, message);
		console.log(`Offline sync reminder sent to user ${userId}: ${success}`);
		return success;
	} catch (error) {
		console.error(`Failed to send offline sync reminder to user ${userId}:`, error);
		return false;
	}
}

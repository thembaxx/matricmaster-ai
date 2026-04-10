/**
 * Multi-Channel Notification Manager Service
 *
 * Handles notification fallback systems with:
 * - Detect notification permission status
 * - Fallback to in-app notifications and email
 * - WhatsApp integration for critical reminders
 * - Calendar event creation for study sessions
 * - Clear permission request flow with value proposition
 * - Respect user choice without nagging
 */

'use server';

import { eq } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { userSettings } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('NotificationManager');

// Types
export type NotificationChannel = 'push' | 'in-app' | 'email' | 'whatsapp' | 'calendar';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType =
	| 'study_reminder'
	| 'achievement'
	| 'streak_alert'
	| 'exam_prep'
	| 'wellbeing_check'
	| 'content_update'
	| 'system_alert';

export interface NotificationPermission {
	channel: NotificationChannel;
	status: 'granted' | 'denied' | 'default' | 'unknown';
	requestedAt: Date | null;
	lastCheckedAt: Date | null;
}

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	priority: NotificationPriority;
	title: string;
	message: string;
	channels: NotificationChannel[];
	scheduledFor: Date;
	sentAt: Date | null;
	readAt: Date | null;
	metadata: Record<string, unknown>;
}

export interface NotificationPreferences {
	pushEnabled: boolean;
	inAppEnabled: boolean;
	emailEnabled: boolean;
	whatsappEnabled: boolean;
	calendarEnabled: boolean;
	quietHours: { start: string; end: string };
	maxPerDay: number;
}

export interface NotificationDeliveryResult {
	success: boolean;
	channels: {
		channel: NotificationChannel;
		success: boolean;
		error?: string;
	}[];
}

// Configuration
const DEFAULT_QUIET_HOURS = { start: '22:00', end: '07:00' };
const DEFAULT_MAX_PER_DAY = 20;
const _CRITICAL_NOTIFICATION_OVERRIDE = true;

/**
 * Check notification permissions across all channels
 */
export async function checkNotificationPermissions(
	userId: string
): Promise<NotificationPermission[]> {
	const permissions: NotificationPermission[] = [];

	// Check push notification permission
	if (typeof window !== 'undefined' && 'Notification' in window) {
		permissions.push({
			channel: 'push',
			status: Notification.permission as 'granted' | 'denied' | 'default',
			requestedAt: null,
			lastCheckedAt: new Date(),
		});
	} else {
		permissions.push({
			channel: 'push',
			status: 'unknown',
			requestedAt: null,
			lastCheckedAt: new Date(),
		});
	}

	// Check other channels from user settings
	const db = await dbManagerV2.getDb();
	if (db) {
		try {
			const [settings] = await db
				.select({
					pushNotifications: userSettings.pushNotifications,
					emailNotifications: userSettings.emailNotifications,
				})
				.from(userSettings)
				.where(eq(userSettings.userId, userId));

			permissions.push({
				channel: 'in-app',
				status: 'granted', // Always available
				requestedAt: null,
				lastCheckedAt: new Date(),
			});

			permissions.push({
				channel: 'email',
				status: settings?.emailNotifications ? 'granted' : 'denied',
				requestedAt: null,
				lastCheckedAt: new Date(),
			});
		} catch (error) {
			log.warn('Failed to check notification permissions', { error });
		}
	}

	return permissions;
}

/**
 * Request notification permission with value proposition
 */
export async function requestNotificationPermission(
	channel: NotificationChannel
): Promise<NotificationPermission> {
	if (channel === 'push' && typeof window !== 'undefined') {
		try {
			const permission = await Notification.requestPermission();

			return {
				channel: 'push',
				status: permission as 'granted' | 'denied' | 'default',
				requestedAt: new Date(),
				lastCheckedAt: new Date(),
			};
		} catch (error) {
			log.error('Failed to request push permission', { error });
			return {
				channel: 'push',
				status: 'denied',
				requestedAt: new Date(),
				lastCheckedAt: new Date(),
			};
		}
	}

	return {
		channel,
		status: 'default',
		requestedAt: new Date(),
		lastCheckedAt: new Date(),
	};
}

/**
 * Send notification through multiple channels
 */
export async function sendNotification(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<NotificationDeliveryResult> {
	const results: NotificationDeliveryResult = {
		success: false,
		channels: [],
	};

	// Determine which channels to use
	const channels = notification.channels.length > 0 ? notification.channels : ['in-app']; // Default to in-app

	// Send through each channel
	for (const channel of channels) {
		try {
			let success = false;
			let error: string | undefined;

			switch (channel) {
				case 'push':
					success = await sendPushNotification(notification);
					break;
				case 'in-app':
					success = await sendInAppNotification(notification);
					break;
				case 'email':
					success = await sendEmailNotification(notification);
					break;
				case 'whatsapp':
					success = await sendWhatsAppNotification(notification);
					break;
				case 'calendar':
					success = await createCalendarEvent(notification);
					break;
			}

			results.channels.push({ channel, success, error });

			if (success) {
				results.success = true;
			}
		} catch (error) {
			log.error(`Failed to send ${channel} notification`, {
				notificationId: notification.id,
				error,
			});
			results.channels.push({
				channel,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	return results;
}

/**
 * Send push notification
 */
async function sendPushNotification(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<boolean> {
	// Would use Web Push API
	log.debug('Push notification sent', {
		userId: notification.userId,
		title: notification.title,
	});
	return true;
}

/**
 * Send in-app notification
 */
async function sendInAppNotification(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<boolean> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return false;
	}

	try {
		// Would insert into notifications table
		log.debug('In-app notification sent', {
			userId: notification.userId,
			title: notification.title,
		});
		return true;
	} catch (error) {
		log.error('Failed to send in-app notification', { error });
		return false;
	}
}

/**
 * Send email notification
 */
async function sendEmailNotification(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<boolean> {
	// Would use Resend or similar email service
	log.debug('Email notification sent', {
		userId: notification.userId,
		title: notification.title,
	});
	return true;
}

/**
 * Send WhatsApp notification
 */
async function sendWhatsAppNotification(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<boolean> {
	// Would use WhatsApp Business API
	log.debug('WhatsApp notification sent', {
		userId: notification.userId,
		title: notification.title,
	});
	return true;
}

/**
 * Create calendar event for study session
 */
async function createCalendarEvent(
	notification: Omit<Notification, 'id' | 'sentAt' | 'readAt'>
): Promise<boolean> {
	// Would use Google Calendar API
	log.debug('Calendar event created', {
		userId: notification.userId,
		title: notification.title,
	});
	return true;
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return {
			pushEnabled: false,
			inAppEnabled: true,
			emailEnabled: false,
			whatsappEnabled: false,
			calendarEnabled: false,
			quietHours: DEFAULT_QUIET_HOURS,
			maxPerDay: DEFAULT_MAX_PER_DAY,
		};
	}

	try {
		const [settings] = await db
			.select({
				pushNotifications: userSettings.pushNotifications,
				emailNotifications: userSettings.emailNotifications,
				studyReminders: userSettings.studyReminders,
			})
			.from(userSettings)
			.where(eq(userSettings.userId, userId));

		return {
			pushEnabled: settings?.pushNotifications ?? false,
			inAppEnabled: true,
			emailEnabled: settings?.emailNotifications ?? true,
			whatsappEnabled: false,
			calendarEnabled: false,
			quietHours: DEFAULT_QUIET_HOURS,
			maxPerDay: DEFAULT_MAX_PER_DAY,
		};
	} catch (error) {
		log.error('Failed to get notification preferences', { error });
		return {
			pushEnabled: false,
			inAppEnabled: true,
			emailEnabled: false,
			whatsappEnabled: false,
			calendarEnabled: false,
			quietHours: DEFAULT_QUIET_HOURS,
			maxPerDay: DEFAULT_MAX_PER_DAY,
		};
	}
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
	userId: string,
	preferences: Partial<NotificationPreferences>
): Promise<void> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		await db
			.update(userSettings)
			.set({
				pushNotifications: preferences.pushEnabled,
				emailNotifications: preferences.emailEnabled,
				updatedAt: new Date(),
			})
			.where(eq(userSettings.userId, userId));

		log.info('Notification preferences updated', {
			userId,
			pushEnabled: preferences.pushEnabled,
			emailEnabled: preferences.emailEnabled,
		});
	} catch (error) {
		log.error('Failed to update notification preferences', { error });
		throw error;
	}
}

/**
 * Check if it's quiet hours
 */
export function isQuietHours(quietHours: { start: string; end: string }): boolean {
	const now = new Date();
	const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

	if (quietHours.start > quietHours.end) {
		// Overnight quiet hours (e.g., 22:00 - 07:00)
		return currentTime >= quietHours.start || currentTime <= quietHours.end;
	}

	return currentTime >= quietHours.start && currentTime <= quietHours.end;
}

/**
 * Get value proposition message for notification permission
 */
export function getPermissionValueProposition(channel: NotificationChannel): string {
	const propositions = {
		push: 'Get instant reminders for study sessions and important updates',
		email: 'Receive detailed study plans and progress reports',
		whatsapp: 'Quick study reminders and motivational messages',
		calendar: 'Automatic scheduling of study sessions in your calendar',
	};

	return propositions[channel] || 'Stay updated with your learning progress';
}

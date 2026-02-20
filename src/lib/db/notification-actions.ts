'use server';

import { and, eq } from 'drizzle-orm';
import { dbManager } from './index';
import { notifications } from './schema';

const getDb = () => dbManager.getDb();

async function publishNotificationToAbly(
	userId: string,
	notification: {
		id: string;
		type: string;
		title: string;
		message: string;
		data?: Record<string, unknown>;
	}
) {
	try {
		const { publishNotification } = await import('@/lib/ably/client');
		await publishNotification(userId, notification);
		console.log('[Notifications] Published to Ably:', notification.id);
	} catch (error) {
		console.error('[Notifications] Failed to publish to Ably:', error);
	}
}

/**
 * Create a notification
 */
export async function createNotification(
	userId: string,
	data: {
		type: string;
		title: string;
		message: string;
		data?: Record<string, unknown>;
	}
) {
	try {
		const db = getDb();
		const [notification] = await db
			.insert(notifications)
			.values({
				userId,
				type: data.type,
				title: data.title,
				message: data.message,
				data: data.data ? JSON.stringify(data.data) : undefined,
			})
			.returning();

		publishNotificationToAbly(userId, {
			id: notification.id,
			type: data.type,
			title: data.title,
			message: data.message,
			data: data.data,
		});

		return { success: true, notification };
	} catch (error) {
		console.error('[Notifications] Error creating notification:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get user's notifications
 */
export async function getNotifications(
	userId: string,
	options?: {
		unreadOnly?: boolean;
		limit?: number;
		offset?: number;
	}
) {
	try {
		const db = getDb();
		const query = db.select().from(notifications).where(eq(notifications.userId, userId));

		const notificationsList = await query;

		// Filter unread only
		let filtered = notificationsList;
		if (options?.unreadOnly) {
			filtered = filtered.filter((n) => !n.isRead);
		}

		// Sort by created date (newest first)
		filtered.sort((a, b) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return dateB - dateA;
		});

		// Apply pagination
		const offset = options?.offset || 0;
		const limit = options?.limit || 20;
		return filtered.slice(offset, offset + limit);
	} catch (error) {
		console.error('[Notifications] Error getting notifications:', error);
		return [];
	}
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string) {
	try {
		const db = getDb();
		const result = await db
			.select()
			.from(notifications)
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

		return result.length;
	} catch (error) {
		console.error('[Notifications] Error getting unread count:', error);
		return 0;
	}
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
	try {
		const db = getDb();
		await db
			.update(notifications)
			.set({ isRead: true, readAt: new Date() })
			.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
		return { success: true };
	} catch (error) {
		console.error('[Notifications] Error marking as read:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
	try {
		const db = getDb();
		await db
			.update(notifications)
			.set({ isRead: true, readAt: new Date() })
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
		return { success: true };
	} catch (error) {
		console.error('[Notifications] Error marking all as read:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
	try {
		const db = getDb();
		await db
			.delete(notifications)
			.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
		return { success: true };
	} catch (error) {
		console.error('[Notifications] Error deleting notification:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string) {
	try {
		const db = getDb();
		await db.delete(notifications).where(eq(notifications.userId, userId));
		return { success: true };
	} catch (error) {
		console.error('[Notifications] Error deleting all notifications:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get a single notification
 */
export async function getNotification(notificationId: string, userId: string) {
	try {
		const db = getDb();
		const [notification] = await db
			.select()
			.from(notifications)
			.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
			.limit(1);
		return notification || null;
	} catch (error) {
		console.error('[Notifications] Error getting notification:', error);
		return null;
	}
}

/**
 * Create notification types helper
 */
export async function notifyAchievement(userId: string, achievementTitle: string) {
	return createNotification(userId, {
		type: 'achievement',
		title: 'Achievement Unlocked! 🎉',
		message: `You earned: ${achievementTitle}`,
		data: { achievement: achievementTitle },
	});
}

export async function notifyBuddyRequest(userId: string, requesterName: string) {
	return createNotification(userId, {
		type: 'buddy_request',
		title: 'New Study Buddy Request',
		message: `${requesterName} wants to be your study buddy!`,
		data: { requesterName },
	});
}

export async function notifyCommentReply(
	userId: string,
	commenterName: string,
	resourceType: string
) {
	return createNotification(userId, {
		type: 'comment_reply',
		title: 'New Reply',
		message: `${commenterName} replied to your comment`,
		data: { resourceType },
	});
}

export async function notifyStudyReminder(userId: string, title: string) {
	return createNotification(userId, {
		type: 'study_reminder',
		title: 'Study Reminder 📚',
		message: title,
		data: { title },
	});
}

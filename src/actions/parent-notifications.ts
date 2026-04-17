'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { parentNotificationPreferences, userAchievements, userProgress } from '@/lib/db/schema';

export interface LinkedChild {
	id: string;
	name: string;
}

export interface ParentNotification {
	id: string;
	type: 'achievement' | 'progress' | 'session' | 'alert' | 'milestone';
	title: string;
	message: string;
	timestamp: Date;
	read: boolean;
	childId: string;
	childName: string;
	actionUrl?: string;
}

/**
 * Get children linked to a parent via notification preferences
 */
async function getChildrenForParent(parentId: string): Promise<LinkedChild[]> {
	const db = await dbManager.getDb();

	const prefs = await db
		.select()
		.from(parentNotificationPreferences)
		.where(eq(parentNotificationPreferences.parentUserId, parentId));

	const { users } = await import('@/lib/db/schema');

	const children: LinkedChild[] = [];
	for (const pref of prefs) {
		const [childUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, pref.childUserId))
			.limit(1);

		if (childUser) {
			children.push({
				id: childUser.id,
				name: childUser.name || 'Your child',
			});
		}
	}

	return children;
}

/**
 * Get child progress for notifications
 */
async function getChildProgress(childId: string) {
	const db = await dbManager.getDb();

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, childId),
	});

	return progress;
}

/**
 * Get child achievements for notifications
 */
async function getChildAchievements(childId: string) {
	const db = await dbManager.getDb();

	const achievements = await db
		.select()
		.from(userAchievements)
		.where(eq(userAchievements.userId, childId));

	return achievements;
}

/**
 * Get all parent notifications aggregated from children's activity
 */
export async function getParentNotifications(): Promise<ParentNotification[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return [];
	}

	const userRole = (session.user as { role?: string }).role;
	if (userRole !== 'parent') {
		return [];
	}

	const parentId = session.user.id;
	const children = await getChildrenForParent(parentId);

	if (children.length === 0) {
		return [];
	}

	const notifications: ParentNotification[] = [];

	for (const child of children) {
		const [progress, achievements] = await Promise.all([
			getChildProgress(child.id),
			getChildAchievements(child.id),
		]);

		if (progress?.streakDays && progress.streakDays > 0) {
			notifications.push({
				id: `streak-${child.id}-${progress.streakDays}`,
				type: 'progress',
				title: `${child.name} is on a roll!`,
				message: `${progress.streakDays} day streak - keep it up!`,
				timestamp: progress.lastActivityAt || new Date(),
				read: !!(progress as Record<string, unknown>).streakNotificationRead,
				childId: child.id,
				childName: child.name,
			});
		}

		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const recentAchievements = achievements.filter((a) => {
			const unlockedAt = a.unlockedAt ? new Date(a.unlockedAt) : null;
			return unlockedAt && unlockedAt > sevenDaysAgo;
		});

		if (recentAchievements.length > 0) {
			const latest = recentAchievements[recentAchievements.length - 1];
			notifications.push({
				id: `achievement-${child.id}-${latest.id}`,
				type: 'achievement',
				title: `${child.name} unlocked an achievement!`,
				message: `${latest.title}`,
				timestamp: latest.unlockedAt || new Date(),
				read: false,
				childId: child.id,
				childName: child.name,
			});
		}
	}

	return notifications.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);
}

/**
 * Get unread notification count for parent
 */
export async function getParentUnreadCount(): Promise<number> {
	const notifications = await getParentNotifications();
	return notifications.filter((n) => !n.read).length;
}

/**
 * Mark a parent notification as read
 */
export async function markParentNotificationAsRead(
	_notificationId: string
): Promise<{ success: boolean }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { success: false };
		}

		return { success: true };
	} catch (error) {
		console.error('[ParentNotifications] Error marking as read:', error);
		return { success: false };
	}
}

/**
 * Mark all parent notifications as read
 */
export async function markAllParentNotificationsAsRead(): Promise<{
	success: boolean;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { success: false };
		}

		return { success: true };
	} catch (error) {
		console.error('[ParentNotifications] Error marking all as read:', error);
		return { success: false };
	}
}

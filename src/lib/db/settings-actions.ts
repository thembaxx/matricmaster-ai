'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from './index';
import { userSettings, users } from './schema';

const updateProfileSchema = z.object({
	name: z.string().min(1).max(100).optional(),
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface ActionResult<T = void> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Update user profile (name)
 */
export async function updateProfileAction(userId: string, data: { name?: string }) {
	try {
		const validatedData = updateProfileSchema.parse(data);

		if (!validatedData.name?.trim()) {
			return { success: false, error: 'Name is required' };
		}

		const db = await getDb();
		const [updatedUser] = await db
			.update(users)
			.set({ name: validatedData.name.trim(), updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning();

		if (!updatedUser) {
			return { success: false, error: 'User not found' };
		}

		return { success: true, data: updatedUser };
	} catch (error) {
		console.debug('Error updating profile:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update profile',
		};
	}
}

/**
 * Change user password
 */
export async function changePasswordAction(
	_userId: string,
	data: { currentPassword: string; newPassword: string }
): Promise<ActionResult> {
	try {
		const validatedData = changePasswordSchema.parse(data);
		const auth = await getAuth();

		const result = await auth.api.changePassword({
			body: {
				currentPassword: validatedData.currentPassword,
				newPassword: validatedData.newPassword,
				revokeOtherSessions: true,
			},
			headers: await headers(),
		});

		if (!result) {
			return { success: false, error: 'Failed to change password' };
		}

		return { success: true };
	} catch (error) {
		console.debug('Error changing password:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to change password',
		};
	}
}

/**
 * Delete user account
 */
export async function deleteAccountAction(userId: string, password: string) {
	try {
		if (!password) {
			return { success: false, error: 'Password is required to delete account' };
		}

		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		if (!user || !user.email) {
			return { success: false, error: 'User not found' };
		}

		const auth = await getAuth();

		// Verify password before deletion using signIn.email
		try {
			await auth.api.signInEmail({
				body: {
					email: user.email,
					password: password,
				},
				headers: await headers(),
			});
		} catch (_err) {
			return { success: false, error: 'Incorrect password' };
		}

		// Perform the account deletion (soft delete)
		const [deletedUser] = await db
			.update(users)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
				email: `deleted_${Date.now()}_${user.email}`, // Anonymize email
				name: 'Deleted User',
			})
			.where(eq(users.id, userId))
			.returning();

		if (!deletedUser) {
			return { success: false, error: 'Failed to delete account' };
		}

		// Sign out after deletion
		await auth.api.signOut({
			headers: await headers(),
		});

		return { success: true, data: deletedUser };
	} catch (error) {
		console.debug('Error deleting account:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete account',
		};
	}
}

/**
 * Get active sessions
 */
export async function getActiveSessionsAction(_userId: string) {
	try {
		const auth = await getAuth();
		const sessions = await auth.api.listSessions({
			headers: await headers(),
		});

		if (!sessions) {
			return { success: false, error: 'Failed to list sessions' };
		}

		return {
			success: true,
			data: sessions.map((s) => ({
				id: s.id,
				device: s.userAgent || 'Unknown Device',
				location: s.ipAddress || 'Unknown Location',
				lastActive: new Date(s.updatedAt),
			})),
		};
	} catch (error) {
		console.debug('Error getting sessions:', error);
		return { success: false, error: 'Failed to get active sessions' };
	}
}

/**
 * Revoke a session
 */
export async function revokeSessionAction(
	_userId: string,
	sessionId: string
): Promise<ActionResult> {
	try {
		const auth = await getAuth();
		await auth.api.revokeSession({
			body: {
				token: sessionId,
			},
			headers: await headers(),
		});

		return { success: true };
	} catch (error) {
		console.debug('Error revoking session:', error);
		return { success: false, error: 'Failed to revoke session' };
	}
}

// ============================================================================
// NOTIFICATION & PRIVACY SETTINGS
// ============================================================================

export interface CombinedSettings {
	emailNotifications: boolean;
	pushNotifications: boolean;
	studyReminders: boolean;
	achievementAlerts: boolean;
	whatsappNotifications: boolean;
	profileVisibility: boolean;
	showOnLeaderboard: boolean;
	analyticsTracking: boolean;
	language: string;
	theme: string;
	curriculum: string;
	homeLanguage: string | null;
	preferredLanguage: string;
}

const defaultSettings: CombinedSettings = {
	emailNotifications: true,
	pushNotifications: true,
	studyReminders: true,
	achievementAlerts: true,
	whatsappNotifications: false,
	profileVisibility: true,
	showOnLeaderboard: true,
	analyticsTracking: true,
	language: 'en',
	theme: 'system',
	curriculum: 'NSC',
	homeLanguage: null,
	preferredLanguage: 'en',
};

/**
 * Get user settings
 */
export async function getUserSettingsAction(
	userId: string
): Promise<ActionResult<CombinedSettings>> {
	try {
		const db = await getDb();
		const [settings] = await db
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, userId))
			.limit(1);

		if (!settings) {
			// Create default settings if they don't exist
			const [newSettings] = await db
				.insert(userSettings)
				.values({
					userId,
					...defaultSettings,
				})
				.returning();

			return { success: true, data: newSettings as CombinedSettings };
		}

		return {
			success: true,
			data: settings as CombinedSettings,
		};
	} catch (error) {
		console.debug('Error getting user settings:', error);
		return { success: true, data: defaultSettings };
	}
}

/**
 * Update user settings
 */
export async function updateUserSettingsAction(
	userId: string,
	data: Partial<CombinedSettings>
): Promise<ActionResult<CombinedSettings>> {
	try {
		const db = await getDb();

		const [updatedSettings] = await db
			.insert(userSettings)
			.values({
				userId,
				...data,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: userSettings.userId,
				set: {
					...data,
					updatedAt: new Date(),
				},
			})
			.returning();

		return {
			success: true,
			data: updatedSettings as CombinedSettings,
		};
	} catch (error) {
		console.debug('Error updating user settings:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update settings',
		};
	}
}

// Legacy exports for backward compatibility if needed
export async function getNotificationSettingsAction(userId: string) {
	return getUserSettingsAction(userId);
}

export async function updateNotificationSettingsAction(
	userId: string,
	data: Partial<CombinedSettings>
) {
	return updateUserSettingsAction(userId, data);
}

export async function getPrivacySettingsAction(userId: string) {
	return getUserSettingsAction(userId);
}

export async function updatePrivacySettingsActionExtended(
	userId: string,
	data: Partial<CombinedSettings>
) {
	return updateUserSettingsAction(userId, data);
}

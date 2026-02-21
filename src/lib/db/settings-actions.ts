'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { users } from './better-auth-schema';
import { type DbType, dbManager } from './index';

const updateProfileSchema = z.object({
	name: z.string().min(1).max(100).optional(),
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const privacySettingsSchema = z.object({
	profileVisibility: z.boolean().optional(),
	showOnLeaderboard: z.boolean().optional(),
	analyticsTracking: z.boolean().optional(),
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
export async function updateProfileAction(
	userId: string,
	data: { name?: string }
): Promise<
	ActionResult<{
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		role: string;
		isBlocked: boolean;
		twoFactorEnabled: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}>
> {
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
		console.error('Error updating profile:', error);
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
	userId: string,
	data: { currentPassword: string; newPassword: string }
): Promise<ActionResult> {
	try {
		const validatedData = changePasswordSchema.parse(data);

		// Get user email for verification
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		if (!user || !user.email) {
			return { success: false, error: 'User not found' };
		}

		// Use better-auth's password change
		const result = await authClient.signIn.email(
			{
				email: user.email,
				password: validatedData.currentPassword,
			},
			{
				onSuccess: () => {
					// Sign in successful, password is correct
				},
			}
		);

		// If sign in failed with current password
		if (result.error) {
			return { success: false, error: 'Current password is incorrect' };
		}

		// Note: Better Auth doesn't have a direct "change password" API
		// This would require the user to use password reset flow
		// For now, we'll return a message about the password reset

		return {
			success: false,
			error: 'Password change requires password reset. Please use the "Forgot Password" feature.',
		};
	} catch (error) {
		console.error('Error changing password:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to change password',
		};
	}
}

/**
 * Delete user account
 */
export async function deleteAccountAction(
	userId: string,
	password: string
): Promise<
	ActionResult<{
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		role: string;
		isBlocked: boolean;
		twoFactorEnabled: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}>
> {
	try {
		if (!password) {
			return { success: false, error: 'Password is required to delete account' };
		}

		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		if (!user || !user.email) {
			return { success: false, error: 'User not found' };
		}

		// Verify password before deletion
		const verifyResult = await authClient.signIn.email(
			{
				email: user.email,
				password: password,
			},
			{
				onSuccess: () => {},
			}
		);

		if (verifyResult.error) {
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
		await authClient.signOut();

		return { success: true, data: deletedUser };
	} catch (error) {
		console.error('Error deleting account:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete account',
		};
	}
}

/**
 * Get active sessions (placeholder - Better Auth handles sessions)
 */
export async function getActiveSessionsAction(
	_userId: string
): Promise<ActionResult<{ id: string; device: string; location: string; lastActive: Date }[]>> {
	// Better Auth manages sessions, this is a placeholder for UI
	// In production, you'd query the sessions table
	return {
		success: true,
		data: [
			{
				id: 'current',
				device: 'Current Browser',
				location: 'Current Session',
				lastActive: new Date(),
			},
		],
	};
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettingsAction(
	userId: string,
	data: { profileVisibility?: boolean; showOnLeaderboard?: boolean; analyticsTracking?: boolean }
): Promise<
	ActionResult<{
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		role: string;
		isBlocked: boolean;
		twoFactorEnabled: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}>
> {
	try {
		// Validate input
		privacySettingsSchema.parse(data);

		const db = await getDb();

		// Update privacy metadata (stored as JSON in metadata field or separate table)
		const [updatedUser] = await db
			.update(users)
			.set({ updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning();

		if (!updatedUser) {
			return { success: false, error: 'User not found' };
		}

		// Note: Privacy settings would need a separate table or metadata field
		// For now, this is a placeholder

		return { success: true, data: updatedUser };
	} catch (error) {
		console.error('Error updating privacy settings:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update privacy settings',
		};
	}
}

/**
 * Revoke a session
 */
export async function revokeSessionAction(
	_userId: string,
	_sessionId: string
): Promise<ActionResult> {
	// Better Auth session management would go here
	// For now, return success as a placeholder
	return { success: true };
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export interface NotificationSettings {
	emailNotifications: boolean;
	pushNotifications: boolean;
	studyReminders: boolean;
	achievementAlerts: boolean;
}

const defaultNotificationSettings: NotificationSettings = {
	emailNotifications: true,
	pushNotifications: true,
	studyReminders: true,
	achievementAlerts: true,
};

/**
 * Get notification settings (placeholder - would need dedicated table)
 */
export async function getNotificationSettingsAction(
	_userId: string
): Promise<ActionResult<NotificationSettings>> {
	// For now, return defaults. In production, query from user_settings table
	return {
		success: true,
		data: defaultNotificationSettings,
	};
}

/**
 * Update notification settings (placeholder - would need dedicated table)
 */
export async function updateNotificationSettingsAction(
	_userId: string,
	data: Partial<NotificationSettings>
): Promise<ActionResult<NotificationSettings>> {
	// Validate input
	const validKeys = [
		'emailNotifications',
		'pushNotifications',
		'studyReminders',
		'achievementAlerts',
	];
	const filteredData: NotificationSettings = {} as NotificationSettings;

	for (const key of validKeys) {
		if (key in data) {
			(filteredData as Record<string, unknown>)[key] = (data as Record<string, unknown>)[key];
		}
	}

	// In production, save to user_settings table
	// For now, return success with merged settings
	return {
		success: true,
		data: { ...defaultNotificationSettings, ...filteredData },
	};
}

// ============================================================================
// PRIVACY SETTINGS (Extended)
// ============================================================================

export interface PrivacySettings {
	profileVisibility: boolean;
	showOnLeaderboard: boolean;
	analyticsTracking: boolean;
}

const defaultPrivacySettings: PrivacySettings = {
	profileVisibility: true,
	showOnLeaderboard: true,
	analyticsTracking: true,
};

/**
 * Get privacy settings (placeholder - would need dedicated table)
 */
export async function getPrivacySettingsAction(
	_userId: string
): Promise<ActionResult<PrivacySettings>> {
	// For now, return defaults. In production, query from user_settings table
	return {
		success: true,
		data: defaultPrivacySettings,
	};
}

/**
 * Update privacy settings (placeholder - would need dedicated table)
 */
export async function updatePrivacySettingsActionExtended(
	_userId: string,
	data: Partial<PrivacySettings>
): Promise<ActionResult<PrivacySettings>> {
	// Validate input
	const validKeys = ['profileVisibility', 'showOnLeaderboard', 'analyticsTracking'];
	const filteredData: PrivacySettings = {} as PrivacySettings;

	for (const key of validKeys) {
		if (key in data) {
			(filteredData as Record<string, unknown>)[key] = (data as Record<string, unknown>)[key];
		}
	}

	// In production, save to user_settings table
	// For now, return success with merged settings
	return {
		success: true,
		data: { ...defaultPrivacySettings, ...filteredData },
	};
}

'use server';

import { eq, inArray } from 'drizzle-orm';
import { dbManager } from './index';
import { studyBuddies, studyBuddyProfiles, studyBuddyRequests, users } from './schema';

const getDb = () => dbManager.getDb();

// Helper to parse JSON string to array
function parseJsonField<T>(value: unknown, defaultValue: T): T {
	if (value === null || value === undefined) return defaultValue;
	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch {
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
 * Get or create a study buddy profile for a user
 */
export async function getStudyBuddyProfile(userId: string) {
	try {
		const db = getDb();
		const [profile] = await db
			.select()
			.from(studyBuddyProfiles)
			.where(eq(studyBuddyProfiles.userId, userId))
			.limit(1);

		if (!profile) return null;

		// Parse JSON string fields to arrays
		return {
			...profile,
			preferredSubjects: parseJsonField<string[]>(profile.preferredSubjects, []),
			lookingFor: parseJsonField<string[]>(profile.lookingFor, []),
		};
	} catch (error) {
		console.error('[Buddy] Error getting profile:', error);
		return null;
	}
}

/**
 * Create or update study buddy profile
 */
export async function upsertStudyBuddyProfile(
	userId: string,
	data: {
		bio?: string;
		studyGoals?: string;
		preferredSubjects?: string[];
		lookingFor?: string[];
		isVisible?: boolean;
	}
) {
	try {
		const db = getDb();
		const existing = await getStudyBuddyProfile(userId);

		if (existing) {
			const [updated] = await db
				.update(studyBuddyProfiles)
				.set({
					bio: data.bio,
					studyGoals: data.studyGoals,
					preferredSubjects: data.preferredSubjects
						? stringifyField(data.preferredSubjects)
						: undefined,
					lookingFor: data.lookingFor ? stringifyField(data.lookingFor) : undefined,
					isVisible: data.isVisible,
					updatedAt: new Date(),
				})
				.where(eq(studyBuddyProfiles.userId, userId))
				.returning();
			return { success: true, profile: updated };
		}
		const [created] = await db
			.insert(studyBuddyProfiles)
			.values({
				userId,
				bio: data.bio || '',
				studyGoals: data.studyGoals || '',
				preferredSubjects: stringifyField(data.preferredSubjects || []),
				lookingFor: stringifyField(data.lookingFor || []),
				isVisible: data.isVisible ?? true,
			})
			.returning();
		return { success: true, profile: created };
	} catch (error) {
		console.error('[Buddy] Error upserting profile:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get discoverable study buddies (users with visible profiles)
 */
export async function getDiscoverableBuddies(userId: string, limit = 20) {
	try {
		const db = getDb();
		// Get users who are visible and not the current user
		const buddies = await db
			.select()
			.from(studyBuddyProfiles)
			.where(eq(studyBuddyProfiles.isVisible, true))
			.limit(limit);

		// Filter out current user and parse JSON fields
		return buddies
			.filter((b) => b.userId !== userId)
			.map((b) => ({
				...b,
				preferredSubjects: parseJsonField<string[]>(b.preferredSubjects, []),
				lookingFor: parseJsonField<string[]>(b.lookingFor, []),
			}));
	} catch (error) {
		console.error('[Buddy] Error getting discoverable buddies:', error);
		return [];
	}
}

/**
 * Send a buddy request
 */
export async function sendBuddyRequest(requesterId: string, recipientId: string, message?: string) {
	try {
		const db = getDb();

		// Check if request already exists
		const existing = await db
			.select()
			.from(studyBuddyRequests)
			.where(eq(studyBuddyRequests.requesterId, requesterId))
			.limit(1);

		if (existing.length > 0) {
			return { success: false, error: 'Request already sent' };
		}

		const [request] = await db
			.insert(studyBuddyRequests)
			.values({
				requesterId,
				recipientId,
				message,
				status: 'pending',
			})
			.returning();

		return { success: true, request };
	} catch (error) {
		console.error('[Buddy] Error sending request:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get pending buddy requests for a user
 */
export async function getPendingRequests(userId: string) {
	try {
		const db = getDb();
		const { and } = await import('drizzle-orm');
		const requests = await db
			.select()
			.from(studyBuddyRequests)
			.where(
				and(eq(studyBuddyRequests.recipientId, userId), eq(studyBuddyRequests.status, 'pending'))
			)
			.orderBy(studyBuddyRequests.createdAt);

		return requests;
	} catch (error) {
		console.error('[Buddy] Error getting pending requests:', error);
		return [];
	}
}

/**
 * Accept a buddy request
 */
export async function acceptBuddyRequest(requestId: string, recipientId: string) {
	try {
		const db = getDb();

		// Update request status
		await db
			.update(studyBuddyRequests)
			.set({ status: 'accepted', respondedAt: new Date() })
			.where(eq(studyBuddyRequests.id, requestId));

		// Get requester ID from request
		const [request] = await db
			.select()
			.from(studyBuddyRequests)
			.where(eq(studyBuddyRequests.id, requestId))
			.limit(1);

		if (!request) {
			return { success: false, error: 'Request not found' };
		}

		// Create buddy connection (both ways)
		await db.insert(studyBuddies).values({
			userId1: request.requesterId,
			userId2: recipientId,
		});

		return { success: true };
	} catch (error) {
		console.error('[Buddy] Error accepting request:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Reject a buddy request
 */
export async function rejectBuddyRequest(requestId: string) {
	try {
		const db = getDb();

		await db
			.update(studyBuddyRequests)
			.set({ status: 'rejected', respondedAt: new Date() })
			.where(eq(studyBuddyRequests.id, requestId));

		return { success: true };
	} catch (error) {
		console.error('[Buddy] Error rejecting request:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get user's buddies
 */
export async function getUserBuddies(userId: string) {
	try {
		const db = getDb();

		// Get buddies where user is userId1 or userId2
		const asUser1 = await db.select().from(studyBuddies).where(eq(studyBuddies.userId1, userId));

		const asUser2 = await db.select().from(studyBuddies).where(eq(studyBuddies.userId2, userId));

		// Combine and get unique buddy IDs
		const buddyIds = new Set<string>();
		for (const b of asUser1) {
			buddyIds.add(b.userId2);
		}
		for (const b of asUser2) {
			buddyIds.add(b.userId1);
		}

		// Get buddy profiles
		const buddies = await db.select().from(studyBuddyProfiles);

		// Filter to only include buddy IDs and parse JSON fields
		return buddies
			.filter((b) => buddyIds.has(b.userId))
			.map((b) => ({
				...b,
				preferredSubjects: parseJsonField<string[]>(b.preferredSubjects, []),
				lookingFor: parseJsonField<string[]>(b.lookingFor, []),
			}));
	} catch (error) {
		console.error('[Buddy] Error getting user buddies:', error);
		return [];
	}
}

/**
 * Remove a buddy connection
 */
export async function removeBuddy(userId: string, buddyId: string) {
	try {
		const db = getDb();
		const { and } = await import('drizzle-orm');

		// Delete both directions - combine conditions with and()
		await db
			.delete(studyBuddies)
			.where(and(eq(studyBuddies.userId1, userId), eq(studyBuddies.userId2, buddyId)));

		await db
			.delete(studyBuddies)
			.where(and(eq(studyBuddies.userId1, buddyId), eq(studyBuddies.userId2, userId)));

		return { success: true };
	} catch (error) {
		console.error('[Buddy] Error removing buddy:', error);
		return { success: false, error: String(error) };
	}
}

export interface UserInfo {
	id: string;
	name: string | null;
	image: string | null;
}

/**
 * Get user info by ID (name and avatar)
 */
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
	try {
		const db = getDb();
		const [user] = await db
			.select({ id: users.id, name: users.name, image: users.image })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) return null;

		return {
			id: user.id,
			name: user.name,
			image: user.image,
		};
	} catch (error) {
		console.error('[Buddy] Error getting user info:', error);
		return null;
	}
}

/**
 * Get multiple users' info by IDs
 */
export async function getBatchUserInfo(userIds: string[]): Promise<Map<string, UserInfo>> {
	const result = new Map<string, UserInfo>();

	if (userIds.length === 0) return result;

	try {
		const db = getDb();
		const userRecords = await db
			.select({ id: users.id, name: users.name, image: users.image })
			.from(users)
			.where(inArray(users.id, userIds));

		for (const user of userRecords) {
			result.set(user.id, {
				id: user.id,
				name: user.name,
				image: user.image,
			});
		}
	} catch (error) {
		console.error('[Buddy] Error getting batch user info:', error);
	}

	return result;
}

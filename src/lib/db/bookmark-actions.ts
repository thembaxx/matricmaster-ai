'use server';

import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { ensureAuthenticated } from './actions';
import { dbManager, getDb } from './index';
import { type Bookmark, bookmarks, type NewBookmark } from './schema';

const bookmarkSchema = z.object({
	userId: z.string().min(1),
	bookmarkType: z.enum(['question', 'past_paper', 'study_note', 'quiz']),
	referenceId: z.string().min(1),
	note: z.string().optional(),
});

/**
 * Create a new bookmark
 */
export async function createBookmarkAction(
	userId: string,
	bookmarkType: 'question' | 'past_paper' | 'study_note' | 'quiz',
	referenceId: string,
	note?: string
): Promise<{ success: boolean; bookmark?: Bookmark; error?: string }> {
	try {
		const user = await ensureAuthenticated();
		if (user.id !== userId) {
			return { success: false, error: 'Unauthorized' };
		}
		const validated = bookmarkSchema.parse({ userId, bookmarkType, referenceId, note });

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = getDb();

		// Check if already bookmarked
		const existing = await db
			.select()
			.from(bookmarks)
			.where(
				and(
					eq(bookmarks.userId, validated.userId),
					eq(bookmarks.referenceId, validated.referenceId)
				)
			)
			.limit(1);

		if (existing.length > 0) {
			return { success: false, error: 'Already bookmarked' };
		}

		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				userId: validated.userId,
				bookmarkType: validated.bookmarkType,
				referenceId: validated.referenceId,
				note: validated.note,
			} as NewBookmark)
			.returning();

		return { success: true, bookmark };
	} catch (error) {
		console.error('[Bookmarks] Error creating bookmark:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create bookmark',
		};
	}
}

/**
 * Get user's bookmarks
 */
export async function getBookmarksAction(
	userId: string,
	type?: 'question' | 'past_paper' | 'study_note' | 'quiz'
): Promise<Bookmark[]> {
	try {
		const user = await ensureAuthenticated();
		if (user.id !== userId) {
			throw new Error('Unauthorized');
		}
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return [];
		}

		const db = getDb();
		if (type) {
			return db
				.select()
				.from(bookmarks)
				.where(and(eq(bookmarks.userId, userId), eq(bookmarks.bookmarkType, type)))
				.orderBy(desc(bookmarks.createdAt));
		}
		return db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.userId, userId))
			.orderBy(desc(bookmarks.createdAt));
	} catch (error) {
		console.error('[Bookmarks] Error getting bookmarks:', error);
		return [];
	}
}

/**
 * Delete a bookmark
 */
export async function deleteBookmarkAction(
	bookmarkId: string,
	userId: string
): Promise<{ success: boolean }> {
	try {
		const user = await ensureAuthenticated();
		if (user.id !== userId) {
			return { success: false };
		}
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = getDb();
		const result = await db
			.delete(bookmarks)
			.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[Bookmarks] Error deleting bookmark:', error);
		return { success: false };
	}
}

/**
 * Check if an item is bookmarked
 */
export async function isBookmarkedAction(userId: string, referenceId: string): Promise<boolean> {
	try {
		const user = await ensureAuthenticated();
		if (user.id !== userId) {
			return false;
		}
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return false;
		}

		const db = getDb();
		const [bookmark] = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.userId, userId), eq(bookmarks.referenceId, referenceId)))
			.limit(1);

		return !!bookmark;
	} catch (_error) {
		return false;
	}
}

/**
 * Update bookmark note
 */
export async function updateBookmarkNoteAction(
	bookmarkId: string,
	userId: string,
	note: string
): Promise<{ success: boolean }> {
	try {
		const user = await ensureAuthenticated();
		if (user.id !== userId) {
			return { success: false };
		}
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = getDb();
		const result = await db
			.update(bookmarks)
			.set({ note })
			.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[Bookmarks] Error updating note:', error);
		return { success: false };
	}
}

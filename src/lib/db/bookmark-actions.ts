'use server';

import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { ensureAuthenticated } from './actions';
import { dbManager, getDb } from './index';
import { type Bookmark, bookmarks, type NewBookmark } from './schema';

const bookmarkSchema = z.object({
	bookmarkType: z.enum(['question', 'past_paper', 'study_note', 'quiz', 'lesson']),
	referenceId: z.string().min(1),
	note: z.string().optional(),
});

/**
 * Create a new bookmark
 */
export async function createBookmarkAction(
	bookmarkType: 'question' | 'past_paper' | 'study_note' | 'quiz' | 'lesson',
	referenceId: string,
	note?: string
): Promise<{ success: boolean; bookmark?: Bookmark; error?: string }> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const validated = bookmarkSchema.parse({ bookmarkType, referenceId, note });

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = await getDb();

		// Check if already bookmarked
		const existing = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.userId, userId), eq(bookmarks.referenceId, validated.referenceId)))
			.limit(1);

		if (existing.length > 0) {
			return { success: false, error: 'Already bookmarked' };
		}

		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				userId: userId,
				bookmarkType: validated.bookmarkType,
				referenceId: validated.referenceId,
				note: validated.note,
			} as NewBookmark)
			.returning();

		return { success: true, bookmark };
	} catch (error) {
		console.debug('[Bookmarks] Error creating bookmark:', error);
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
	type?: 'question' | 'past_paper' | 'study_note' | 'quiz' | 'lesson'
): Promise<Bookmark[]> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return [];
		}

		const db = await getDb();
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
		console.debug('[Bookmarks] Error getting bookmarks:', error);
		return [];
	}
}

/**
 * Delete a bookmark
 */
export async function deleteBookmarkAction(bookmarkId: string): Promise<{ success: boolean }> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = await getDb();
		const result = await db
			.delete(bookmarks)
			.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.debug('[Bookmarks] Error deleting bookmark:', error);
		return { success: false };
	}
}

/**
 * Check if an item is bookmarked
 */
export async function isBookmarkedAction(referenceId: string): Promise<boolean> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return false;
		}

		const db = await getDb();
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
	note: string
): Promise<{ success: boolean }> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false };
		}

		const db = await getDb();
		const result = await db
			.update(bookmarks)
			.set({ note })
			.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.debug('[Bookmarks] Error updating note:', error);
		return { success: false };
	}
}

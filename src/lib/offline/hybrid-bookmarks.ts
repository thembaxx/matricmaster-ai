import type { BookmarkType } from './offline-bookmarks';
import {
	addBookmark as addBookmarkDB,
	isBookmarked as checkBookmarkedDB,
	removeBookmark,
} from './offline-bookmarks';
import { queueBookmarksAdd, queueBookmarksRemove } from './sync-manager';

export async function toggleBookmarkOffline(
	id: string,
	type: BookmarkType,
	title: string,
	subject: string,
	topic?: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
	const isOnline = navigator.onLine;
	const isCurrentlyBookmarked = await checkBookmarkedDB(id);

	if (isCurrentlyBookmarked) {
		if (isOnline) {
			try {
				const response = await fetch('/api/bookmarks', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id }),
				});

				if (response.ok) {
					await removeBookmark(id);
					return { success: true, isBookmarked: false };
				}
			} catch {
				// Fall through to offline path
			}
		}

		if (!isOnline) {
			await queueBookmarksRemove(id);
			await removeBookmark(id);
			return { success: true, isBookmarked: false };
		}
	} else {
		const bookmark = { id, type, title, subject, topic };

		if (isOnline) {
			try {
				const response = await fetch('/api/bookmarks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(bookmark),
				});

				if (response.ok) {
					await addBookmarkDB(bookmark);
					return { success: true, isBookmarked: true };
				}
			} catch {
				// Fall through to offline path
			}
		}

		if (!isOnline) {
			await queueBookmarksAdd(bookmark);
			await addBookmarkDB(bookmark);
			return { success: true, isBookmarked: true };
		}
	}

	return { success: false, isBookmarked: isCurrentlyBookmarked };
}

export async function checkBookmarkStatus(id: string): Promise<boolean> {
	const isOnline = navigator.onLine;
	const offlineBookmarked = await checkBookmarkedDB(id);

	if (offlineBookmarked) return true;

	if (isOnline) {
		try {
			const response = await fetch(`/api/bookmarks/${id}/check`, {
				method: 'GET',
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	return false;
}

export async function getOfflineBookmarksCount(): Promise<number> {
	const { getBookmarkCount } = await import('./offline-bookmarks');
	return getBookmarkCount();
}

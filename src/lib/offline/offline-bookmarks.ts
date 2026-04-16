'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export type BookmarkType =
	| 'question'
	| 'topic'
	| 'past-paper'
	| 'lesson'
	| 'flashcard'
	| 'ai-response';

export interface Bookmark {
	id: string;
	type: BookmarkType;
	title: string;
	subject: string;
	topic?: string;
	content?: string;
	metadata?: Record<string, unknown>;
	createdAt: number;
	lastAccessedAt: number;
	accessCount: number;
}

export interface BookmarkFolder {
	id: string;
	name: string;
	bookmarkIds: string[];
	createdAt: number;
}

export interface BookmarkSearchResult {
	bookmark: Bookmark;
	score: number;
	matchType: 'title' | 'content' | 'topic';
}

interface BookmarkDB extends DBSchema {
	bookmarks: {
		key: string;
		value: Bookmark;
		indexes: { 'by-subject': string; 'by-type': string; 'by-date': number };
	};
	folders: {
		key: string;
		value: BookmarkFolder;
	};
	tagIndex: {
		key: string;
		value: { tag: string; bookmarkId: string };
		indexes: { 'by-bookmark': string };
	};
}

let dbPromise: Promise<IDBPDatabase<BookmarkDB>> | null = null;

async function getBookmarkDB(): Promise<IDBPDatabase<BookmarkDB>> {
	if (!dbPromise) {
		dbPromise = openDB<BookmarkDB>('lumni-bookmarks', 1, {
			upgrade(db) {
				const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
				bookmarkStore.createIndex('by-subject', 'subject');
				bookmarkStore.createIndex('by-type', 'type');
				bookmarkStore.createIndex('by-date', 'createdAt');
				bookmarkStore.createIndex('by-date', 'lastAccessedAt');

				db.createObjectStore('folders', { keyPath: 'id' });

				const tagStore = db.createObjectStore('tagIndex', { keyPath: 'tag' });
				tagStore.createIndex('by-bookmark', 'bookmarkId');
			},
		});
	}
	return dbPromise;
}

export async function addBookmark(
	bookmark: Omit<Bookmark, 'createdAt' | 'lastAccessedAt' | 'accessCount'>
): Promise<void> {
	const db = await getBookmarkDB();
	const now = Date.now();
	await db.put('bookmarks', {
		...bookmark,
		createdAt: now,
		lastAccessedAt: now,
		accessCount: 0,
	});
}

export async function removeBookmark(id: string): Promise<void> {
	const db = await getBookmarkDB();
	await db.delete('bookmarks', id);
}

export async function getBookmark(id: string): Promise<Bookmark | undefined> {
	const db = await getBookmarkDB();
	const bookmark = await db.get('bookmarks', id);

	if (bookmark) {
		bookmark.lastAccessedAt = Date.now();
		bookmark.accessCount++;
		await db.put('bookmarks', bookmark);
	}

	return bookmark;
}

export async function getAllBookmarks(): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	const bookmarks = await db.getAll('bookmarks');
	return bookmarks.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
}

export async function getBookmarksBySubject(subject: string): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	return db.getAllFromIndex('bookmarks', 'by-subject', subject);
}

export async function getBookmarksByType(type: BookmarkType): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	return db.getAllFromIndex('bookmarks', 'by-type', type);
}

export async function isBookmarked(id: string): Promise<boolean> {
	const db = await getBookmarkDB();
	const bookmark = await db.get('bookmarks', id);
	return !!bookmark;
}

export async function searchBookmarks(query: string): Promise<BookmarkSearchResult[]> {
	const db = await getBookmarkDB();
	const all = await db.getAll('bookmarks');
	const queryLower = query.toLowerCase();

	const results: BookmarkSearchResult[] = [];

	for (const bookmark of all) {
		let score = 0;
		let matchType: 'title' | 'content' | 'topic' | null = null;

		if (bookmark.title.toLowerCase().includes(queryLower)) {
			score += 10;
			matchType = 'title';
		}

		if (bookmark.topic?.toLowerCase().includes(queryLower)) {
			score += 5;
			matchType = 'topic';
		}

		if (bookmark.content?.toLowerCase().includes(queryLower)) {
			score += 3;
			matchType = 'content';
		}

		if (score > 0 && matchType) {
			results.push({ bookmark, score, matchType });
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, 20);
}

export async function getRecentBookmarks(limit = 10): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	const bookmarks = await db.getAll('bookmarks');
	return bookmarks.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt).slice(0, limit);
}

export async function getMostAccessedBookmarks(limit = 10): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	const bookmarks = await db.getAll('bookmarks');
	return bookmarks.sort((a, b) => b.accessCount - a.accessCount).slice(0, limit);
}

export async function createFolder(name: string): Promise<string> {
	const db = await getBookmarkDB();
	const id = `folder-${Date.now()}`;
	await db.put('folders', {
		id,
		name,
		bookmarkIds: [],
		createdAt: Date.now(),
	});
	return id;
}

export async function getFolders(): Promise<BookmarkFolder[]> {
	const db = await getBookmarkDB();
	return db.getAll('folders');
}

export async function addToFolder(folderId: string, bookmarkId: string): Promise<void> {
	const db = await getBookmarkDB();
	const folder = await db.get('folders', folderId);
	if (folder && !folder.bookmarkIds.includes(bookmarkId)) {
		folder.bookmarkIds.push(bookmarkId);
		await db.put('folders', folder);
	}
}

export async function removeFromFolder(folderId: string, bookmarkId: string): Promise<void> {
	const db = await getBookmarkDB();
	const folder = await db.get('folders', folderId);
	if (folder) {
		folder.bookmarkIds = folder.bookmarkIds.filter((id) => id !== bookmarkId);
		await db.put('folders', folder);
	}
}

export async function getFolderBookmarks(folderId: string): Promise<Bookmark[]> {
	const db = await getBookmarkDB();
	const folder = await db.get('folders', folderId);
	if (!folder) return [];

	const bookmarks: Bookmark[] = [];
	for (const id of folder.bookmarkIds) {
		const bookmark = await db.get('bookmarks', id);
		if (bookmark) bookmarks.push(bookmark);
	}
	return bookmarks;
}

export async function deleteFolder(id: string): Promise<void> {
	const db = await getBookmarkDB();
	await db.delete('folders', id);
}

export async function getBookmarkCount(): Promise<number> {
	const db = await getBookmarkDB();
	return db.count('bookmarks');
}

export async function clearAllBookmarks(): Promise<void> {
	const db = await getBookmarkDB();
	await db.clear('bookmarks');
	await db.clear('folders');
	await db.clear('tagIndex');
}

'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export type SyncActionType =
	| 'quiz-answer'
	| 'quiz-submit'
	| 'flashcard-update'
	| 'bookmark-add'
	| 'bookmark-remove'
	| 'progress-update'
	| 'study-session-start'
	| 'study-session-end'
	| 'ai-message'
	| 'user-preference-update';

export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncAction {
	id: string;
	type: SyncActionType;
	payload: Record<string, unknown>;
	status: SyncStatus;
	priority: number;
	createdAt: number;
	attempts: number;
	lastAttemptAt: number | null;
	error: string | null;
	relatedIds: string[];
}

interface SyncDB extends DBSchema {
	queue: {
		key: string;
		value: SyncAction;
		indexes: { 'by-status': string; 'by-date': number; 'by-type': string };
	};
	processed: {
		key: string;
		value: SyncAction;
	};
}

let dbPromise: Promise<IDBPDatabase<SyncDB>> | null = null;

const MAX_RETRY_ATTEMPTS = 3;
const PROCESSING_BATCH_SIZE = 10;

async function getSyncDB(): Promise<IDBPDatabase<SyncDB>> {
	if (!dbPromise) {
		dbPromise = openDB<SyncDB>('lumni-sync', 1, {
			upgrade(db) {
				const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
				queueStore.createIndex('by-status', 'status');
				queueStore.createIndex('by-date', 'createdAt');
				queueStore.createIndex('by-type', 'type');

				db.createObjectStore('processed', { keyPath: 'id' });
			},
		});
	}
	return dbPromise;
}

export async function addToQueue(
	type: SyncActionType,
	payload: Record<string, unknown>,
	options?: {
		priority?: number;
		relatedIds?: string[];
	}
): Promise<string> {
	const db = await getSyncDB();
	const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

	const action: SyncAction = {
		id,
		type,
		payload,
		status: 'pending',
		priority: (options?.priority ?? type === 'quiz-submit') ? 10 : 1,
		createdAt: Date.now(),
		attempts: 0,
		lastAttemptAt: null,
		error: null,
		relatedIds: options?.relatedIds ?? [],
	};

	await db.put('queue', action);
	return id;
}

export async function getQueueStats(): Promise<{
	pending: number;
	processing: number;
	failed: number;
}> {
	const db = await getSyncDB();
	const all = await db.getAll('queue');

	const stats = { pending: 0, processing: 0, failed: 0 };

	for (const action of all) {
		if (action.status === 'pending') stats.pending++;
		else if (action.status === 'processing') stats.processing++;
		else if (action.status === 'failed') stats.failed++;
	}

	return stats;
}

export async function getPendingActions(): Promise<SyncAction[]> {
	const db = await getSyncDB();
	const all = await db.getAll('queue');

	return all
		.filter((a) => a.status === 'pending')
		.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
		.slice(0, PROCESSING_BATCH_SIZE);
}

export async function markProcessing(ids: string[]): Promise<void> {
	const db = await getSyncDB();
	const tx = db.transaction('queue', 'readwrite');

	for (const id of ids) {
		const action = await tx.store.get(id);
		if (action) {
			action.status = 'processing';
			action.lastAttemptAt = Date.now();
			await tx.store.put(action);
		}
	}

	await tx.done;
}

export async function markCompleted(ids: string[]): Promise<void> {
	const db = await getSyncDB();
	const tx = db.transaction(['queue', 'processed'], 'readwrite');

	for (const id of ids) {
		const action = await tx.objectStore('queue').get(id);
		if (action) {
			action.status = 'completed';
			await tx.objectStore('queue').delete(id);
			await tx.objectStore('processed').put(action);
		}
	}

	await tx.done;
}

export async function markFailed(ids: string[], errors: string[]): Promise<void> {
	const db = await getSyncDB();
	const tx = db.transaction('queue', 'readwrite');

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		const error = errors[i];
		const action = await tx.store.get(id);

		if (action) {
			action.attempts++;

			if (action.attempts >= MAX_RETRY_ATTEMPTS) {
				action.status = 'failed';
			} else {
				action.status = 'pending';
				action.error = error;
			}

			await tx.store.put(action);
		}
	}

	await tx.done;
}

export async function retryFailed(): Promise<number> {
	const db = await getSyncDB();
	const all = await db.getAll('queue');
	const failed = all.filter((a) => a.status === 'failed' && a.attempts < MAX_RETRY_ATTEMPTS);

	for (const action of failed) {
		action.status = 'pending';
		action.error = null;
		await db.put('queue', action);
	}

	return failed.length;
}

export async function clearProcessedHistory(olderThanDays = 7): Promise<void> {
	const db = await getSyncDB();
	const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

	const processed = await db.getAll('processed');
	const tx = db.transaction('processed', 'readwrite');

	for (const action of processed) {
		if (action.lastAttemptAt && action.lastAttemptAt < cutoff) {
			await tx.store.delete(action.id);
		}
	}

	await tx.done;
}

export async function processQueue(): Promise<{
	processed: number;
	failed: number;
}> {
	const pending = await getPendingActions();

	if (pending.length === 0) {
		return { processed: 0, failed: 0 };
	}

	const processingIds = pending.map((a) => a.id);
	await markProcessing(processingIds);

	const results = await Promise.allSettled(
		pending.map(async (action) => {
			const handlers: Record<SyncActionType, () => Promise<void>> = {
				'quiz-answer': async () => {
					await fetch('/api/quiz/answer', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'quiz-submit': async () => {
					await fetch('/api/quiz/submit', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'flashcard-update': async () => {
					await fetch('/api/flashcards/update', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'bookmark-add': async () => {
					await fetch('/api/bookmarks', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'bookmark-remove': async () => {
					await fetch('/api/bookmarks', {
						method: 'DELETE',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'progress-update': async () => {
					await fetch('/api/progress', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'study-session-start': async () => {
					await fetch('/api/sessions/start', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'study-session-end': async () => {
					await fetch('/api/sessions/end', {
						method: 'POST',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
				'ai-message': async () => {},
				'user-preference-update': async () => {
					await fetch('/api/settings', {
						method: 'PATCH',
						body: JSON.stringify(action.payload),
						headers: { 'Content-Type': 'application/json' },
					});
				},
			};

			const handler = handlers[action.type];
			if (handler) {
				await handler();
			}
		})
	);

	const processedIds: string[] = [];
	const failedIds: string[] = [];
	const failedErrors: string[] = [];

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const action = pending[i];

		if (result.status === 'fulfilled') {
			processedIds.push(action.id);
		} else {
			failedIds.push(action.id);
			failedErrors.push(result.reason?.message ?? 'Unknown error');
		}
	}

	if (processedIds.length > 0) {
		await markCompleted(processedIds);
	}

	if (failedIds.length > 0) {
		await markFailed(failedIds, failedErrors);
	}

	return {
		processed: processedIds.length,
		failed: failedIds.length,
	};
}

export async function queueQuizAnswer(
	quizId: string,
	questionId: string,
	answer: string
): Promise<void> {
	await addToQueue(
		'quiz-answer',
		{
			quizId,
			questionId,
			answer,
			selectedAt: Date.now(),
		},
		{
			relatedIds: [quizId],
		}
	);
}

export async function queueQuizSubmit(quizId: string): Promise<void> {
	await addToQueue(
		'quiz-submit',
		{
			quizId,
			submittedAt: Date.now(),
		},
		{
			priority: 10,
			relatedIds: [quizId],
		}
	);
}

export async function queueBookmarksAdd(bookmark: {
	id: string;
	type: string;
	title: string;
}): Promise<void> {
	await addToQueue('bookmark-add', bookmark);
}

export async function queueBookmarksRemove(bookmarkId: string): Promise<void> {
	await addToQueue('bookmark-remove', { id: bookmarkId });
}

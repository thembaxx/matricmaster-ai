'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import { logger } from '@/lib/logger';
import type {
	BulkResolutionRequest,
	BulkResolutionResult,
	ConflictResolutionStrategy,
	EntityType,
	SyncConflict,
	SyncResult,
} from '@/lib/offline/types';

const log = logger.createLogger('OfflineQuizSync');

interface QuizAnswer {
	questionId: string;
	selectedOption: string;
	isCorrect: boolean;
	timeSpentMs: number;
	answeredAt: string;
}

export interface QuizSession {
	id: string;
	quizId: string;
	subject: string;
	answers: QuizAnswer[];
	currentQuestionIndex: number;
	startedAt: string;
	lastUpdatedAt: string;
	completed: boolean;
}

interface QuizOfflineDB extends DBSchema {
	quizSessions: {
		key: string;
		value: QuizSession;
		indexes: { 'by-quiz': string };
	};
	pendingSync: {
		key: string;
		value: {
			id: string;
			type: 'answer' | 'completion';
			payload: any;
			createdAt: string;
		};
	};
	syncConflicts: {
		key: string;
		value: SyncConflict;
		indexes: { 'by-entity': string; 'by-type': string };
	};
	lastSyncTime: {
		key: string;
		value: {
			key: string;
			timestamp: string;
		};
	};
}

let dbPromise: Promise<IDBPDatabase<QuizOfflineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<QuizOfflineDB>> {
	if (!dbPromise) {
		dbPromise = openDB<QuizOfflineDB>('quiz-offline-db', 2, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					const sessionStore = db.createObjectStore('quizSessions', {
						keyPath: 'id',
					});
					sessionStore.createIndex('by-quiz', 'quizId');

					db.createObjectStore('pendingSync', {
						keyPath: 'id',
					});
				}

				if (oldVersion < 2) {
					const conflictStore = db.createObjectStore('syncConflicts', {
						keyPath: 'id',
					});
					conflictStore.createIndex('by-entity', 'entityId');
					conflictStore.createIndex('by-type', 'entityType');

					db.createObjectStore('lastSyncTime', {
						keyPath: 'key',
					});
				}
			},
		});
	}
	return dbPromise;
}

export async function saveQuizProgress(
	sessionId: string,
	quizId: string,
	subject: string,
	currentQuestionIndex: number,
	answers: QuizAnswer[]
): Promise<void> {
	const db = await getDB();

	const session: QuizSession = {
		id: sessionId,
		quizId,
		subject,
		answers,
		currentQuestionIndex,
		startedAt: answers[0]?.answeredAt || new Date().toISOString(),
		lastUpdatedAt: new Date().toISOString(),
		completed: false,
	};

	await db.put('quizSessions', session);
}

export async function saveQuizAnswer(
	sessionId: string,
	quizId: string,
	subject: string,
	answer: QuizAnswer
): Promise<void> {
	const db = await getDB();

	const existingSession = await db.get('quizSessions', sessionId);

	if (existingSession) {
		const existingAnswers = existingSession.answers;
		const existingIndex = existingAnswers.findIndex((a) => a.questionId === answer.questionId);

		if (existingIndex >= 0) {
			existingAnswers[existingIndex] = answer;
		} else {
			existingAnswers.push(answer);
		}

		await db.put('quizSessions', {
			...existingSession,
			answers: existingAnswers,
			lastUpdatedAt: new Date().toISOString(),
		});
	} else {
		await db.put('quizSessions', {
			id: sessionId,
			quizId,
			subject,
			answers: [answer],
			currentQuestionIndex: 0,
			startedAt: new Date().toISOString(),
			lastUpdatedAt: new Date().toISOString(),
			completed: false,
		});
	}

	await queueForSync(sessionId, 'answer', {
		sessionId,
		quizId,
		answer,
	});
}

export async function completeQuizOffline(
	sessionId: string,
	quizId: string,
	subject: string,
	totalQuestions: number,
	score: number,
	percentage: number,
	timeTaken: number
): Promise<void> {
	const db = await getDB();

	const session = await db.get('quizSessions', sessionId);

	if (session) {
		await db.put('quizSessions', {
			...session,
			completed: true,
			currentQuestionIndex: totalQuestions,
			lastUpdatedAt: new Date().toISOString(),
		});
	}

	await queueForSync(sessionId, 'completion', {
		sessionId,
		quizId,
		subject,
		totalQuestions,
		score,
		percentage,
		timeTaken,
		answers: session?.answers || [],
	});
}

async function queueForSync(
	sessionId: string,
	type: 'answer' | 'completion',
	payload: any
): Promise<void> {
	const db = await getDB();

	await db.put('pendingSync', {
		id: `${sessionId}-${type}-${Date.now()}`,
		type,
		payload,
		createdAt: new Date().toISOString(),
	});
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | undefined> {
	const db = await getDB();
	return db.get('quizSessions', sessionId);
}

const BATCH_SIZE = 50;

async function getAllInBatches<T>(
	db: IDBPDatabase<QuizOfflineDB>,
	storeName: 'quizSessions' | 'pendingSync' | 'syncConflicts'
): Promise<T[]> {
	const results: T[] = [];
	const tx = db.transaction(storeName, 'readonly');
	let cursor = await tx.store.openCursor();

	while (cursor) {
		results.push(cursor.value as T);
		cursor = await cursor.continue();
	}

	return results;
}

async function processInBatches<T>(
	db: IDBPDatabase<QuizOfflineDB>,
	storeName: 'quizSessions' | 'pendingSync' | 'syncConflicts',
	callback: (batch: T[]) => Promise<void>
): Promise<void> {
	let offset = 0;
	let hasMore = true;

	while (hasMore) {
		const allItems = await getAllInBatches<T>(db, storeName);
		const batch = allItems.slice(offset, offset + BATCH_SIZE);

		if (batch.length === 0) {
			hasMore = false;
			break;
		}

		await callback(batch);
		offset += BATCH_SIZE;

		if (allItems.length < offset + BATCH_SIZE) {
			hasMore = false;
		}
	}
}

export async function getAllPendingSessions(): Promise<QuizSession[]> {
	const db = await getDB();
	const sessions: QuizSession[] = [];

	await processInBatches<QuizSession>(db, 'quizSessions', async (batch) => {
		sessions.push(...batch.filter((s) => !s.completed));
	});

	return sessions;
}

export async function getPendingSyncItems(): Promise<
	Array<{ id: string; type: string; payload: any; createdAt: string }>
> {
	const db = await getDB();
	const items: Array<{ id: string; type: string; payload: any; createdAt: string }> = [];

	await processInBatches<{ id: string; type: string; payload: any; createdAt: string }>(
		db,
		'pendingSync',
		async (batch) => {
			items.push(...batch);
		}
	);

	return items;
}

export async function clearPendingSyncItem(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('pendingSync', id);
}

export async function clearCompletedSession(sessionId: string): Promise<void> {
	const db = await getDB();
	await db.delete('quizSessions', sessionId);
}

export async function hasOfflineData(): Promise<boolean> {
	const db = await getDB();
	const sessions = await db.getAll('quizSessions');
	const pending = await db.getAll('pendingSync');
	return sessions.length > 0 || pending.length > 0;
}

export function isOnline(): boolean {
	if (typeof window === 'undefined') return true;
	return navigator.onLine;
}

export function registerOnlineListener(callback: (online: boolean) => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = () => callback(navigator.onLine);

	window.addEventListener('online', handler);
	window.addEventListener('offline', handler);

	return () => {
		window.removeEventListener('online', handler);
		window.removeEventListener('offline', handler);
	};
}

export async function syncAllPendingData(): Promise<{
	synced: number;
	failed: number;
}> {
	if (!isOnline()) {
		return { synced: 0, failed: 0 };
	}

	const db = await getDB();
	const pending = await db.getAll('pendingSync');

	let synced = 0;
	let failed = 0;

	for (const item of pending) {
		try {
			const response = await fetch('/api/quiz/sync-offline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(item),
			});

			if (response.ok) {
				await db.delete('pendingSync', item.id);
				synced++;
			} else {
				failed++;
			}
		} catch (err) {
			log.error('Failed to sync item', { error: err, itemId: item.id });
			failed++;
		}
	}

	return { synced, failed };
}

const ANSWERED_QUESTIONS_KEY = 'matricmaster_answered_questions';

export function getAnsweredQuestionIds(quizId: string): string[] {
	try {
		const stored = localStorage.getItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.debug('Failed to parse answered questions:', error);
		return [];
	}
}

export function markQuestionAnswered(quizId: string, questionId: string): void {
	try {
		const answered = getAnsweredQuestionIds(quizId);
		if (!answered.includes(questionId)) {
			answered.push(questionId);
			localStorage.setItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`, JSON.stringify(answered));
		}
	} catch (err) {
		log.error('Failed to mark question as answered', { error: err });
	}
}

export function isQuestionAnswered(quizId: string, questionId: string): boolean {
	return getAnsweredQuestionIds(quizId).includes(questionId);
}

export function clearAnsweredQuestions(quizId: string): void {
	try {
		localStorage.removeItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`);
	} catch (err) {
		log.error('Failed to clear answered questions', { error: err });
	}
}

export function getAllAnsweredQuestions(): Record<string, string[]> {
	const result: Record<string, string[]> = {};
	try {
		const keys = Object.keys(localStorage).filter((k) => k.startsWith(ANSWERED_QUESTIONS_KEY));
		for (const key of keys) {
			const quizId = key.replace(`${ANSWERED_QUESTIONS_KEY}_`, '');
			const stored = localStorage.getItem(key);
			if (stored) {
				result[quizId] = JSON.parse(stored);
			}
		}
	} catch (err) {
		log.error('Failed to get all answered questions', { error: err });
	}
	return result;
}

export async function detectConflicts(
	entityType: EntityType,
	entityId: string,
	localData: unknown,
	remoteData: unknown
): Promise<SyncConflict | null> {
	if (!remoteData) {
		return null;
	}

	if (!localData) {
		return null;
	}

	const localRecord = localData as Record<string, unknown>;
	const remoteRecord = remoteData as Record<string, unknown>;

	const localTime = localRecord.lastUpdatedAt
		? new Date(localRecord.lastUpdatedAt as string)
		: localRecord.createdAt
			? new Date(localRecord.createdAt as string)
			: new Date(0);

	const remoteTime = remoteRecord.lastUpdatedAt
		? new Date(remoteRecord.lastUpdatedAt as string)
		: remoteRecord.updatedAt
			? new Date(remoteRecord.updatedAt as string)
			: remoteRecord.createdAt
				? new Date(remoteRecord.createdAt as string)
				: new Date(0);

	const timeDiff = Math.abs(localTime.getTime() - remoteTime.getTime());
	const SIGNIFICANT_TIME_DIFF_MS = 1000;

	if (
		timeDiff < SIGNIFICANT_TIME_DIFF_MS &&
		JSON.stringify(localData) === JSON.stringify(remoteData)
	) {
		return null;
	}

	const hasDataDifferences = !deepEqual(localData, remoteData);
	if (!hasDataDifferences) {
		return null;
	}

	const conflict: SyncConflict = {
		id: `conflict-${entityType}-${entityId}-${Date.now()}`,
		entityType,
		entityId,
		localData,
		remoteData,
		timestamp: {
			local: localTime,
			remote: remoteTime,
		},
		resolved: false,
		createdAt: new Date(),
	};

	return conflict;
}

export function resolveConflict(
	conflict: SyncConflict,
	strategy: ConflictResolutionStrategy
): { resolvedData: unknown; resolution: ConflictResolutionStrategy } {
	switch (strategy) {
		case 'local':
			return { resolvedData: conflict.localData, resolution: 'local' };

		case 'remote':
			return { resolvedData: conflict.remoteData, resolution: 'remote' };

		case 'newest': {
			const localNewer = conflict.timestamp.local >= conflict.timestamp.remote;
			return {
				resolvedData: localNewer ? conflict.localData : conflict.remoteData,
				resolution: localNewer ? 'local' : 'remote',
			};
		}

		case 'merged': {
			const mergedData = mergeData(conflict.localData, conflict.remoteData, conflict.entityType);
			return { resolvedData: mergedData, resolution: 'merged' };
		}

		default:
			return { resolvedData: conflict.remoteData, resolution: 'remote' };
	}
}

function mergeData(localData: unknown, remoteData: unknown, entityType: EntityType): unknown {
	const local = localData as Record<string, unknown>;
	const remote = remoteData as Record<string, unknown>;
	const merged: Record<string, unknown> = { ...remote };

	for (const key of Object.keys(local)) {
		const localValue = local[key];
		const remoteValue = remote[key];

		if (remoteValue === undefined || remoteValue === null) {
			merged[key] = localValue;
		} else if (key === 'answers' && Array.isArray(localValue) && Array.isArray(remoteValue)) {
			merged[key] = mergeAnswers(localValue, remoteValue);
		} else if (key === 'score' || key === 'percentage') {
			const localNum = Number(localValue) || 0;
			const remoteNum = Number(remoteValue) || 0;
			merged[key] = Math.max(localNum, remoteNum);
		} else if (key.endsWith('At') || key === 'lastUpdatedAt') {
			const localTime = new Date(localValue as string).getTime();
			const remoteTime = new Date(remoteValue as string).getTime();
			merged[key] = localTime > remoteTime ? localValue : remoteValue;
		} else if (
			typeof localValue === 'object' &&
			typeof remoteValue === 'object' &&
			!Array.isArray(localValue)
		) {
			merged[key] = mergeData(localValue, remoteValue, entityType);
		} else {
			const localTime = new Date(
				(local.lastUpdatedAt as string) || (local.createdAt as string) || 0
			).getTime();
			const remoteTime = new Date(
				(remote.lastUpdatedAt as string) || (remote.createdAt as string) || 0
			).getTime();
			merged[key] = localTime >= remoteTime ? localValue : remoteValue;
		}
	}

	return merged;
}

function mergeAnswers(
	localAnswers: Array<Record<string, unknown>>,
	remoteAnswers: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
	const merged = new Map<string, Record<string, unknown>>();

	for (const answer of remoteAnswers) {
		const questionId = answer.questionId as string;
		if (questionId) {
			merged.set(questionId, { ...answer });
		}
	}

	for (const answer of localAnswers) {
		const questionId = answer.questionId as string;
		if (!questionId) continue;

		const existing = merged.get(questionId);
		if (!existing) {
			merged.set(questionId, { ...answer });
		} else {
			const localTime = new Date(answer.answeredAt as string).getTime();
			const remoteTime = new Date(existing.answeredAt as string).getTime();
			if (localTime >= remoteTime) {
				merged.set(questionId, { ...existing, ...answer });
			}
		}
	}

	return Array.from(merged.values());
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (typeof a !== typeof b) return false;

	if (typeof a === 'object') {
		if (Array.isArray(a) !== Array.isArray(b)) return false;

		const aObj = a as Record<string, unknown>;
		const bObj = b as Record<string, unknown>;
		const aKeys = Object.keys(aObj);
		const bKeys = Object.keys(bObj);

		if (aKeys.length !== bKeys.length) return false;

		return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
	}

	return false;
}

export async function storeConflict(conflict: SyncConflict): Promise<void> {
	const db = await getDB();
	await db.put('syncConflicts', conflict);
}

export async function getPendingConflicts(): Promise<SyncConflict[]> {
	const db = await getDB();
	const conflicts = await db.getAll('syncConflicts');
	return conflicts.filter((c) => !c.resolved);
}

export async function getConflictById(conflictId: string): Promise<SyncConflict | undefined> {
	const db = await getDB();
	return db.get('syncConflicts', conflictId);
}

export async function markConflictResolved(
	conflictId: string,
	resolution: ConflictResolutionStrategy
): Promise<void> {
	const db = await getDB();
	const conflict = await db.get('syncConflicts', conflictId);

	if (conflict) {
		await db.put('syncConflicts', {
			...conflict,
			resolved: true,
			resolution,
		});
	}
}

export async function deleteConflict(conflictId: string): Promise<void> {
	const db = await getDB();
	await db.delete('syncConflicts', conflictId);
}

export async function clearResolvedConflicts(): Promise<void> {
	const db = await getDB();
	const conflicts = await db.getAll('syncConflicts');
	const resolvedConflicts = conflicts.filter((c) => c.resolved);

	const tx = db.transaction('syncConflicts', 'readwrite');
	for (const conflict of resolvedConflicts) {
		await tx.store.delete(conflict.id);
	}
	await tx.done;
}

export async function resolveAllConflicts(
	request: BulkResolutionRequest
): Promise<BulkResolutionResult> {
	const result: BulkResolutionResult = {
		success: true,
		resolved: 0,
		failed: 0,
		errors: [],
	};

	const db = await getDB();

	for (const resolution of request.resolutions) {
		try {
			const conflict = await db.get('syncConflicts', resolution.conflictId);

			if (!conflict) {
				result.failed++;
				result.errors.push(`Conflict ${resolution.conflictId} not found`);
				continue;
			}

			await markConflictResolved(resolution.conflictId, resolution.strategy);

			log.info('Conflict resolved', {
				conflictId: resolution.conflictId,
				strategy: resolution.strategy,
				entityType: conflict.entityType,
			});

			result.resolved++;
		} catch (error) {
			result.failed++;
			result.errors.push(
				`Failed to resolve ${resolution.conflictId}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	result.success = result.failed === 0;
	return result;
}

export async function getLastSyncTime(): Promise<Date | null> {
	try {
		const db = await getDB();
		const entry = await db.get('lastSyncTime', 'lastSync');
		return entry ? new Date(entry.timestamp) : null;
	} catch (error) {
		console.debug('Failed to get last sync time:', error);
		return null;
	}
}

export async function setLastSyncTime(time: Date = new Date()): Promise<void> {
	const db = await getDB();
	await db.put('lastSyncTime', {
		key: 'lastSync',
		timestamp: time.toISOString(),
	});
}

export async function syncWithConflictDetection(): Promise<SyncResult> {
	const result: SyncResult = {
		success: true,
		synced: 0,
		conflicts: [],
		errors: [],
		timestamp: new Date(),
	};

	if (!isOnline()) {
		result.success = false;
		result.errors.push('Cannot sync while offline');
		return result;
	}

	const db = await getDB();
	const pending = await db.getAll('pendingSync');

	for (const item of pending) {
		try {
			const response = await fetch('/api/quiz/sync-offline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(item),
			});

			if (response.ok) {
				const data = await response.json();

				if (data.conflict) {
					const entityType = item.type === 'completion' ? 'quiz_result' : 'progress';
					const conflict = await detectConflicts(
						entityType,
						item.payload.sessionId,
						item.payload,
						data.remoteData
					);

					if (conflict) {
						await storeConflict(conflict);
						result.conflicts.push(conflict);
					} else {
						await db.delete('pendingSync', item.id);
						result.synced++;
					}
				} else {
					await db.delete('pendingSync', item.id);
					result.synced++;
				}
			} else if (response.status === 409) {
				const conflictData = await response.json();
				const entityType = item.type === 'completion' ? 'quiz_result' : 'progress';
				const conflict = await detectConflicts(
					entityType,
					item.payload.sessionId,
					item.payload,
					conflictData.remoteData
				);

				if (conflict) {
					await storeConflict(conflict);
					result.conflicts.push(conflict);
				}
			} else {
				result.errors.push(`Failed to sync ${item.id}: ${response.statusText}`);
			}
		} catch (error) {
			log.error('Failed to sync item', { error, itemId: item.id });
			result.errors.push(
				`Error syncing ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	await setLastSyncTime(result.timestamp);

	result.success = result.errors.length === 0;
	return result;
}

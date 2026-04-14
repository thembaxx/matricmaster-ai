/**
 * Conflict Resolution for Offline Sync
 *
 * Handles detection and resolution of sync conflicts between
 * local (IndexedDB) and remote (PostgreSQL) data.
 */

import type { ConflictResolutionStrategy } from './types';

export interface StoredConflict {
	id: string;
	entityType: string;
	entityId: string;
	localData: unknown;
	remoteData: unknown;
	timestamp: { local: Date; remote: Date };
	resolved: boolean;
	resolution?: ConflictResolutionStrategy;
	createdAt: Date;
}

const CONFLICTS_STORE = 'sync-conflicts';

function openConflictsDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('lumni-conflicts', 1);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(CONFLICTS_STORE)) {
				db.createObjectStore(CONFLICTS_STORE, { keyPath: 'id' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function getAllConflicts(): Promise<StoredConflict[]> {
	const db = await openConflictsDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(CONFLICTS_STORE, 'readonly');
		const store = tx.objectStore(CONFLICTS_STORE);
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result || []);
		request.onerror = () => reject(request.error);
	});
}

async function saveConflict(conflict: StoredConflict): Promise<void> {
	const db = await openConflictsDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(CONFLICTS_STORE, 'readwrite');
		const store = tx.objectStore(CONFLICTS_STORE);
		const request = store.put(conflict);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

async function deleteConflict(id: string): Promise<void> {
	const db = await openConflictsDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(CONFLICTS_STORE, 'readwrite');
		const store = tx.objectStore(CONFLICTS_STORE);
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Get all unresolved conflicts
 */
export async function getConflicts(): Promise<StoredConflict[]> {
	try {
		const conflicts = await getAllConflicts();
		return conflicts.filter((c) => !c.resolved);
	} catch {
		return [];
	}
}

/**
 * Add a new conflict to the store
 */
export async function addConflict(conflict: Omit<StoredConflict, 'createdAt'>): Promise<void> {
	const storedConflict: StoredConflict = {
		...conflict,
		createdAt: new Date(),
	};
	await saveConflict(storedConflict);
}

/**
 * Resolve conflicts using the specified strategy
 */
export async function resolveConflicts(
	resolutions: Array<{ conflictId: string; strategy: ConflictResolutionStrategy }>
): Promise<{ success: boolean; resolved: number; errors: string[] }> {
	const errors: string[] = [];
	let resolved = 0;

	for (const { conflictId, strategy } of resolutions) {
		try {
			const conflicts = await getAllConflicts();
			const conflict = conflicts.find((c) => c.id === conflictId);

			if (!conflict) {
				errors.push(`Conflict ${conflictId} not found`);
				continue;
			}

			// Determine which data to keep based on strategy
			let resolvedData: unknown;
			switch (strategy) {
				case 'local':
					resolvedData = conflict.localData;
					break;
				case 'remote':
					resolvedData = conflict.remoteData;
					break;
				case 'newest': {
					const localTime = new Date(conflict.timestamp.local).getTime();
					const remoteTime = new Date(conflict.timestamp.remote).getTime();
					resolvedData = localTime > remoteTime ? conflict.localData : conflict.remoteData;
					break;
				}
				case 'merged':
					resolvedData = mergeData(conflict.localData, conflict.remoteData);
					break;
				default: {
					// Default to newest
					const t1 = new Date(conflict.timestamp.local).getTime();
					const t2 = new Date(conflict.timestamp.remote).getTime();
					resolvedData = t1 > t2 ? conflict.localData : conflict.remoteData;
				}
			}

			// Apply the resolved data
			await applyResolvedData(conflict.entityType, conflict.entityId, resolvedData);

			// Mark as resolved
			conflict.resolved = true;
			conflict.resolution = strategy;
			await saveConflict(conflict);

			resolved++;
		} catch (error) {
			errors.push(`Failed to resolve conflict ${conflictId}: ${error}`);
		}
	}

	return { success: errors.length === 0, resolved, errors };
}

/**
 * Merge local and remote data
 */
function mergeData(local: unknown, remote: unknown): unknown {
	if (!local) return remote;
	if (!remote) return local;

	if (typeof local !== 'object' || typeof remote !== 'object') {
		return local; // Default to local for primitives
	}

	if (Array.isArray(local) && Array.isArray(remote)) {
		// Merge arrays - combine unique items
		return [...new Set([...local, ...remote])];
	}

	// Merge objects - local takes precedence but fill in missing keys
	const localRecord = local as Record<string, unknown>;
	const remoteRecord = remote as Record<string, unknown>;
	const merged = { ...remoteRecord };

	for (const key in localRecord) {
		if (localRecord[key] !== undefined) {
			merged[key] = localRecord[key];
		}
	}
	return merged;
}

/**
 * Apply resolved data to local storage or send to server
 */
async function applyResolvedData(
	entityType: string,
	entityId: string,
	data: unknown
): Promise<void> {
	// Update local IndexedDB
	await updateLocalData(entityType, entityId, data);

	// Queue for sync to server
	await queueSyncToServer(entityType, entityId, data);
}

async function updateLocalData(entityType: string, entityId: string, data: unknown): Promise<void> {
	// This would update the local IndexedDB with the resolved data
	// The actual implementation depends on your local storage structure
	console.log(`[ConflictResolver] Updating local ${entityType}:${entityId}`, data);
}

async function queueSyncToServer(
	entityType: string,
	entityId: string,
	data: unknown
): Promise<void> {
	// Queue the resolved data to be pushed to the server
	// This uses the existing sync queue mechanism
	if (typeof window !== 'undefined') {
		try {
			const { addToSyncQueue } = await import('@/lib/deviceSync');
			await addToSyncQueue({
				entityType: entityType as 'studySession' | 'quizProgress' | 'settings' | 'flashcardReview',
				entityId,
				action: 'update',
				data: data as Record<string, unknown>,
				deviceId: '',
			});
		} catch (error) {
			console.error('Failed to queue sync after conflict resolution:', error);
		}
	}
}

/**
 * Clear all resolved conflicts
 */
export async function clearResolvedConflicts(): Promise<void> {
	const conflicts = await getAllConflicts();
	for (const conflict of conflicts) {
		if (conflict.resolved) {
			await deleteConflict(conflict.id);
		}
	}
}

/**
 * Get conflict count
 */
export async function getConflictCount(): Promise<number> {
	const conflicts = await getConflicts();
	return conflicts.length;
}

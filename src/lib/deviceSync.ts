import { nanoid } from 'nanoid';

export interface DeviceInfo {
	deviceId: string;
	deviceName: string;
	deviceType: 'desktop' | 'mobile' | 'tablet';
	lastActiveAt: Date;
	isCurrentDevice: boolean;
}

export interface SyncQueueItem {
	id: string;
	entityType: 'studySession' | 'quizProgress' | 'settings' | 'flashcardReview';
	entityId: string;
	action: 'create' | 'update' | 'delete';
	data: Record<string, unknown>;
	timestamp: Date;
	deviceId: string;
	processed: boolean;
}

const DEVICE_ID_KEY = 'matricmaster_device_id';
const DEVICE_NAME_KEY = 'matricmaster_device_name';

const DB_NAME = 'lumni-device-sync';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

function openSyncDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function getSyncQueueFromDB(): Promise<SyncQueueItem[]> {
	const db = await openSyncDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const request = store.getAll();
		request.onsuccess = () => resolve((request.result || []) as SyncQueueItem[]);
		request.onerror = () => reject(request.error);
	});
}

async function addToSyncQueueDB(item: SyncQueueItem): Promise<void> {
	const db = await openSyncDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.put(item);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

async function removeFromSyncQueueDB(id: string): Promise<void> {
	const db = await openSyncDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

async function clearSyncQueueDB(): Promise<void> {
	const db = await openSyncDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.clear();
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export function getOrCreateDeviceId(): string {
	if (typeof window === 'undefined') return '';
	const existingId = localStorage.getItem(DEVICE_ID_KEY);
	if (existingId) return existingId;
	const newDeviceId = nanoid();
	localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
	return newDeviceId;
}

export function getDeviceName(): string {
	if (typeof window === 'undefined') return 'Unknown';
	let name = localStorage.getItem(DEVICE_NAME_KEY);
	if (!name) {
		const ua = navigator.userAgent;
		if (/mobile/i.test(ua)) {
			name = 'Mobile Device';
		} else if (/tablet/i.test(ua) || /ipad/i.test(ua)) {
			name = 'Tablet';
		} else {
			name = 'Desktop';
		}
		localStorage.setItem(DEVICE_NAME_KEY, name);
	}
	return name;
}

export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
	if (typeof window === 'undefined') return 'desktop';
	const ua = navigator.userAgent;
	if (/mobile/i.test(ua)) return 'mobile';
	if (/tablet/i.test(ua) || /ipad/i.test(ua)) return 'tablet';
	return 'desktop';
}

export function getCurrentDeviceInfo(): DeviceInfo {
	return {
		deviceId: getOrCreateDeviceId(),
		deviceName: getDeviceName(),
		deviceType: getDeviceType(),
		lastActiveAt: new Date(),
		isCurrentDevice: true,
	};
}

export async function addToSyncQueue(
	item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'processed'>
): Promise<void> {
	if (typeof window === 'undefined') return;
	const newItem: SyncQueueItem = {
		...item,
		id: nanoid(),
		timestamp: new Date(),
		processed: false,
	};
	await addToSyncQueueDB(newItem);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
	if (typeof window === 'undefined') return [];
	try {
		return await getSyncQueueFromDB();
	} catch {
		return [];
	}
}

export async function clearSyncQueue(): Promise<void> {
	if (typeof window === 'undefined') return;
	await clearSyncQueueDB();
}

export async function removeSyncQueueItem(id: string): Promise<void> {
	if (typeof window === 'undefined') return;
	await removeFromSyncQueueDB(id);
}

export async function markSyncQueueItemProcessed(id: string): Promise<void> {
	if (typeof window === 'undefined') return;
	const queue = await getSyncQueue();
	const item = queue.find((i) => i.id === id);
	if (item) {
		item.processed = true;
		await addToSyncQueueDB(item);
	}
}

export function resolveStudySessionConflict(
	local: { startedAt: Date; durationMinutes?: number },
	remote: { startedAt: Date; durationMinutes?: number }
): { startedAt: Date; durationMinutes?: number } {
	if (new Date(remote.startedAt) > new Date(local.startedAt)) {
		return remote;
	}
	return local;
}

export function mergeQuizProgress(local: string[], remote: string[]): string[] {
	const merged = new Set([...local, ...remote]);
	return Array.from(merged);
}

export function resolveSettingsConflict<T extends Record<string, unknown>>(
	local: { data: T; updatedAt: Date },
	remote: { data: T; updatedAt: Date }
): T {
	if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
		return remote.data;
	}
	return local.data;
}

export function isOnline(): boolean {
	if (typeof window === 'undefined') return true;
	return navigator.onLine;
}

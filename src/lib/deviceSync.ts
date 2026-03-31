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
const SYNC_QUEUE_KEY = 'matricmaster_sync_queue';

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

export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'processed'>): void {
	if (typeof window === 'undefined') return;
	const queue = getSyncQueue();
	const newItem: SyncQueueItem = {
		...item,
		id: nanoid(),
		timestamp: new Date(),
		processed: false,
	};
	queue.push(newItem);
	localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getSyncQueue(): SyncQueueItem[] {
	if (typeof window === 'undefined') return [];
	const data = localStorage.getItem(SYNC_QUEUE_KEY);
	if (!data) return [];
	try {
		return JSON.parse(data);
	} catch {
		return [];
	}
}

export function clearSyncQueue(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(SYNC_QUEUE_KEY);
}

export function removeSyncQueueItem(id: string): void {
	if (typeof window === 'undefined') return;
	const queue = getSyncQueue().filter((item) => item.id !== id);
	localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function markSyncQueueItemProcessed(id: string): void {
	if (typeof window === 'undefined') return;
	const queue = getSyncQueue();
	const item = queue.find((i) => i.id === id);
	if (item) {
		item.processed = true;
		localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
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

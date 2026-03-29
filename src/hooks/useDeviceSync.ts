'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSyncQueue, isOnline, removeSyncQueueItem, type SyncQueueItem } from '@/lib/deviceSync';

interface UseDeviceSyncOptions {
	onSync?: (item: SyncQueueItem) => Promise<void>;
	autoSync?: boolean;
}

interface UseDeviceSyncReturn {
	isOnline: boolean;
	lastSyncedAt: Date | null;
	pendingCount: number;
	syncNow: () => Promise<void>;
	isSyncing: boolean;
}

export function useDeviceSync(options: UseDeviceSyncOptions = {}): UseDeviceSyncReturn {
	const { onSync, autoSync = true } = options;
	const [onlineStatus, setOnlineStatus] = useState(true);
	const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);
	const [pendingCount, setPendingCount] = useState(0);

	const updatePendingCount = useCallback(() => {
		const queue = getSyncQueue();
		setPendingCount(queue.filter((item) => !item.processed).length);
	}, []);

	const syncNow = useCallback(async () => {
		if (!isOnline()) return;
		setIsSyncing(true);
		const queue = getSyncQueue().filter((item) => !item.processed);
		for (const item of queue) {
			try {
				if (onSync) {
					await onSync(item);
				}
				removeSyncQueueItem(item.id);
			} catch (error) {
				console.error('Sync failed for item:', item.id, error);
			}
		}
		setLastSyncedAt(new Date());
		updatePendingCount();
		setIsSyncing(false);
	}, [onSync, updatePendingCount]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setOnlineStatus(navigator.onLine);
		updatePendingCount();

		const handleOnline = () => {
			setOnlineStatus(true);
			if (autoSync) {
				syncNow();
			}
		};
		const handleOffline = () => setOnlineStatus(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		const interval = setInterval(updatePendingCount, 30000);
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, [autoSync, syncNow, updatePendingCount]);

	return {
		isOnline: onlineStatus,
		lastSyncedAt,
		pendingCount,
		syncNow,
		isSyncing,
	};
}

export function useCurrentDevice() {
	const [deviceId, setDeviceId] = useState('');
	const [deviceName, setDeviceName] = useState('');

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const { getOrCreateDeviceId, getDeviceName } = require('@/lib/deviceSync');
		setDeviceId(getOrCreateDeviceId());
		setDeviceName(getDeviceName());
	}, []);

	return { deviceId, deviceName };
}

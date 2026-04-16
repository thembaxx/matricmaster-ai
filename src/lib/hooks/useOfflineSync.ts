'use client';

import { useEffect, useRef } from 'react';
import { getQueueStats, processQueue, retryFailed } from '@/lib/offline/sync-manager';
import { useOfflineStore } from '@/stores/useOfflineStore';

export function useOfflineSync() {
	const { isOnline } = useOfflineStore();
	const lastOnlineRef = useRef<boolean>(true);
	const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isSyncingRef = useRef(false);

	useEffect(() => {
		const wasOffline = !lastOnlineRef.current;
		const isNowOnline = isOnline;

		if (wasOffline && isNowOnline && !isSyncingRef.current) {
			isSyncingRef.current = true;

			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}

			syncTimeoutRef.current = setTimeout(async () => {
				try {
					const stats = await getQueueStats();

					if (stats.pending > 0 || stats.failed > 0) {
						const result = await processQueue();

						console.debug('Offline sync completed:', result);
					}

					if (stats.failed > 0) {
						await retryFailed();
					}
				} catch (error) {
					console.error('Offline sync failed:', error);
				} finally {
					isSyncingRef.current = false;
				}
			}, 2000);
		}

		lastOnlineRef.current = isNowOnline;

		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [isOnline]);

	return null;
}

export function useAutoSync() {
	return useOfflineSync();
}

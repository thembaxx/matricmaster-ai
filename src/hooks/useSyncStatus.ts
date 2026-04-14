/**
 * useSyncStatus Hook
 *
 * Purpose: Provide real-time sync status information
 * for offline/online state and conflict resolution.
 */

import { useCallback, useEffect, useState } from 'react';
import type { SyncQueueItem } from '@/lib/deviceSync';
import { getSyncQueue, isOnline } from '@/lib/deviceSync';
import type { ConflictResolutionStrategy, SyncConflict } from '@/lib/offline/types';

export interface ConflictResolutionInput {
	conflictId: string;
	strategy: ConflictResolutionStrategy;
}

export interface SyncStatus {
	isOnline: boolean;
	pendingCount: number;
	conflictCount: number;
	syncQueue: SyncQueueItem[];
	conflicts: SyncConflict[];
	resolveConflicts: (items: ConflictResolutionInput[]) => Promise<void>;
}

export function useSyncStatus(): SyncStatus {
	const [status, setStatus] = useState<SyncStatus>({
		isOnline: true,
		pendingCount: 0,
		conflictCount: 0,
		syncQueue: [],
		conflicts: [],
		resolveConflicts: async () => {},
	});

	// Check online status
	useEffect(() => {
		const updateOnlineStatus = async () => {
			const online = await isOnline();
			setStatus((prev) => ({ ...prev, isOnline: online }));
		};

		updateOnlineStatus();

		const handleOnline = () => setStatus((prev) => ({ ...prev, isOnline: true }));
		const handleOffline = () => setStatus((prev) => ({ ...prev, isOnline: false }));

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Check sync queue
	useEffect(() => {
		const updateSyncQueue = async () => {
			const queue = await getSyncQueue();
			const pendingItems = queue.filter((item) => !item.processed);

			setStatus((prev) => ({
				...prev,
				syncQueue: queue,
				pendingCount: pendingItems.length,
			}));
		};

		updateSyncQueue();

		// Poll for updates
		const interval = setInterval(updateSyncQueue, 5000);

		return () => clearInterval(interval);
	}, []);

	// Check for conflicts
	useEffect(() => {
		const detectConflicts = async () => {
			try {
				// Import conflict resolver dynamically
				const { getConflicts } = await import('@/lib/offline/conflict-resolver');
				const conflicts = await getConflicts();

				setStatus((prev) => ({
					...prev,
					conflictCount: conflicts.length,
					conflicts: conflicts.map((c) => ({
						id: c.id,
						entityType: c.entityType as 'quiz_result' | 'progress' | 'achievement' | 'quiz_session',
						entityId: c.entityId,
						localData: c.localData,
						remoteData: c.remoteData,
						timestamp: c.timestamp,
						resolved: c.resolved,
						resolution: c.resolution,
						createdAt: c.createdAt,
					})),
				}));
			} catch (error) {
				console.error('Failed to detect conflicts:', error);
				setStatus((prev) => ({
					...prev,
					conflictCount: 0,
					conflicts: [],
				}));
			}
		};

		detectConflicts();

		// Poll for conflicts periodically
		const interval = setInterval(detectConflicts, 10000);

		return () => clearInterval(interval);
	}, []);

	const resolveConflicts = useCallback(async (items: ConflictResolutionInput[]) => {
		try {
			// Import conflict resolver dynamically
			const { resolveConflicts: doResolve } = await import('@/lib/offline/conflict-resolver');

			await doResolve(
				items.map((item) => ({
					conflictId: item.conflictId,
					strategy: item.strategy,
				}))
			);

			setStatus((prev) => ({
				...prev,
				conflictCount: Math.max(0, prev.conflictCount - items.length),
				conflicts: prev.conflicts.filter((c) => !items.some((i) => i.conflictId === c.id)),
			}));
		} catch (error) {
			console.error('Failed to resolve conflicts:', error);
			throw error;
		}
	}, []);

	return { ...status, resolveConflicts };
}

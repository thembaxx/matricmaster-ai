'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import type { SyncConflict, SyncStatusState } from '@/lib/offline/types';
import {
	getPendingSyncItems,
	isOnline,
	registerOnlineListener,
	syncAllPendingData,
} from '@/services/offlineQuizSync';

const log = logger.createLogger('useSyncStatus');

const INITIAL_STATE: SyncStatusState = {
	status: 'idle',
	lastSyncTime: null,
	pendingCount: 0,
	conflictCount: 0,
};

export function useSyncStatus() {
	const [state, setState] = useState<SyncStatusState>(INITIAL_STATE);
	const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

	const updatePendingCount = useCallback(async () => {
		try {
			const pending = await getPendingSyncItems();
			setState((prev) => ({
				...prev,
				pendingCount: pending.length,
				status: pending.length > 0 && prev.status !== 'syncing' ? prev.status : prev.status,
			}));
		} catch (error) {
			log.error('Failed to get pending count', { error });
		}
	}, []);

	const triggerSync = useCallback(async () => {
		if (!isOnline()) {
			setState((prev) => ({
				...prev,
				status: 'error',
				errorMessage: 'Cannot sync while offline',
			}));
			return;
		}

		setState((prev) => ({
			...prev,
			status: 'syncing',
			errorMessage: undefined,
		}));

		try {
			const result = await syncAllPendingData();

			if (conflicts.length > 0) {
				setState((prev) => ({
					...prev,
					status: 'conflicts',
					lastSyncTime: new Date(),
					pendingCount: prev.pendingCount - result.synced,
					conflictCount: conflicts.length,
				}));
			} else {
				setState((prev) => ({
					...prev,
					status: result.failed > 0 ? 'error' : 'synced',
					lastSyncTime: new Date(),
					pendingCount: prev.pendingCount - result.synced,
					conflictCount: 0,
					errorMessage: result.failed > 0 ? `Failed to sync ${result.failed} items` : undefined,
				}));
			}
		} catch (error) {
			log.error('Sync failed', { error });
			setState((prev) => ({
				...prev,
				status: 'error',
				errorMessage: error instanceof Error ? error.message : 'Sync failed',
			}));
		}
	}, [conflicts.length]);

	const resolveConflicts = useCallback(
		async (
			resolutions: Array<{ conflictId: string; strategy: 'local' | 'remote' | 'newest' | 'merged' }>
		) => {
			setState((prev) => ({ ...prev, status: 'syncing' }));

			try {
				const response = await fetch('/api/sync/resolve-conflicts', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ resolutions }),
				});

				if (!response.ok) {
					throw new Error(`Failed to resolve conflicts: ${response.statusText}`);
				}

				const result = await response.json();

				setConflicts((prev) => prev.filter((c) => !resolutions.some((r) => r.conflictId === c.id)));

				setState((prev) => ({
					...prev,
					status: 'synced',
					conflictCount: 0,
					lastSyncTime: new Date(),
				}));

				return result;
			} catch (error) {
				log.error('Failed to resolve conflicts', { error });
				setState((prev) => ({
					...prev,
					status: 'error',
					errorMessage: 'Failed to resolve conflicts',
				}));
				throw error;
			}
		},
		[]
	);

	const clearConflict = useCallback((conflictId: string) => {
		setConflicts((prev) => {
			const updated = prev.filter((c) => c.id !== conflictId);
			setState((s) => ({
				...s,
				conflictCount: updated.length,
				status: updated.length === 0 ? 'synced' : 'conflicts',
			}));
			return updated;
		});
	}, []);

	const addConflict = useCallback((conflict: SyncConflict) => {
		setConflicts((prev) => {
			if (prev.some((c) => c.id === conflict.id)) {
				return prev;
			}
			const updated = [...prev, conflict];
			setState((s) => ({
				...s,
				conflictCount: updated.length,
				status: 'conflicts',
			}));
			return updated;
		});
	}, []);

	useEffect(() => {
		updatePendingCount();

		const cleanup = registerOnlineListener((online) => {
			if (online) {
				log.info('Network restored, triggering sync');
				triggerSync();
			}
		});

		return cleanup;
	}, [updatePendingCount, triggerSync]);

	return {
		...state,
		conflicts,
		triggerSync,
		resolveConflicts,
		clearConflict,
		addConflict,
		refreshPendingCount: updatePendingCount,
	};
}

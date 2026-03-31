'use client';
/* eslint-disable react-hooks/setState-in-use-effect */

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { initializeOfflineData } from '@/lib/offline';
import { type CachedTask, getCachedTaskCount, getCachedTasks } from '@/lib/offline/task-cache';
import type { SyncConflict } from '@/lib/offline/types';
import { storeConflict, syncWithConflictDetection } from '@/services/offlineQuizSync';

interface OfflineContextType {
	isOffline: boolean;
	cachedTaskCount: number;
	cachedTasks: CachedTask[];
	isSyncing: boolean;
	conflictCount: number;
	pendingSyncCount: number;
	refreshTaskCount: () => Promise<void>;
	triggerSync: () => Promise<void>;
	getConflicts: () => Promise<SyncConflict[]>;
}

const OfflineContext = createContext<OfflineContextType>({
	isOffline: false,
	cachedTaskCount: 0,
	cachedTasks: [],
	isSyncing: false,
	conflictCount: 0,
	pendingSyncCount: 0,
	refreshTaskCount: async () => {},
	triggerSync: async () => {},
	getConflicts: async () => [],
});

export function OfflineProvider({ children }: { children: ReactNode }) {
	const [offline, setOffline] = useState(() => !navigator.onLine);
	const [cachedCount, setCachedCount] = useState(0);
	const [cachedTasks, setCachedTasks] = useState<CachedTask[]>([]);
	const [isSyncing, setIsSyncing] = useState(false);
	const [conflictCount, setConflictCount] = useState(0);
	const [pendingSyncCount] = useState(0);

	const refreshTaskCount = useCallback(async () => {
		try {
			const count = await getCachedTaskCount();
			const tasks = await getCachedTasks();
			setCachedCount(count);
			setCachedTasks(tasks);
		} catch (error) {
			console.warn('Failed to refresh task count:', error);
		}
	}, []);

	const triggerSync = useCallback(async () => {
		if (offline || isSyncing) return;

		setIsSyncing(true);
		try {
			const result = await syncWithConflictDetection();
			setConflictCount(result.conflicts.length);

			if (result.conflicts.length > 0) {
				for (const conflict of result.conflicts) {
					await storeConflict(conflict);
				}
			}

			await refreshTaskCount();
		} catch (error) {
			console.error('Sync failed:', error);
		} finally {
			setIsSyncing(false);
		}
	}, [offline, isSyncing, refreshTaskCount]);

	const getConflicts = useCallback(async () => {
		const { getPendingConflicts } = await import('@/services/offlineQuizSync');
		const conflicts = await getPendingConflicts();
		setConflictCount(conflicts.length);
		return conflicts;
	}, []);

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		initializeOfflineData().then(async () => {
			await refreshTaskCount();
		});

		const handleOnline = async () => {
			setOffline(false);
			await triggerSync();
		};
		const handleOffline = () => setOffline(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		const interval = setInterval(refreshTaskCount, 30000);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, [refreshTaskCount, triggerSync]);

	return (
		<OfflineContext.Provider
			value={{
				isOffline: offline,
				cachedTaskCount: cachedCount,
				cachedTasks,
				isSyncing,
				conflictCount,
				pendingSyncCount,
				refreshTaskCount,
				triggerSync,
				getConflicts,
			}}
		>
			{children}
		</OfflineContext.Provider>
	);
}

export const useOffline = () => useContext(OfflineContext);

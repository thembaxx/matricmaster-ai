'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { initializeOfflineData } from '@/lib/offline';
import { type CachedTask, getCachedTaskCount, getCachedTasks } from '@/lib/offline/task-cache';

interface OfflineContextType {
	isOffline: boolean;
	cachedTaskCount: number;
	cachedTasks: CachedTask[];
	isSyncing: boolean;
	refreshTaskCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
	isOffline: false,
	cachedTaskCount: 0,
	cachedTasks: [],
	isSyncing: false,
	refreshTaskCount: async () => {},
});

export function OfflineProvider({ children }: { children: ReactNode }) {
	const [offline, setOffline] = useState(false);
	const [cachedCount, setCachedCount] = useState(0);
	const [cachedTasks, setCachedTasks] = useState<CachedTask[]>([]);
	const [isSyncing, setIsSyncing] = useState(false);

	const refreshTaskCount = useCallback(async () => {
		try {
			const count = await getCachedTaskCount();
			const tasks = await getCachedTasks();
			setCachedCount(count);
			setCachedTasks(tasks);
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		initializeOfflineData().then(async () => {
			await refreshTaskCount();
		});

		setOffline(!navigator.onLine);

		const handleOnline = async () => {
			setOffline(false);
			setIsSyncing(true);
			setTimeout(() => setIsSyncing(false), 1000);
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
	}, [refreshTaskCount]);

	return (
		<OfflineContext.Provider
			value={{
				isOffline: offline,
				cachedTaskCount: cachedCount,
				cachedTasks,
				isSyncing,
				refreshTaskCount,
			}}
		>
			{children}
		</OfflineContext.Provider>
	);
}

export const useOffline = () => useContext(OfflineContext);

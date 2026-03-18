'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { initializeOfflineData } from '@/lib/offline';
import { getCachedTaskCount } from '@/lib/offline/task-cache';

interface OfflineContextType {
	isOffline: boolean;
	cachedTaskCount: number;
	isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
	isOffline: false,
	cachedTaskCount: 0,
	isSyncing: false,
});

export function OfflineProvider({ children }: { children: ReactNode }) {
	const [offline, setOffline] = useState(false);
	const [cachedCount, setCachedCount] = useState(0);
	const [isSyncing, setIsSyncing] = useState(false);

	useEffect(() => {
		initializeOfflineData().then(async () => {
			const count = await getCachedTaskCount();
			setCachedCount(count);
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

		const interval = setInterval(async () => {
			const count = await getCachedTaskCount();
			setCachedCount(count);
		}, 30000);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearInterval(interval);
		};
	}, []);

	return (
		<OfflineContext.Provider
			value={{ isOffline: offline, cachedTaskCount: cachedCount, isSyncing }}
		>
			{children}
		</OfflineContext.Provider>
	);
}

export const useOffline = () => useContext(OfflineContext);

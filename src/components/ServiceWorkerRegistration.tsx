'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/stores/useOfflineStore';

export function ServiceWorkerRegistration() {
	const setOnlineStatus = useOfflineStore((state) => state.setOnlineStatus);

	useEffect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch((error) => {
				console.error('Service worker registration failed:', error);
			});
		}

		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		setOnlineStatus(navigator.onLine);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [setOnlineStatus]);

	return null;
}

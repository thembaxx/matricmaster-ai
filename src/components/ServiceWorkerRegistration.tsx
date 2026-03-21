'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/stores/useOfflineStore';

declare global {
	interface Window {
		workbox: unknown;
	}
}

export function ServiceWorkerRegistration() {
	const setOnlineStatus = useOfflineStore((state) => state.setOnlineStatus);

	useEffect(() => {
		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		setOnlineStatus(navigator.onLine);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready
				.then((registration) => {
					console.debug('Service worker ready:', registration);
				})
				.catch((error) => {
					console.warn('Service worker not ready:', error);
				});
		}

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [setOnlineStatus]);

	return null;
}

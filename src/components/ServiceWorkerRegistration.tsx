'use client';
/* eslint-disable react-hooks/setState-in-use-effect */

import { useEffect } from 'react';
import { useOfflineStore } from '@/stores/useOfflineStore';

declare global {
	interface Window {
		workbox: unknown;
	}
}

export function ServiceWorkerRegistration() {
	const { isOnline, setOnlineStatus } = useOfflineStore();

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		if (navigator.onLine !== isOnline) {
			setOnlineStatus(navigator.onLine);
		}

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
	}, [setOnlineStatus, isOnline]);

	return null;
}

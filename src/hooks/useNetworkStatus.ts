'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UseNetworkStatusReturn {
	isOnline: boolean;
	wasOffline: boolean;
}

const OFFLINE_GRACE_PERIOD_MS = 5000;

export function useNetworkStatus(): UseNetworkStatusReturn {
	const [isOnline, setIsOnline] = useState(true);
	const [wasOffline, setWasOffline] = useState(false);
	const [offlineTimestamp, setOfflineTimestamp] = useState<number | null>(null);

	const handleOnline = useCallback(() => {
		setIsOnline(true);
		setOfflineTimestamp(Date.now());
	}, []);

	const handleOffline = useCallback(() => {
		setIsOnline(false);
		setWasOffline(true);
		setOfflineTimestamp(null);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		setIsOnline(navigator.onLine);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [handleOnline, handleOffline]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (!isOnline || offlineTimestamp === null) return;

		const elapsed = Date.now() - offlineTimestamp;
		if (elapsed >= OFFLINE_GRACE_PERIOD_MS) {
			setWasOffline(false);
			setOfflineTimestamp(null);
			return;
		}

		const timeout = setTimeout(() => {
			setWasOffline(false);
			setOfflineTimestamp(null);
		}, OFFLINE_GRACE_PERIOD_MS - elapsed);

		return () => clearTimeout(timeout);
	}, [isOnline, offlineTimestamp]);

	return {
		isOnline,
		wasOffline,
	};
}

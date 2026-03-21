'use client';
/* eslint-disable react-hooks/setState-in-use-effect */

import { WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { useOfflineStore } from '@/stores/useOfflineStore';

export function OfflineIndicator() {
	const { isOnline, setOnlineStatus } = useOfflineStore();
	const [isVisible, setIsVisible] = useState(() => !navigator.onLine);

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		const handleOnline = () => {
			setOnlineStatus(true);
			setIsVisible(true);
			setTimeout(() => setIsVisible(false), 3000);
		};

		const handleOffline = () => {
			setOnlineStatus(false);
			setIsVisible(true);
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		if (navigator.onLine !== isOnline) {
			setOnlineStatus(navigator.onLine);
		}

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [setOnlineStatus, isOnline]);

	if (!isVisible) return null;

	return (
		<div
			className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
				isOnline ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
			}`}
		>
			<HugeiconsIcon icon={isOnline ? WifiOffIcon : WifiOffIcon} className="w-4 h-4" />
			{isOnline ? 'Back online!' : 'You are offline'}
		</div>
	);
}

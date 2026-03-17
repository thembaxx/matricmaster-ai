'use client';

import { WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
	const [isOffline, setIsOffline] = useState(false);

	useEffect(() => {
		setIsOffline(!navigator.onLine);

		const handleOnline = () => setIsOffline(false);
		const handleOffline = () => setIsOffline(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	if (!isOffline) return null;

	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
			<div className="bg-amber-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
				<HugeiconsIcon icon={WifiOffIcon} className="w-4 h-4" />
				Offline Mode
			</div>
		</div>
	);
}

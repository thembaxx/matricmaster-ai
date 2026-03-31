'use client';

import { WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type ReactElement, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { hasPendingSyncItems } from '@/lib/offlineStorage';

export function OfflineIndicator(): ReactElement | null {
	const [isOnline, setIsOnline] = useState(true);
	const [hasPending, setHasPending] = useState(false);

	useEffect(() => {
		const updateOnlineStatus = () => {
			const online = navigator.onLine;
			setIsOnline(online);

			if (online) {
				toast.success('Back online! Your progress is syncing.');
			} else {
				toast.info('You are offline. Your progress will be saved locally.');
			}
		};

		const checkPendingSync = () => {
			setHasPending(hasPendingSyncItems());
		};

		updateOnlineStatus();
		checkPendingSync();

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		const interval = setInterval(checkPendingSync, 10000);

		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
			clearInterval(interval);
		};
	}, []);

	if (isOnline && !hasPending) {
		return null;
	}

	return (
		<div
			className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in"
			role="status"
			aria-live="polite"
		>
			<Badge
				variant={isOnline ? 'default' : 'secondary'}
				className="flex items-center gap-2 px-3 py-1.5 shadow-lg"
			>
				<HugeiconsIcon
					icon={WifiOffIcon}
					className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-orange-500'}`}
				/>
				<span className="text-sm font-medium">
					{isOnline ? (hasPending ? 'Syncing...' : '') : 'Offline'}
				</span>
			</Badge>
		</div>
	);
}

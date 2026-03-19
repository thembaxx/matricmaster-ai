'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	cacheStaticAssets,
	clearOldCaches,
	getCacheSize,
	getTipsBySubject,
	isOffline,
} from '@/lib/offline';
import { OfflineStatusCard } from './offline-status-card';
import { QuickTipsCard } from './quick-tips-card';

export default function OfflinePage() {
	const [isOfflineState, setIsOfflineState] = useState(false);
	const [cacheSize, setCacheSize] = useState(0);
	const [isReloading, setIsReloading] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

	const { data: tips = [] } = useQuery({
		queryKey: ['quick-tips', selectedSubject],
		queryFn: () => getTipsBySubject(selectedSubject).then((t) => t.slice(0, 5)),
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		setIsOfflineState(isOffline());

		const handleOnline = () => setIsOfflineState(false);
		const handleOffline = () => setIsOfflineState(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		async function loadCacheSize() {
			const size = await getCacheSize();
			setCacheSize(size);
		}
		loadCacheSize();

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const handleRetry = async () => {
		setIsReloading(true);
		await cacheStaticAssets();
		await clearOldCaches();
		window.location.reload();
	};

	const handleClearCache = async () => {
		if ('caches' in window) {
			const keys = await caches.keys();
			for (const key of keys) {
				if (key.startsWith('matricmaster-')) {
					await caches.delete(key);
				}
			}
			toast.success('Cache cleared');
			setCacheSize(0);
		}
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4 flex items-center justify-center">
			<div className="max-w-md w-full space-y-4">
				<OfflineStatusCard
					isOfflineState={isOfflineState}
					cacheSize={cacheSize}
					isReloading={isReloading}
					onRetry={handleRetry}
					onClearCache={handleClearCache}
				/>

				{isOfflineState && (
					<QuickTipsCard
						selectedSubject={selectedSubject}
						onSubjectChange={setSelectedSubject}
						tips={tips}
					/>
				)}
			</div>
		</div>
	);
}

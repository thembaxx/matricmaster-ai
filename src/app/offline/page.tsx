'use client';

import {
	CheckmarkCircle02Icon,
	Clock01Icon,
	DriveIcon,
	Refresh01Icon,
	Wifi01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	cacheStaticAssets,
	clearOldCaches,
	formatBytes,
	getCacheSize,
	getTipsBySubject,
	isOffline,
} from '@/lib/offline';

export default function OfflinePage() {
	const [isOfflineState, setIsOfflineState] = useState(false);
	const [cacheSize, setCacheSize] = useState(0);
	const [isReloading, setIsReloading] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

	const subjects = ['Mathematics', 'Physical Sciences', 'English', 'Afrikaans', 'History'];

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
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 p-4 rounded-full bg-muted">
							<HugeiconsIcon
								icon={isOfflineState ? Wifi01Icon : Refresh01Icon}
								className={`w-8 h-8 ${isOfflineState ? 'text-orange-500' : 'text-blue-500'}`}
							/>
						</div>
						<CardTitle>{isOfflineState ? "You're Offline" : 'Connection Issue'}</CardTitle>
						<CardDescription>
							{isOfflineState
								? "Don't worry! You can still access some features offline."
								: 'There seems to be a connection problem.'}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isOfflineState && (
							<div className="text-sm text-muted-foreground space-y-3">
								<p>While offline, you can:</p>
								<ul className="space-y-2">
									<li className="flex items-start gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>Review saved flashcards</span>
									</li>
									<li className="flex items-start gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>Continue your study plan</span>
									</li>
									<li className="flex items-start gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>View cached past papers</span>
									</li>
									<li className="flex items-start gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>Track your progress</span>
									</li>
								</ul>
							</div>
						)}

						<div className="grid grid-cols-2 gap-3 text-sm">
							<div className="p-3 rounded-lg bg-muted">
								<div className="flex items-center gap-2 mb-1">
									<HugeiconsIcon icon={DriveIcon} className="w-4 h-4 text-muted-foreground" />
									<span className="text-muted-foreground">Cache Size</span>
								</div>
								<p className="font-medium">{formatBytes(cacheSize)}</p>
							</div>
							<div className="p-3 rounded-lg bg-muted">
								<div className="flex items-center gap-2 mb-1">
									<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground" />
									<span className="text-muted-foreground">Last Synced</span>
								</div>
								<p className="font-medium">{new Date().toLocaleTimeString()}</p>
							</div>
						</div>

						<div className="flex gap-2">
							<Button className="flex-1" onClick={handleRetry} disabled={isReloading}>
								<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4 mr-2" />
								{isReloading ? 'Retrying...' : 'Try Again'}
							</Button>
							<Button variant="outline" onClick={handleClearCache}>
								Clear Cache
							</Button>
						</div>

						<Button
							variant="ghost"
							className="w-full"
							onClick={() => {
								window.location.href = '/dashboard';
							}}
						>
							Go to Dashboard
						</Button>
					</CardContent>
				</Card>

				{isOfflineState && tips.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Tips</CardTitle>
							<CardDescription>Study tips available offline</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex gap-2 flex-wrap">
								{subjects.map((subject) => (
									<Button
										key={subject}
										variant={selectedSubject === subject ? 'default' : 'outline'}
										size="sm"
										onClick={() => setSelectedSubject(subject)}
									>
										{subject}
									</Button>
								))}
							</div>
							<div className="space-y-2 mt-4">
								{tips.map((tip) => (
									<div key={tip.id} className="p-3 bg-muted rounded-lg">
										<p className="font-medium text-sm">{tip.title}</p>
										<p className="text-xs text-muted-foreground mt-1">{tip.content}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

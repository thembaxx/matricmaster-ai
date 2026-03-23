'use client';

import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOfflineStore } from '@/stores/useOfflineStore';

declare global {
	interface Window {
		workbox: unknown;
		DeferredPrompt?: Event & {
			prompt: () => Promise<void>;
			userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
		};
	}
}

export function ServiceWorkerRegistration() {
	const { isOnline, setOnlineStatus } = useOfflineStore();
	const [deferredPrompt, setDeferredPrompt] = useState<Window['DeferredPrompt'] | null>(null);
	const [showInstallButton, setShowInstallButton] = useState(false);
	const [installed, setInstalled] = useState(false);
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		const handleOnline = () => setOnlineStatus(true);
		const handleOffline = () => setOnlineStatus(false);

		if (typeof navigator !== 'undefined' && navigator.onLine !== isOnline) {
			setOnlineStatus(navigator.onLine);
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [setOnlineStatus, isOnline]);

	useEffect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready
				.then((registration) => {
					console.debug('Service worker ready:', registration);
				})
				.catch((error) => {
					console.warn('Service worker not ready:', error);
				});
		}
	}, []);

	useEffect(() => {
		const ua = navigator.userAgent;
		const iOS =
			/iPhone|iPad|iPod/.test(ua) &&
			!(window.navigator as unknown as { standalone?: boolean }).standalone;
		setIsIOS(iOS);
	}, []);

	useEffect(() => {
		const checkInstalled = async () => {
			if (window.matchMedia('(display-mode: standalone)').matches) {
				setInstalled(true);
				return true;
			}
			if ((navigator as unknown as { standalone?: boolean }).standalone) {
				setInstalled(true);
				return true;
			}
			return false;
		};

		checkInstalled();
	}, []);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Window['DeferredPrompt']) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setShowInstallButton(true);
		};

		const handleAppInstalled = () => {
			setInstalled(true);
			setShowInstallButton(false);
			setDeferredPrompt(null);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			setInstalled(true);
		}

		setShowInstallButton(false);
		setDeferredPrompt(null);
	};

	const handleDismiss = () => {
		setShowInstallButton(false);
		localStorage.setItem('pwa-install-dismissed', 'true');
	};

	useEffect(() => {
		const wasDismissed = localStorage.getItem('pwa-install-dismissed');
		if (wasDismissed) {
			setShowInstallButton(false);
		}
	}, []);

	if (installed) return null;

	return (
		<>
			{isIOS ? null : showInstallButton ? (
				<div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
					<div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">Install Lumi</p>
							<p className="text-xs text-muted-foreground">Add to home screen for offline access</p>
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" onClick={handleInstallClick} className="shrink-0">
								<Download className="h-4 w-4 mr-1" />
								Install
							</Button>
							<Button size="sm" variant="ghost" onClick={handleDismiss} className="shrink-0">
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}

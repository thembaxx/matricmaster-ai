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
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			const deferredPrompt = e as unknown as Window['DeferredPrompt'];
			setDeferredPrompt(deferredPrompt);
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

	if (isIOS || !showInstallButton) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
			<div className="bg-primary/5 backdrop-blur-sm border-b border-border/50 px-4 py-2 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 min-w-0">
					<Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
					<p className="text-xs text-muted-foreground truncate">install lumi for offline access</p>
				</div>
				<div className="flex items-center gap-1.5 shrink-0">
					<Button
						size="sm"
						variant="outline"
						onClick={handleInstallClick}
						className="h-7 text-xs px-3 rounded-full"
					>
						install
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleDismiss}
						className="h-7 w-7 p-0 rounded-full"
					>
						<X className="h-3.5 w-3.5" />
						<span className="sr-only">dismiss</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

'use client';

import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function IOSInstallPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const isIOS =
			typeof navigator !== 'undefined' &&
			/iPhone|iPad|iPod/.test(navigator.userAgent) &&
			!(window.navigator as unknown as { standalone?: boolean }).standalone;

		const wasDismissed = localStorage.getItem('ios-install-dismissed');

		if (isIOS && !wasDismissed) {
			const timer = setTimeout(() => setShowPrompt(true), 3000);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleDismiss = () => {
		setShowPrompt(false);
		setDismissed(true);
		localStorage.setItem('ios-install-dismissed', 'true');
	};

	if (!showPrompt || dismissed) return null;

	return (
		<div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-auto md:w-auto animate-in slide-in-from-top duration-300">
			<div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-md px-3 py-2 flex items-center gap-3">
				<div className="flex-1 min-w-0 pl-3">
					<p className="text-xs font-medium">Add to Home Screen</p>
					<p className="text-xs text-muted-foreground hidden sm:block">Tap Share in Safari</p>
				</div>
				<div className="flex items-center gap-1.5">
					<Button
						size="sm"
						variant="default"
						onClick={handleDismiss}
						className="shrink-0 text-[12.6px] h-7 pl-3 pr-4"
					>
						<Download className="h-3 w-3" />
						Got it
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleDismiss}
						className="shrink-0 h-7 w-7 p-0"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
}

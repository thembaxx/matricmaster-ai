'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

export function IOSInstallPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const isIOS =
			typeof navigator !== 'undefined' &&
			/iPhone|iPad|iPod/.test(navigator.userAgent) &&
			!window.navigator.standalone;

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
		<Dialog open={showPrompt} onOpenChange={setShowPrompt}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						Add Lumi to Your Home Screen
					</DialogTitle>
					<DialogDescription className="pt-2">
						For the best experience, add Lumi to your home screen to use it like a native app.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="rounded-lg bg-muted p-4 space-y-3">
						<p className="text-sm font-medium">Follow these steps:</p>
						<ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
							<li>
								Tap the <span className="font-medium text-foreground">Share</span> button in the
								Safari toolbar
							</li>
							<li>
								Scroll down and tap{' '}
								<span className="font-medium text-foreground">Add to Home Screen</span>
							</li>
							<li>
								Tap <span className="font-medium text-foreground">Add</span> to confirm
							</li>
						</ol>
					</div>

					<div className="flex gap-2">
						<Button variant="outline" className="flex-1" onClick={handleDismiss}>
							Not now
						</Button>
						<Button className="flex-1" onClick={handleDismiss}>
							Got it
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

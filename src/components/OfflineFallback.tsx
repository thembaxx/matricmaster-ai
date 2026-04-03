'use client';

import { RefreshCw, WifiOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const AUTO_DISMISS_DELAY_MS = 3000;

export function OfflineFallback() {
	const { isOnline, wasOffline } = useNetworkStatus();
	const [isRetrying, setIsRetrying] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const shouldShow = !isOnline || wasOffline;

	const handleRetry = useCallback(() => {
		setIsRetrying(true);
		if (navigator.onLine) {
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
				setIsRetrying(false);
			}, AUTO_DISMISS_DELAY_MS);
		} else {
			setTimeout(() => setIsRetrying(false), 1000);
		}
	}, []);

	if (!shouldShow && !showSuccess) {
		return null;
	}

	return (
		<div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
			<Card
				className={`
					border-2 transition-all duration-300 ease-in-out
					${showSuccess ? 'border-success bg-success/10 dark:bg-success/10' : 'border-primary bg-card'}
				`}
			>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base">
						<WifiOff className={`h-5 w-5 ${showSuccess ? 'text-success' : 'text-primary'}`} />
						{showSuccess ? "You're back online!" : "You're offline"}
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<p className="text-sm text-muted-foreground mb-4">
						{showSuccess
							? "Connection restored! We'll sync your progress shortly."
							: "Don't worry - your progress is saved!"}
					</p>
					<Button
						onClick={handleRetry}
						disabled={isRetrying || showSuccess}
						className="w-full"
						variant={showSuccess ? 'outline' : 'default'}
					>
						<RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
						{isRetrying ? 'Checking...' : showSuccess ? 'Got it!' : 'Try again'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

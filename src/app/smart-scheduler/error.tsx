'use client';

import { Home01Icon, Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: Required by Next.js for error.tsx error boundary
export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Smart Scheduler error:', error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
					<HugeiconsIcon
						icon={Warning}
						className="w-8 h-8 text-destructive dark:text-destructive"
					/>
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
					<p className="text-sm text-muted-foreground">
						{error.message || 'An unexpected error occurred. Please try again.'}
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
					)}
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={() => reset()} variant="outline" className="gap-2">
						<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
						Try Again
					</Button>
					<Link href="/">
						<Button className="gap-2">
							<HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
							Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

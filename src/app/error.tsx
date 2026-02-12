'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
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
		console.error('Application error:', error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
					<AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Something went wrong</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{error.message || 'An unexpected error occurred. Please try again.'}
					</p>
					{error.digest && (
						<p className="text-xs text-zinc-400 dark:text-zinc-600">Error ID: {error.digest}</p>
					)}
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={() => reset()} variant="outline" className="gap-2">
						<RefreshCw className="w-4 h-4" />
						Try Again
					</Button>
					<Link href="/">
						<Button className="gap-2">
							<Home className="w-4 h-4" />
							Go Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

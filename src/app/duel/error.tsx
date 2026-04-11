'use client';

import { ArrowLeftIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorBoundary({ error: err, reset }: ErrorBoundaryProps) {
	useEffect(() => {
		Sentry.captureException(err);
	}, [err]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
			<HugeiconsIcon
				icon={RefreshIcon}
				className="w-16 h-16 text-muted-foreground mb-6 opacity-50"
			/>
			<h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
			<p className="text-muted-foreground mb-6 max-w-md">
				An unexpected error occurred. Please try again or go back to the dashboard.
			</p>
			<div className="flex gap-3">
				<Button onClick={() => reset()}>Try Again</Button>
				<Button variant="outline" asChild>
					<Link href="/dashboard">
						<ArrowLeftIcon className="w-4 h-4 mr-2" />
						Go Home
					</Link>
				</Button>
			</div>
		</div>
	);
}

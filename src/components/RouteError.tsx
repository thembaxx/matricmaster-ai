'use client';

import { Home01Icon, Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	title?: string;
	description?: string;
	showHomeButton?: boolean;
}

/**
 * Reusable error component for Next.js App Router error.tsx files.
 * Provides consistent error UI with retry and navigation options.
 *
 * @example
 * // In app/some-route/error.tsx:
 * 'use client';
 * import { RouteError } from '@/components/RouteError';
 *
 * export default function SomeRouteError({ error, reset }: { error: Error; reset: () => void }) {
 *   return <RouteError error={error} reset={reset} title="route name" />;
 * }
 */
export function RouteError({
	error,
	reset,
	title = 'something went wrong',
	description,
	showHomeButton = true,
}: RouteErrorProps) {
	useEffect(() => {
		// Log error to monitoring service (e.g., Sentry)
		console.error(`[${title}] error:`, error);
	}, [error, title]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
					<HugeiconsIcon icon={Warning} className="w-8 h-8 text-destructive" />
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">{title}</h2>
					<p className="text-sm text-muted-foreground">
						{description ||
							error.message ||
							'please try again or contact support if the issue persists.'}
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground">error id: {error.digest}</p>
					)}
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={() => reset()} variant="outline" className="gap-2 rounded-xl">
						<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
						try again
					</Button>
					{showHomeButton && (
						<Link href="/" transitionTypes={['fade']}>
							<Button className="gap-2 rounded-xl">
								<HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
								home
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}

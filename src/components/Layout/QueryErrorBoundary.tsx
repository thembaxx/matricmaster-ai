'use client';

import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

interface QueryErrorBoundaryProps {
	children: ReactNode;
	fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

function DefaultErrorFallback({
	error,
	resetErrorBoundary,
}: {
	error: Error;
	resetErrorBoundary: () => void;
}) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="max-w-md w-full mx-auto p-6 bg-card rounded-lg shadow-lg border">
				<div className="flex items-center gap-3 mb-4">
					<WarningCircle className="h-6 w-6 text-destructive" />
					<h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
				</div>
				<p className="text-sm text-muted-foreground mb-6">
					We encountered an error while loading data. This might be a temporary issue with our
					servers.
				</p>
				<div className="space-y-3">
					<p className="text-xs text-muted-foreground">Error: {error.message}</p>
					<div className="flex gap-3">
						<Button onClick={resetErrorBoundary} className="flex items-center gap-2">
							<ArrowsClockwise className="h-4 w-4" />
							Try again
						</Button>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Refresh page
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function QueryErrorBoundary({
	children,
	fallback = DefaultErrorFallback,
}: QueryErrorBoundaryProps) {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ErrorBoundary
					onError={(error) => {
						console.error('Query Error Boundary caught an error:', error);
					}}
					onReset={reset}
					fallbackRender={({ error, resetErrorBoundary }) => {
						const FallbackComponent = fallback;
						return (
							<FallbackComponent error={error as Error} resetErrorBoundary={resetErrorBoundary} />
						);
					}}
				>
					{children}
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
}

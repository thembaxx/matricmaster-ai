'use client';

import { Suspense as ReactSuspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SuspenseProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function Suspense({ children, fallback }: SuspenseProps) {
	return (
		<ReactSuspense
			fallback={
				fallback ?? (
					<div className="space-y-4 p-4">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-32 w-full" />
					</div>
				)
			}
		>
			{children}
		</ReactSuspense>
	);
}

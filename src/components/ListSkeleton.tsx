'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
	items?: number;
	showTitle?: boolean;
}

export function ListSkeleton({ items = 4, showTitle = true }: ListSkeletonProps) {
	return (
		<div className="space-y-6 w-full max-w-2xl mx-auto px-6 py-8">
			{showTitle && (
				<div className="space-y-2">
					<Skeleton className="h-10 w-48 rounded-xl" />
					<Skeleton className="h-4 w-64 rounded-lg" />
				</div>
			)}

			<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-9 w-20 rounded-lg shrink-0" />
				))}
			</div>

			<div className="space-y-4">
				{Array.from({ length: items }).map((_, i) => (
					<Skeleton key={i} className="h-44 w-full rounded-[2rem]" />
				))}
			</div>
		</div>
	);
}

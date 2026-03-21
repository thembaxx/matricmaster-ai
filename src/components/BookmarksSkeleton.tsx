'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BookmarksSkeleton() {
	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header Skeleton */}
			<header className="px-6 pt-12 pb-2 bg-card shrink-0 space-y-4">
				<Skeleton className="h-8 w-40 rounded-full" />
				<Skeleton className="h-4 w-60 rounded-full" />
				<div className="flex gap-2 pt-2">
					{[1, 2, 3, 4].map((item) => (
						<Skeleton
							key={`bookmarks-filter-skeleton-${item}`}
							className="h-10 w-24 rounded-full"
						/>
					))}
				</div>
			</header>

			<div className="flex-1 px-6 py-6 pb-40">
				<div className="grid grid-cols-2 gap-4">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Card
							key={`bookmarks-card-skeleton-${item}`}
							className="p-5 rounded-[2.5rem] border bg-card flex flex-col h-64"
						>
							<div className="flex justify-between items-start mb-4">
								<Skeleton className="w-10 h-10 rounded-xl" />
								<Skeleton className="w-5 h-5 rounded-md" />
							</div>
							<Skeleton className="flex-1 w-full rounded-xl mb-4" />
							<div className="space-y-2">
								<Skeleton className="h-3 w-16 rounded-full" />
								<Skeleton className="h-4 w-32 rounded-full" />
								<Skeleton className="h-2 w-20 rounded-full" />
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

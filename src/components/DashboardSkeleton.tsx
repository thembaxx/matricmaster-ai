'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
	return (
		<div className="flex flex-col h-full bg-background pb-24 relative overflow-hidden">
			<header className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-3">
					<Skeleton className="w-12 h-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-2 w-20" />
						<Skeleton className="h-5 w-32" />
					</div>
				</div>
				<Skeleton className="w-12 h-12 rounded-2xl" />
			</header>

			<div className="px-6 py-6 space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="col-span-1 h-32 rounded-3xl" />
					<Skeleton className="col-span-1 h-32 rounded-3xl" />
					<Skeleton className="col-span-2 h-64 rounded-[2.5rem]" />
				</div>

				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<div className="grid grid-cols-7 gap-2 p-5 rounded-[2.5rem] bg-card/50">
						{Array.from({ length: 7 }).map((_, i) => (
							<Skeleton key={`skeleton-${i}`} className="aspect-square w-full rounded-2xl" />
						))}
					</div>
				</div>

				<div className="space-y-4">
					<Skeleton className="h-6 w-48" />
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={`skeleton-${i}`} className="h-24 w-full rounded-[2rem]" />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

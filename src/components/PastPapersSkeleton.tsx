'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PastPapersSkeleton() {
	return (
		<div className="flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden lg:px-8">
			{/* Header Skeleton */}
			<header className="px-4 sm:px-6 pb-6 sm:py-12 pt-24 bg-background shrink-0 lg:px-0">
				<div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-12">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
						<div className="space-y-2">
							<Skeleton className="h-10 w-64 sm:w-96 rounded-full" />
							<Skeleton className="h-4 w-48 sm:w-64 rounded-full" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-12 w-32 rounded-2xl" />
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
						<div className="lg:col-span-8">
							<Skeleton className="h-12 sm:h-16 w-full rounded-xl sm:rounded-2xl" />
						</div>
						<div className="lg:col-span-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
							{[1, 2, 3, 4, 5].map((item) => (
								<Skeleton
									key={`past-papers-filter-skeleton-${item}`}
									className="h-10 sm:h-16 w-24 sm:w-32 rounded-xl sm:rounded-2xl shrink-0"
								/>
							))}
						</div>
					</div>
				</div>
			</header>

			<div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12 pb-32 lg:px-0">
				<div className="flex items-center justify-between border-b border-border pb-4">
					<Skeleton className="h-4 w-40 rounded-full" />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Card
							key={`past-papers-card-skeleton-${item}`}
							className="p-8 rounded-3xl border border-border bg-card/50 flex flex-col gap-6"
						>
							<div className="flex items-start justify-between">
								<Skeleton className="w-16 h-16 rounded-2xl" />
								<div className="space-y-2 flex flex-col items-end">
									<Skeleton className="h-2 w-16 rounded-full" />
									<Skeleton className="h-6 w-12 rounded-full" />
								</div>
							</div>
							<div className="space-y-2">
								<Skeleton className="h-8 w-full rounded-full" />
								<div className="flex gap-2">
									<Skeleton className="h-4 w-20 rounded-lg" />
									<Skeleton className="h-4 w-24 rounded-lg" />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<Skeleton className="h-12 rounded-2xl" />
								<Skeleton className="h-12 rounded-2xl" />
							</div>
							<Skeleton className="h-14 w-full rounded-2xl" />
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

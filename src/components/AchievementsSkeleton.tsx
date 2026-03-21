'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AchievementsSkeleton() {
	return (
		<div className="flex flex-col h-full min-w-0 bg-background p-4 sm:pb-32 lg:px-8 overflow-x-hidden">
			<main className="max-w-6xl mx-auto w-full pt-8 sm:pt-12 space-y-8 sm:space-y-12">
				{/* Hero Card Skeleton */}
				<Card className="rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 h-80 sm:h-96 bg-muted/20 border-none flex flex-col justify-center">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
						<div className="space-y-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-32 rounded-full" />
								<Skeleton className="h-16 w-64 rounded-full" />
							</div>
							<div className="space-y-4">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-24 rounded-full" />
									<Skeleton className="h-4 w-12 rounded-full" />
								</div>
								<Skeleton className="h-4 w-full rounded-full" />
							</div>
						</div>
						<div className="flex justify-center md:justify-end">
							<Skeleton className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-[3.5rem]" />
						</div>
					</div>
				</Card>

				{/* Category Nav Skeleton */}
				<div className="flex gap-4 overflow-x-auto no-scrollbar">
					{[1, 2, 3, 4].map((item) => (
						<Skeleton
							key={`achievements-nav-skeleton-${item}`}
							className="h-12 w-32 sm:w-40 rounded-full shrink-0"
						/>
					))}
				</div>

				{/* Grid Skeleton */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
						<Card
							key={`achievements-grid-skeleton-${item}`}
							className="h-64 sm:h-80 rounded-[2.5rem] p-8 border-2 border-border bg-card/50 flex flex-col items-center gap-6"
						>
							<Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem]" />
							<div className="space-y-2 flex flex-col items-center">
								<Skeleton className="h-5 w-32 rounded-full" />
								<Skeleton className="h-3 w-20 rounded-full" />
							</div>
						</Card>
					))}
				</div>
			</main>
		</div>
	);
}

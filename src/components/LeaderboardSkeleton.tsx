'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function LeaderboardSkeleton() {
	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-24 overflow-x-hidden lg:px-8">
			<header className="pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col items-center gap-8 sm:gap-12 shrink-0">
				<div className="text-center space-y-4 px-4">
					<Skeleton className="h-12 w-64 sm:w-96 mx-auto rounded-full" />
					<Skeleton className="h-4 w-48 sm:w-64 mx-auto rounded-full" />
				</div>

				<div className="w-full max-w-4xl px-4">
					<Skeleton className="h-16 w-full rounded-2xl" />
				</div>
			</header>

			<div className="max-w-6xl mx-auto w-full pb-32">
				{/* Podium Skeleton */}
				<div className="flex items-end justify-center gap-4 md:gap-12 pt-16 pb-12 lg:pt-24 lg:pb-20">
					<div className="flex flex-col items-center space-y-4">
						<Skeleton className="w-16 h-16 sm:w-28 sm:h-28 rounded-full" />
						<Skeleton className="h-4 w-20 rounded-full" />
						<div className="w-20 h-24 md:w-28 md:h-32 bg-muted/20 rounded-t-3xl" />
					</div>
					<div className="flex flex-col items-center space-y-4">
						<Skeleton className="w-24 h-24 sm:w-40 sm:h-40 rounded-full" />
						<Skeleton className="h-6 w-32 rounded-full" />
						<div className="w-32 h-40 md:w-44 md:h-56 bg-muted/30 rounded-t-[3rem]" />
					</div>
					<div className="flex flex-col items-center space-y-4">
						<Skeleton className="w-16 h-16 sm:w-28 sm:h-28 rounded-full" />
						<Skeleton className="h-4 w-20 rounded-full" />
						<div className="w-20 h-16 md:w-28 md:h-24 bg-muted/20 rounded-t-3xl" />
					</div>
				</div>

				{/* List Skeleton */}
				<div className="bg-card/20 rounded-[2.5rem] border-2 border-border/50 p-2 mx-4 lg:mx-0">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-center gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-5 border-b border-border last:border-0">
							<Skeleton className="w-8 h-4 rounded-full" />
							<Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32 rounded-full" />
								<Skeleton className="h-3 w-24 rounded-full" />
							</div>
							<div className="text-right space-y-2">
								<Skeleton className="h-5 w-16 ml-auto rounded-full" />
								<Skeleton className="h-2 w-12 ml-auto rounded-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

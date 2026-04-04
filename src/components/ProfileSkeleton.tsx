'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
	return (
		<div className="flex flex-col min-h-[calc(100vh-4rem)] min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				{/* Avatar Skeleton */}
				<div className="flex flex-col items-center">
					<Skeleton className="w-28 h-28 rounded-full" />
					<div className="mt-6 space-y-2 flex flex-col items-center">
						<Skeleton className="h-8 w-48 rounded-full" />
						<Skeleton className="h-4 w-32 rounded-full" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 pt-8 gap-8 lg:gap-12">
					{/* Left Column Skeleton */}
					<div className="lg:col-span-7 space-y-8 lg:space-y-12">
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<Skeleton className="h-6 w-40 rounded-full" />
								<Skeleton className="h-10 w-48 rounded-xl" />
							</div>
							<Card className="rounded-[2rem] border border-border p-8 h-80 sm:h-100 flex items-center justify-center bg-card/50">
								<Skeleton className="w-64 h-64 rounded-full" />
							</Card>
						</div>
					</div>

					{/* Right Column Skeleton */}
					<div className="lg:col-span-5 space-y-8">
						<Skeleton className="h-6 w-40 rounded-full" />

						{/* Level Progress Skeleton */}
						<Card className="p-8 rounded-[2rem] border border-border bg-card/50">
							<div className="space-y-4">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-20 rounded-full" />
									<Skeleton className="h-4 w-12 rounded-full" />
								</div>
								<Skeleton className="h-4 w-full rounded-full" />
							</div>
						</Card>

						<div className="grid grid-cols-1 gap-6">
							{[1, 2, 3].map((item) => (
								<Card
									key={`profile-card-skeleton-${item}`}
									className="p-8 rounded-[2rem] border border-border bg-card/50"
								>
									<div className="flex items-center gap-8">
										<Skeleton className="w-20 h-20 rounded-[1.5rem]" />
										<div className="space-y-2">
											<Skeleton className="h-3 w-24 rounded-full" />
											<Skeleton className="h-8 w-40 rounded-full" />
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

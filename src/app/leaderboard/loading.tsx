import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
	return (
		<div className="flex flex-col h-full bg-background pb-28">
			<header className="px-6 pt-12 pb-6 shrink-0 ios-glass">
				{/* Tabs Skeleton */}
				<div className="h-14 bg-muted rounded-2xl p-1.5 mb-8">
					<div className="flex h-full gap-1">
						<Skeleton className="flex-1 rounded-xl" />
						<Skeleton className="flex-1 rounded-xl" />
						<Skeleton className="flex-1 rounded-xl" />
					</div>
				</div>

				{/* Podium Skeleton */}
				<div className="flex items-end justify-center gap-6 pt-12 pb-8">
					<div className="flex flex-col items-center">
						<Skeleton className="w-20 h-20 rounded-full mb-2" />
						<Skeleton className="h-4 w-16 mb-1" />
						<Skeleton className="h-3 w-12 mb-1" />
						<Skeleton className="w-16 h-20 rounded-t-lg mt-2" />
					</div>
					<div className="flex flex-col items-center">
						<Skeleton className="w-24 h-28 rounded-t-xl mb-2" />
						<Skeleton className="h-5 w-20 mb-1" />
						<Skeleton className="h-3 w-14 mb-1" />
						<Skeleton className="w-24 h-32 rounded-t-[2.5rem] mt-4" />
					</div>
					<div className="flex flex-col items-center">
						<Skeleton className="w-20 h-20 rounded-full mb-2" />
						<Skeleton className="h-4 w-16 mb-1" />
						<Skeleton className="h-3 w-12 mb-1" />
						<Skeleton className="w-16 h-16 rounded-t-lg mt-2" />
					</div>
				</div>
			</header>

			{/* List Skeleton */}
			<div className="bg-card dark:bg-card/80 rounded-t-[3rem] pt-2 px-6">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={`leaderboard-item-${i}`} className="flex items-center gap-4 py-4">
						<Skeleton className="w-6 h-6" />
						<Skeleton className="w-12 h-12 rounded-2xl" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
						<Skeleton className="h-4 w-16" />
					</div>
				))}
			</div>

			{/* Footer Skeleton */}
			<div className="p-6">
				<Skeleton className="h-24 rounded-3xl" />
			</div>
		</div>
	);
}

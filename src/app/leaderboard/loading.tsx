export default function LeaderboardLoading() {
	return (
		<div className="flex flex-col h-full bg-background pb-28">
			<header className="px-6 pt-12 pb-6 shrink-0 bg-white dark:bg-[#0a0f18]">
				{/* Tabs Skeleton */}
				<div className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1.5 mb-8">
					<div className="flex h-full gap-1">
						<div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
						<div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
						<div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
					</div>
				</div>

				{/* Podium Skeleton */}
				<div className="flex items-end justify-center gap-6 pt-12 pb-8">
					<div className="flex flex-col items-center">
						<div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse mb-2" />
						<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-1" />
						<div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						<div className="w-16 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-t-lg mt-2 animate-pulse" />
					</div>
					<div className="flex flex-col items-center">
						<div className="w-24 h-28 bg-zinc-200 dark:bg-zinc-800 rounded-t-xl animate-pulse mb-2" />
						<div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-1" />
						<div className="h-3 w-14 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						<div className="w-24 h-32 bg-zinc-200 dark:bg-zinc-800 rounded-t-[2.5rem] mt-4 animate-pulse" />
					</div>
					<div className="flex flex-col items-center">
						<div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse mb-2" />
						<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-1" />
						<div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						<div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-t-lg mt-2 animate-pulse" />
					</div>
				</div>
			</header>

			{/* List Skeleton */}
			<div className="bg-white dark:bg-zinc-950 rounded-t-[3rem] pt-2 px-6">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={`leaderboard-item-${i}`} className="flex items-center gap-4 py-4">
						<div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						<div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
							<div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						</div>
						<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
					</div>
				))}
			</div>

			{/* Footer Skeleton */}
			<div className="p-6">
				<div className="h-24 bg-zinc-900 dark:bg-zinc-950 rounded-3xl animate-pulse" />
			</div>
		</div>
	);
}

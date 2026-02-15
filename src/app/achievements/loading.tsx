export default function AchievementsLoading() {
	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
			<div className="flex-1">
				<main className="px-4 pb-32">
					{/* Mastery Level Card Skeleton */}
					<div className="rounded-3xl p-6 mb-6 bg-zinc-200 dark:bg-zinc-800 animate-pulse h-48" />

					{/* Filter Tabs Skeleton */}
					<div className="flex gap-2 mb-6">
						<div className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
						<div className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
						<div className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
					</div>

					{/* Badges Grid Skeleton */}
					<div className="grid grid-cols-3 gap-4">
						{Array.from({ length: 9 }).map((_, i) => (
							<div
								key={`skeleton-${i}`}
								className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900"
							>
								<div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
								<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
								<div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
							</div>
						))}
					</div>
				</main>
			</div>
		</div>
	);
}

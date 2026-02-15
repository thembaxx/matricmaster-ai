export default function DashboardLoading() {
	return (
		<div className="flex flex-col h-full bg-background font-inter pb-24">
			<header className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
					<div className="space-y-2">
						<div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
						<div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
					</div>
				</div>
				<div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
			</header>
			<div className="flex-1 px-6 py-6 space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
					<div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
					<div className="col-span-2 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse" />
				</div>
				<div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse" />
				<div className="space-y-3">
					<div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse" />
					<div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-[2rem] animate-pulse" />
				</div>
			</div>
		</div>
	);
}

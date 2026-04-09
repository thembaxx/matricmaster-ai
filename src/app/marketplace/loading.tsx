import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="flex gap-4">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="space-y-3 p-4 border rounded-lg">
							<div className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							</div>
							<Skeleton className="h-20" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-20" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

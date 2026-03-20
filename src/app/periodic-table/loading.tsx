import { Skeleton } from '@/components/ui/skeleton';

export default function PeriodicTableLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-5xl mx-auto space-y-6">
				<Skeleton className="h-10 w-56 mx-auto" />
				<div className="grid grid-cols-9 gap-1">
					{Array.from({ length: 18 }).map((_, i) => (
						<Skeleton key={`skeleton-${i}`} className="aspect-square" />
					))}
				</div>
			</div>
		</div>
	);
}

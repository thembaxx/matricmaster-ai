import { Skeleton } from '@/components/ui/skeleton';

export default function BookmarksLoading() {
	return (
		<div className="p-4 space-y-4">
			<Skeleton className="h-8 w-32" />
			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={`skeleton-${i}`} className="h-24 rounded-xl" />
				))}
			</div>
		</div>
	);
}

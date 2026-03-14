import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
	return (
		<div className="p-4 space-y-4">
			<Skeleton className="h-14 w-full rounded-xl" />
			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex gap-3">
						<Skeleton className="h-12 w-12 rounded-lg shrink-0" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

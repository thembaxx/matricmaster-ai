import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="container py-6 space-y-4">
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
			</div>
		</div>
	);
}

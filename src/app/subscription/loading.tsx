import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className="h-10 w-40 mx-auto" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={`skeleton-${i}`} className="h-64 rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}

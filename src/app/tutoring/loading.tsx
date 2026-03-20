import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export default function TutoringLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className="h-10 w-40 mx-auto" />
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={`skeleton-${i}`} className="h-48 rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}

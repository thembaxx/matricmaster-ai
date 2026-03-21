import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export default function SchoolLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<Skeleton className="h-10 w-32 mx-auto" />
				<div className="space-y-4">
					{[1, 2, 3].map((item) => (
						<Skeleton key={`school-skeleton-${item}`} className="h-24 rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

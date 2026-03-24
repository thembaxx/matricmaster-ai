import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SessionSkeleton() {
	return (
		<div className="space-y-4">
			{[...Array(3)].map((_, i) => (
				<Card key={i} className="p-4">
					<div className="flex items-start gap-3">
						<Skeleton className="size-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

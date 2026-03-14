import { Skeleton } from '@/components/ui/skeleton';

export default function PlannerLoading() {
	return (
		<div className="p-4 space-y-4">
			<Skeleton className="h-8 w-32" />
			<div className="grid grid-cols-7 gap-2">
				{Array.from({ length: 7 }).map((_, i) => (
					<Skeleton key={i} className="h-16 rounded-lg" />
				))}
			</div>
			<div className="space-y-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-20 rounded-xl" />
				))}
			</div>
		</div>
	);
}

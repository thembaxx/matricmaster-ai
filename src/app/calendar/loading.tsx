import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarLoading() {
	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-8 rounded-lg" />
					<Skeleton className="h-8 w-8 rounded-lg" />
				</div>
			</div>
			<div className="grid grid-cols-7 gap-1">
				{Array.from({ length: 35 }).map((_, i) => (
					<Skeleton key={`skeleton-${i}`} className="h-12 rounded-lg" />
				))}
			</div>
		</div>
	);
}

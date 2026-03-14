import { Skeleton } from '@/components/ui/skeleton';

export default function ScheduleLoading() {
	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-10 w-24 rounded-lg" />
			</div>
			<div className="grid grid-cols-7 gap-2">
				{Array.from({ length: 7 }).map((_, i) => (
					<Skeleton key={i} className="h-12 rounded-lg" />
				))}
			</div>
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-20 rounded-xl" />
				))}
			</div>
		</div>
	);
}

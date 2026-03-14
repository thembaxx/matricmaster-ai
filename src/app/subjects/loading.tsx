import { Skeleton } from '@/components/ui/skeleton';

export default function SubjectsLoading() {
	return (
		<div className="p-4 space-y-4">
			<Skeleton className="h-8 w-48" />
			<div className="grid grid-cols-2 gap-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
		</div>
	);
}

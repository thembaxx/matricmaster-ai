import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsLoading() {
	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-20 rounded-lg" />
			</div>
			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex gap-3 p-3 rounded-xl border">
						<Skeleton className="h-10 w-10 rounded-full" />
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

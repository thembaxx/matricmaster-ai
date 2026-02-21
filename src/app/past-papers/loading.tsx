import { Skeleton } from '@/components/ui/skeleton';

export default function PastPapersLoading() {
	return (
		<div className="flex flex-col h-full bg-background p-6">
			<div className="flex items-center justify-between mb-8">
				<div className="space-y-2">
					<Skeleton className="h-8 w-40 rounded-lg" />
					<Skeleton className="h-4 w-60 rounded-lg" />
				</div>
				<Skeleton className="h-10 w-32 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="p-6 rounded-[2rem] bg-card/50 border border-border/20 space-y-4">
						<Skeleton className="h-6 w-3/4 rounded-lg" />
						<Skeleton className="h-4 w-1/2 rounded-lg" />
						<Skeleton className="h-20 w-full rounded-xl" />
						<div className="flex gap-2">
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-16 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

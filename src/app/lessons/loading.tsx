import { Skeleton } from '@/components/ui/skeleton';

export default function LessonsLoading() {
	return (
		<div className="flex flex-col h-full bg-background p-6">
			<div className="flex items-center justify-between mb-8">
				<Skeleton className="h-8 w-32 rounded-lg" />
				<Skeleton className="h-10 w-40 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="p-6 rounded-[2rem] bg-card/50 border border-border/20 space-y-4">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<Skeleton className="h-6 w-3/4 rounded-lg" />
						<Skeleton className="h-4 w-full rounded-lg" />
						<Skeleton className="h-2 w-1/2 rounded-full" />
					</div>
				))}
			</div>
		</div>
	);
}

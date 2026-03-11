import { Skeleton } from '@/components/ui/skeleton';

export default function AITutorLoading() {
	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex-1 flex flex-col gap-4 p-6 max-w-4xl mx-auto w-full">
				<Skeleton className="h-12 w-full rounded-xl" />
				<div className="flex-1 space-y-4">
					<Skeleton className="h-24 w-full rounded-2xl" />
					<Skeleton className="h-32 w-full rounded-2xl" />
					<Skeleton className="h-16 w-2/3 rounded-2xl" />
				</div>
				<Skeleton className="h-14 w-full rounded-2xl" />
			</div>
		</div>
	);
}

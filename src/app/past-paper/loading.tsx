import { Skeleton } from '@/components/ui/skeleton';

export default function PastPaperLoading() {
	return (
		<div className="flex flex-col min-h-screen bg-background p-6">
			<div className="max-w-4xl mx-auto w-full space-y-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-[60vh] w-full rounded-xl" />
				<div className="flex gap-4">
					<Skeleton className="h-12 flex-1 rounded-lg" />
					<Skeleton className="h-12 w-32 rounded-lg" />
				</div>
			</div>
		</div>
	);
}

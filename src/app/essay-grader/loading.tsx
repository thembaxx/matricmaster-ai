import { Skeleton } from '@/components/ui/skeleton';

export default function EssayGraderLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto space-y-6">
				<Skeleton className="h-10 w-40 mx-auto" />
				<Skeleton className="h-64 rounded-2xl" />
				<Skeleton className="h-32 rounded-2xl" />
			</div>
		</div>
	);
}

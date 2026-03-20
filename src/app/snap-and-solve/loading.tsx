import { Skeleton } from '@/components/ui/skeleton';

export default function SnapAndSolveLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto space-y-6">
				<Skeleton className="h-10 w-56 mx-auto" />
				<Skeleton className="h-64 rounded-2xl" />
				<div className="space-y-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/6" />
				</div>
			</div>
		</div>
	);
}

import { Skeleton } from '@/components/ui/skeleton';

export default function ExamTimerLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4 flex items-center justify-center">
			<div className="text-center space-y-4">
				<Skeleton className="h-32 w-32 rounded-full mx-auto" />
				<Skeleton className="h-6 w-32 mx-auto" />
			</div>
		</div>
	);
}

'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function LessonCompleteSkeleton() {
	return (
		<div className="flex flex-col h-full bg-background">
			<header className="px-6 py-12 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
				<Skeleton className="w-10 h-10 rounded-full" />
				<Skeleton className="h-6 w-24 rounded-full" />
				<div className="w-10" />
			</header>

			<div className="flex-1 px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full">
				<Skeleton className="w-56 h-56 rounded-[3rem] mb-12" />
				
				<div className="text-center space-y-4 mb-12 w-full">
					<Skeleton className="h-16 w-3/4 mx-auto rounded-full" />
					<Skeleton className="h-6 w-1/2 mx-auto rounded-full" />
				</div>

				<div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-card p-4 rounded-3xl flex flex-col items-center border border-border/50">
							<Skeleton className="w-10 h-10 rounded-2xl mb-3" />
							<Skeleton className="h-6 w-12 rounded-full mb-2" />
							<Skeleton className="h-3 w-16 rounded-full" />
						</div>
					))}
				</div>

				<div className="w-full max-w-md space-y-4 px-1">
					<div className="flex justify-between">
						<Skeleton className="h-4 w-20 rounded-full" />
						<Skeleton className="h-4 w-12 rounded-full" />
					</div>
					<Skeleton className="h-3 w-full rounded-full" />
					
					<div className="pt-8 space-y-4">
						<Skeleton className="h-16 w-full rounded-3xl" />
						<Skeleton className="h-14 w-full rounded-2xl" />
						<Skeleton className="h-14 w-full rounded-2xl" />
					</div>
				</div>
			</div>
		</div>
	);
}

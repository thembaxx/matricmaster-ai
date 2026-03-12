'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EnhancedTestQuizSkeleton() {
	return (
		<div className="flex flex-col h-screen overflow-hidden bg-background p-6">
			<div className="flex flex-col items-center justify-center h-full">
				<Card className="premium-glass border-none p-10 h-auto w-full max-w-lg rounded-[2.5rem] flex flex-col items-center gap-8">
					<Skeleton className="w-20 h-20 rounded-2xl" />
					<div className="space-y-4 w-full text-center">
						<Skeleton className="h-8 w-3/4 mx-auto rounded-full" />
						<Skeleton className="h-4 w-1/2 mx-auto rounded-full" />
					</div>
					<div className="flex flex-wrap gap-3 justify-center">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-10 w-24 rounded-full" />
						))}
					</div>
					<Skeleton className="h-12 w-full rounded-2xl mt-4" />
				</Card>
			</div>
		</div>
	);
}

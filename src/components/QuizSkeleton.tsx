import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function QuizSkeleton() {
	return (
		<div className="flex flex-col h-full bg-background p-6 gap-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-10 w-24 rounded-xl" />
			</div>

			<Card className="p-8 space-y-6">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-4 w-3/4" />

				<div className="space-y-4 pt-4">
					{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
					{[1, 2, 3, 4].map((i) => (
						<div key={`skeleton-${i}`} className="flex items-center gap-4">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-12 flex-1 rounded-xl" />
						</div>
					))}
				</div>
			</Card>

			<div className="flex justify-between">
				<Skeleton className="h-12 w-32 rounded-xl" />
				<Skeleton className="h-12 w-32 rounded-xl" />
			</div>
		</div>
	);
}

export function PdfViewerSkeleton() {
	return (
		<div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900">
			<header className="shrink-0 flex items-center justify-between px-6 py-3 border-b bg-card/80 backdrop-blur-md">
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-40" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center">
				<div className="space-y-6 text-center">
					<div className="relative">
						<Skeleton className="h-16 w-16 rounded-full" />
					</div>
					<Skeleton className="h-4 w-32" />
				</div>
			</div>
		</div>
	);
}

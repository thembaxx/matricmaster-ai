import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
	return (
		<div className="flex flex-col h-full bg-background p-6 max-w-4xl mx-auto w-full">
			<div className="flex items-center gap-6 mb-8">
				<Skeleton className="w-24 h-24 rounded-full" />
				<div className="space-y-3">
					<Skeleton className="h-8 w-48 rounded-lg" />
					<Skeleton className="h-4 w-32 rounded-lg" />
				</div>
			</div>
			<div className="grid grid-cols-3 gap-4 mb-8">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="p-4 rounded-2xl bg-card/50 text-center space-y-2">
						<Skeleton className="h-8 w-12 mx-auto rounded-lg" />
						<Skeleton className="h-3 w-20 mx-auto rounded-lg" />
					</div>
				))}
			</div>
			<div className="space-y-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="p-4 rounded-2xl bg-card/50 flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 rounded-lg" />
							<Skeleton className="h-3 w-24 rounded-lg" />
						</div>
						<Skeleton className="h-8 w-20 rounded-lg" />
					</div>
				))}
			</div>
		</div>
	);
}

import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
	return (
		<div className="p-4 space-y-6">
			<Skeleton className="h-8 w-40" />
			<div className="space-y-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="flex items-center justify-between p-4 rounded-xl border">
						<div className="space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-48" />
						</div>
						<Skeleton className="h-6 w-12 rounded-full" />
					</div>
				))}
			</div>
		</div>
	);
}

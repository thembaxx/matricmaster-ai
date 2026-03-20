export default function PeriodicTableLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-5xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-56 bg-muted rounded mx-auto" />
				<div className="grid grid-cols-9 gap-1">
					{Array.from({ length: 18 }).map((_, i) => (
						<div key={`skeleton-${i}`} className="aspect-square bg-muted rounded" />
					))}
				</div>
			</div>
		</div>
	);
}

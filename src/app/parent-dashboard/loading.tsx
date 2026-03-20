export default function ParentDashboardLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-48 bg-muted rounded mx-auto" />
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={`skeleton-${i}`} className="h-32 bg-muted rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

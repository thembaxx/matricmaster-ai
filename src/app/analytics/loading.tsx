export default function AnalyticsLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-36 bg-muted rounded mx-auto" />
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-40 bg-muted rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}

export default function CurriculumMapLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-64 bg-muted rounded mx-auto" />
				<div className="grid gap-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={`skeleton-${i}`} className="h-24 bg-muted rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

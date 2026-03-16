export default function SnapAndSolveLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-56 bg-muted rounded mx-auto" />
				<div className="h-64 bg-muted rounded-2xl" />
				<div className="space-y-4">
					<div className="h-4 w-full bg-muted rounded" />
					<div className="h-4 w-5/6 bg-muted rounded" />
					<div className="h-4 w-4/6 bg-muted rounded" />
				</div>
			</div>
		</div>
	);
}

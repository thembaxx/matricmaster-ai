export default function CommonQuestionsLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-48 bg-muted rounded mx-auto" />
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-20 bg-muted rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

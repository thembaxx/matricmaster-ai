export default function ChannelsLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6 animate-pulse">
				<div className="h-8 w-32 bg-muted rounded" />
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-20 bg-muted rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

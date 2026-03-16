export default function OfflineLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4 flex items-center justify-center">
			<div className="text-center space-y-4 animate-pulse">
				<div className="h-24 w-24 rounded-full bg-muted mx-auto" />
				<div className="h-6 w-48 bg-muted rounded mx-auto" />
			</div>
		</div>
	);
}

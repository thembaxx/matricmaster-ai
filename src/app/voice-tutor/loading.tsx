export default function VoiceTutorLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
				<div className="h-10 w-48 bg-muted rounded mx-auto" />
				<div className="h-32 bg-muted rounded-2xl" />
				<div className="h-96 bg-muted rounded-2xl" />
			</div>
		</div>
	);
}

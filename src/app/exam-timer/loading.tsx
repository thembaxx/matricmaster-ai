export default function ExamTimerLoading() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4 flex items-center justify-center">
			<div className="text-center space-y-4 animate-pulse">
				<div className="h-32 w-32 rounded-full bg-muted mx-auto" />
				<div className="h-6 w-32 bg-muted rounded mx-auto" />
			</div>
		</div>
	);
}

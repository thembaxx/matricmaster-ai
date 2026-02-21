export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="flex flex-col items-center gap-8">
				<div
					className="w-16 h-16 rounded-2xl bg-primary shadow-lg animate-pulse"
					style={{ animationDuration: '1.5s' }}
				/>
				<div className="flex flex-col items-center gap-2">
					<p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
						MatricMaster
					</p>
					<div className="flex gap-1">
						<span
							className="w-1 h-1 rounded-full bg-primary animate-pulse"
							style={{ animationDelay: '0ms', animationDuration: '1s' }}
						/>
						<span
							className="w-1 h-1 rounded-full bg-primary animate-pulse"
							style={{ animationDelay: '200ms', animationDuration: '1s' }}
						/>
						<span
							className="w-1 h-1 rounded-full bg-primary animate-pulse"
							style={{ animationDelay: '400ms', animationDuration: '1s' }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

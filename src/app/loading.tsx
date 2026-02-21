import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<div className="h-16 border-b border-border/20 flex items-center px-6 gap-4">
				<Skeleton className="w-10 h-10 rounded-xl" />
				<Skeleton className="w-32 h-6 rounded-lg" />
				<div className="flex-1" />
				<Skeleton className="w-10 h-10 rounded-xl" />
			</div>
			<div className="flex-1 flex items-center justify-center">
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
		</div>
	);
}

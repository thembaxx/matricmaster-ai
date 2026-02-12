import { Loader2 } from 'lucide-react';

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-12 w-12 animate-spin text-blue-500" />
				<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
			</div>
		</div>
	);
}

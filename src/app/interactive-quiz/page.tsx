import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import InteractiveQuiz from '@/screens/InteractiveQuiz';

export default function InteractiveQuizPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
					<Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
				</div>
			}
		>
			<InteractiveQuiz />
		</Suspense>
	);
}

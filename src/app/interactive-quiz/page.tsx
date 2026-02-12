import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import InteractiveQuiz from '@/screens/InteractiveQuiz';

export const metadata: Metadata = {
	title: 'Interactive Quiz | MatricMaster AI',
	description: 'Engage with AI-powered interactive quizzes for better learning.',
};

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

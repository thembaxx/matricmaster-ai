'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineIndicator } from '@/components/Offline/OfflineIndicator';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const QuizScreen = dynamic(() => import('@/screens/Quiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

function QuizErrorFallback() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
			<h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
			<p className="text-muted-foreground mb-4">
				We couldn&apos;t load the quiz. Please try again.
			</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
			>
				Reload Quiz
			</button>
		</div>
	);
}

export default function QuizPage() {
	return (
		<ErrorBoundary fallback={<QuizErrorFallback />}>
			<OfflineIndicator />
			<QuizScreen />
		</ErrorBoundary>
	);
}

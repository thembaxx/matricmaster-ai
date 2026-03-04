'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const InteractiveQuiz = dynamic(() => import('@/screens/InteractiveQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export function InteractiveQuizClient({ initialId }: { initialId?: string }) {
	return (
		<Suspense fallback={<QuizSkeleton />}>
			<InteractiveQuiz initialId={initialId} />
		</Suspense>
	);
}

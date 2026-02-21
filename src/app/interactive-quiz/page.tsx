'use client';

import dynamic from 'next/dynamic';

import { Suspense } from 'react';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const InteractiveQuiz = dynamic(() => import('@/screens/InteractiveQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function InteractiveQuizPage() {
	return (
		<Suspense fallback={<QuizSkeleton />}>
			<InteractiveQuiz />
		</Suspense>
	);
}

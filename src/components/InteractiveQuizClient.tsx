'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const InteractiveQuiz = dynamic(() => import('@/screens/InteractiveQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export function InteractiveQuizClient({ initialId }: { initialId?: string }) {
	return <InteractiveQuiz initialId={initialId} />;
}

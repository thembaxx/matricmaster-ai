'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import PageTransition from '@/components/Transition/PageTransition';

const PracticeQuiz = dynamic(() => import('@/screens/PracticeQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function PracticeQuizPage() {
	return (
		<PageTransition>
			<PracticeQuiz />
		</PageTransition>
	);
}

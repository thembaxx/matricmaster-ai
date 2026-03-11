'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import PageTransition from '@/components/Transition/PageTransition';

const QuizScreen = dynamic(() => import('@/screens/Quiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function QuizPage() {
	return (
		<PageTransition>
			<QuizScreen />
		</PageTransition>
	);
}

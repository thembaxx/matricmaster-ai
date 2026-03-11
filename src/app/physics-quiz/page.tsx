'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import PageTransition from '@/components/Transition/PageTransition';

const PhysicsQuizScreen = dynamic(() => import('@/screens/PhysicsQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function PhysicsQuizPage() {
	return (
		<PageTransition>
			<PhysicsQuizScreen />
		</PageTransition>
	);
}

'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const PhysicsQuizScreen = dynamic(() => import('@/screens/PhysicsQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function PhysicsQuizPage() {
	return <PhysicsQuizScreen />;
}

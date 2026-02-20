'use client';

import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';

const MathematicsQuizScreen = dynamic(() => import('@/screens/MathematicsQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default function MathematicsQuizPage() {
	return <MathematicsQuizScreen />;
}

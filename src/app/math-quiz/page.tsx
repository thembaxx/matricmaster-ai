'use client';

import dynamicImport from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import PageTransition from '@/components/Transition/PageTransition';

const MathematicsQuizScreen = dynamicImport(() => import('@/screens/MathematicsQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export const dynamic = 'force-dynamic';

export default function MathematicsQuizPage() {
	return (
		<PageTransition>
			<MathematicsQuizScreen />
		</PageTransition>
	);
}

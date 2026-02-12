import type { Metadata } from 'next';
import MathematicsQuizScreen from '@/screens/MathematicsQuiz';

export const metadata: Metadata = {
	title: 'Mathematics Quiz | MatricMaster AI',
	description: 'Practice Mathematics questions to ace your exams.',
};

export default function MathematicsQuizPage() {
	return <MathematicsQuizScreen />;
}

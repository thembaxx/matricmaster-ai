import type { Metadata } from 'next';
import PracticeQuiz from '@/screens/PracticeQuiz';

export const metadata: Metadata = {
	title: 'Practice Quiz | MatricMaster AI',
	description: 'Practice with interactive quizzes tailored to your learning needs.',
};

export default function PracticeQuizPage() {
	return <PracticeQuiz />;
}

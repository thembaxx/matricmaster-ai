import type { Metadata } from 'next';
import PhysicsQuizScreen from '@/screens/PhysicsQuiz';

export const metadata: Metadata = {
	title: 'Physics Quiz | MatricMaster AI',
	description: 'Practice Physics questions to prepare for your exams.',
};

export default function PhysicsQuizPage() {
	return <PhysicsQuizScreen />;
}

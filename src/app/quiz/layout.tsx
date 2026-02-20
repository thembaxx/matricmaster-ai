import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quiz | MatricMaster AI',
	description: 'Practice with interactive quizzes tailored to your learning needs.',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

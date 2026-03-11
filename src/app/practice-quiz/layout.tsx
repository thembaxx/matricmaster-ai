import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Practice Quiz | MatricMaster',
	description: 'Practice with interactive quizzes tailored to your learning needs.',
};

export default function PracticeQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

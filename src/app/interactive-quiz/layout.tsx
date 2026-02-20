import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Interactive Quiz | MatricMaster AI',
	description: 'Engage with AI-powered interactive quizzes for better learning.',
};

export default function InteractiveQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

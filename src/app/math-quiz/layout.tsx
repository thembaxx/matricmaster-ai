import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Mathematics Quiz | MatricMaster',
	description: 'Practice Mathematics questions to ace your exams.',
};

export default function MathQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

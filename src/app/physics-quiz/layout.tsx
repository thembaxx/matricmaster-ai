import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Physics Quiz | MatricMaster AI',
	description: 'Practice Physics questions to prepare for your exams.',
};

export default function PhysicsQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

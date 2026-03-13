import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Practice Quiz | ${appConfig.name} AI`,
	description: 'Practice with interactive quizzes tailored to your learning needs.',
};

export default function PracticeQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

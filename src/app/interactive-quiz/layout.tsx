import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Interactive Quiz | ${appConfig.name}`,
	description: 'Engage with interactive quizzes for better learning.',
};

export default function InteractiveQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

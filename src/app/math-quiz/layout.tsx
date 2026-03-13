import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Mathematics Quiz | ${appConfig.name} AI`,
	description: 'Practice Mathematics questions to ace your exams.',
};

export default function MathQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

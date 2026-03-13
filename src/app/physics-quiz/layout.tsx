import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Physics Quiz | ${appConfig.name} AI`,
	description: 'Practice Physics questions to prepare for your exams.',
};

export default function PhysicsQuizLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

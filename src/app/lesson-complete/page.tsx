import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const LessonCompleteScreen = dynamic(() => import('@/screens/LessonComplete'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Lesson Complete | ${appConfig.name} AI`,
	description: 'Congratulations on completing your lesson! Track your progress.',
};

export default function LessonCompletePage() {
	return <LessonCompleteScreen />;
}

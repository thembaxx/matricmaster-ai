import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import LessonCompleteScreen from '@/screens/LessonComplete';

export const metadata: Metadata = {
	title: `Lesson Complete | ${appConfig.name} AI`,
	description: 'Congratulations on completing your lesson! Track your progress.',
};

export default function LessonCompletePage() {
	return <LessonCompleteScreen />;
}

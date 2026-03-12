import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import StudyPathScreen from '@/screens/StudyPath';

export const metadata: Metadata = {
	title: `Study Path | ${appConfig.name} AI`,
	description: 'Track your learning path and progress.',
};

export default function StudyPathPage() {
	return <StudyPathScreen />;
}

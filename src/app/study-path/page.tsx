import type { Metadata } from 'next';
import StudyPathScreen from '@/screens/StudyPath';

export const metadata: Metadata = {
	title: 'Study Path | MatricMaster AI',
	description: 'Track your learning path and progress.',
};

export default function StudyPathPage() {
	return <StudyPathScreen />;
}

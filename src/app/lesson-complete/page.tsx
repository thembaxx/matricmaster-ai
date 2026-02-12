import type { Metadata } from 'next';
import LessonCompleteScreen from '@/screens/LessonComplete';

export const metadata: Metadata = {
	title: 'Lesson Complete | MatricMaster AI',
	description: 'Congratulations on completing your lesson! Track your progress.',
};

export default function LessonCompletePage() {
	return <LessonCompleteScreen />;
}

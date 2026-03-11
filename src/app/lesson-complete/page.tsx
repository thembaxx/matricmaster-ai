import type { Metadata } from 'next';
import LessonCompleteScreen from '@/screens/LessonComplete';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Lesson Complete | MatricMaster',
	description: 'Congratulations on completing your lesson! Track your progress.',
};

export default function LessonCompletePage() {
	return (
		<PageTransition>
			<LessonCompleteScreen />
		</PageTransition>
	);
}

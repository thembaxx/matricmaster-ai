import type { Metadata } from 'next';
import StudyPathScreen from '@/screens/StudyPath';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Study path | MatricMaster',
	description: 'Track your learning path and progress.',
};

export default function StudyPathPage() {
	return (
		<PageTransition>
			<StudyPathScreen />
		</PageTransition>
	);
}

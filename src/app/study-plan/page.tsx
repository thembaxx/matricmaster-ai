import type { Metadata } from 'next';
import StudyPlanWizardScreen from '@/screens/StudyPlanWizard';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Study plan | MatricMaster',
	description: 'Create your personalized study plan.',
};

export default function StudyPlanPage() {
	return (
		<PageTransition>
			<StudyPlanWizardScreen />
		</PageTransition>
	);
}

import type { Metadata } from 'next';
import StudyPlanWizardScreen from '@/screens/StudyPlanWizard';

export const metadata: Metadata = {
	title: 'Study Plan | MatricMaster AI',
	description: 'Create your personalized study plan.',
};

export default function StudyPlanPage() {
	return <StudyPlanWizardScreen />;
}

import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import StudyPlanWizardScreen from '@/screens/StudyPlanWizard';

export const metadata: Metadata = {
	title: `Study Plan | ${appConfig.name}`,
	description: 'Create your personalized NSC exam study plan.',
};

export default function StudyPlanPage() {
	return <StudyPlanWizardScreen />;
}

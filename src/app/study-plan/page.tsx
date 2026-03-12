import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import StudyPlanWizardScreen from '@/screens/StudyPlanWizard';

export const metadata: Metadata = {
	title: `Study Plan | ${appConfig.name} AI`,
	description: 'Create your personalized study plan.',
};

export default function StudyPlanPage() {
	return <StudyPlanWizardScreen />;
}

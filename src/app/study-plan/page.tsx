import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const StudyPlanWizardScreen = dynamic(() => import('@/screens/StudyPlanWizard'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Study Plan | ${appConfig.name}`,
	description: 'Create your personalized NSC exam study plan.',
};

export default function StudyPlanPage() {
	return <StudyPlanWizardScreen />;
}

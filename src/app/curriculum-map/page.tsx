import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import CurriculumMapScreen from '@/screens/CurriculumMap';

export const metadata: Metadata = {
	title: `Curriculum Map | ${appConfig.name}`,
	description: 'Visualize your progress across the NSC Grade 12 syllabus.',
};

export default function CurriculumMapPage() {
	return <CurriculumMapScreen />;
}

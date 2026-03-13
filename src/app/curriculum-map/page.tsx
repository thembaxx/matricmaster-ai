import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import CurriculumMapScreen from '@/screens/CurriculumMap';

export const metadata: Metadata = {
	title: `Curriculum Map | ${appConfig.name} AI`,
	description: 'Visualize your progress across the entire South African Grade 12 NSC syllabus.',
};

export default function CurriculumMapPage() {
	return <CurriculumMapScreen />;
}

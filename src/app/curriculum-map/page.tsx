import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const CurriculumMapScreen = dynamic(() => import('@/screens/CurriculumMap'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Curriculum Map | ${appConfig.name}`,
	description: 'Visualize your progress across the NSC Grade 12 syllabus.',
};

export default function CurriculumMapPage() {
	return <CurriculumMapScreen />;
}

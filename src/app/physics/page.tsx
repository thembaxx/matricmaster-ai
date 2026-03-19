import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const PhysicalSciencesScreen = dynamic(() => import('@/screens/PhysicalSciences'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Physical Sciences | ${appConfig.name} AI`,
	description: 'Master Physics and Chemistry with interactive lessons and practice questions.',
};

export default function PhysicalSciencesPage() {
	return <PhysicalSciencesScreen />;
}

import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import PhysicalSciencesScreen from '@/screens/PhysicalSciences';

export const metadata: Metadata = {
	title: `Physical Sciences | ${appConfig.name} AI`,
	description: 'Master Physics and Chemistry with interactive lessons and practice questions.',
};

export default function PhysicalSciencesPage() {
	return <PhysicalSciencesScreen />;
}

import type { Metadata } from 'next';
import PhysicalSciencesScreen from '@/screens/PhysicalSciences';

export const metadata: Metadata = {
	title: 'Physical Sciences | MatricMaster AI',
	description: 'Master Physics and Chemistry with interactive lessons and practice questions.',
};

export default function PhysicalSciencesPage() {
	return <PhysicalSciencesScreen />;
}

import type { Metadata } from 'next';
import PhysicalSciencesScreen from '@/screens/PhysicalSciences';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Physical Sciences | MatricMaster',
	description: 'Master Physics and Chemistry with interactive lessons and practice questions.',
};

export default function PhysicalSciencesPage() {
	return (
		<PageTransition>
			<PhysicalSciencesScreen />
		</PageTransition>
	);
}

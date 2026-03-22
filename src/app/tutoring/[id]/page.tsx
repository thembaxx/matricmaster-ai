import type { Metadata } from 'next';
import TutorProfile from '@/screens/TutorProfile';

export const metadata: Metadata = {
	title: 'Tutor Profile - MatricMaster AI',
	description: 'View tutor profile and book sessions',
};

export default function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
	return <TutorProfile params={params} />;
}

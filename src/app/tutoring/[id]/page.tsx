import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import TutorProfile from '@/screens/TutorProfile';

export const metadata: Metadata = {
	title: 'Tutor Profile - Lumni AI',
	description: 'View tutor profile and book sessions',
};

export default function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
	return (
		<ViewTransition enter="vt-nav-forward" exit="vt-nav-back" default="none">
			<TutorProfile params={params} />
		</ViewTransition>
	);
}

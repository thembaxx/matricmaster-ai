import type { Metadata } from 'next';
import BecomeTutor from '@/screens/BecomeTutor';

export const metadata: Metadata = {
	title: 'Become a Tutor - Lumni AI',
	description: 'Create your tutor profile and start earning XP',
};

export default function BecomeTutorPage() {
	return <BecomeTutor />;
}

import type { Metadata } from 'next';
import LessonsScreen from '@/screens/Lessons';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Lessons | MatricMaster AI',
	description: 'Browse and complete interactive lessons.',
	alternates: { canonical: `${baseUrl}/lessons` },
};

export default function LessonsPage() {
	return <LessonsScreen />;
}

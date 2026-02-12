import type { Metadata } from 'next';
import LessonsScreen from '@/screens/Lessons';

export const metadata: Metadata = {
	title: 'Lessons | MatricMaster AI',
	description: 'Browse and complete interactive lessons.',
};

export default function LessonsPage() {
	return <LessonsScreen />;
}

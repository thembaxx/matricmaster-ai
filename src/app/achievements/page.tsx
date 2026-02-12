import type { Metadata } from 'next';
import AchievementsScreen from '@/screens/Achievements';

export const metadata: Metadata = {
	title: 'Achievements | MatricMaster AI',
	description: 'Track your accomplishments and earn badges.',
};

export default function AchievementsPage() {
	return <AchievementsScreen />;
}

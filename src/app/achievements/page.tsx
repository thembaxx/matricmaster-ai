import type { Metadata } from 'next';
import AchievementsScreen from '@/screens/Achievements';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Achievements | MatricMaster AI',
	description: 'Track your accomplishments and earn badges.',
	alternates: { canonical: `${baseUrl}/achievements` },
	openGraph: {
		title: 'My Achievements | MatricMaster AI',
		description: 'Track your accomplishments and earn badges for your learning progress.',
		url: `${baseUrl}/achievements`,
		type: 'website',
	},
};

export default function AchievementsPage() {
	return <AchievementsScreen />;
}

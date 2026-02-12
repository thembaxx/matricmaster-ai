import type { Metadata } from 'next';
import LeaderboardScreen from '@/screens/Leaderboard';

export const metadata: Metadata = {
	title: 'Leaderboard | MatricMaster AI',
	description: 'See how you rank against other students.',
};

export default function LeaderboardPage() {
	return <LeaderboardScreen />;
}

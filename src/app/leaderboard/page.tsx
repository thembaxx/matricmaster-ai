import type { Metadata } from 'next';
import LeaderboardScreen from '@/screens/Leaderboard';
import PageTransition from '@/components/Transition/PageTransition';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Leaderboard | MatricMaster',
	description: 'See how you rank against other students.',
	alternates: { canonical: `${baseUrl}/leaderboard` },
	openGraph: {
		title: 'Student Leaderboard | MatricMaster',
		description: 'See how you rank against other students and compete for the top spot.',
		url: `${baseUrl}/leaderboard`,
		type: 'website',
	},
};

export default function LeaderboardPage() {
	return (
		<PageTransition>
			<LeaderboardScreen />
		</PageTransition>
	);
}

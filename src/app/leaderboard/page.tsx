import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const LeaderboardScreen = dynamic(() => import('@/screens/Leaderboard'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Leaderboard | ${appConfig.name}`,
	description: 'See how you rank against other Matric students preparing for NSC.',
	alternates: { canonical: `${baseUrl}/leaderboard` },
	openGraph: {
		title: `Student Leaderboard | ${appConfig.name}`,
		description: 'See how you rank against other Grade 12 students and compete for the top spot.',
		url: `${baseUrl}/leaderboard`,
		type: 'website',
	},
};

export default function LeaderboardPage() {
	return <LeaderboardScreen />;
}

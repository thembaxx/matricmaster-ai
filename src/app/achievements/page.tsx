import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import AchievementsScreen from '@/screens/Achievements';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Achievements | ${appConfig.name}`,
	description: 'Track your achievements and unlock badges as you prepare for your NSC exams.',
	alternates: { canonical: `${baseUrl}/achievements` },
	openGraph: {
		title: `My Achievements | ${appConfig.name}`,
		description: 'Track your accomplishments and earn badges as you crush your matric exams.',
		url: `${baseUrl}/achievements`,
		type: 'website',
	},
};

export default function AchievementsPage() {
	return <AchievementsScreen />;
}

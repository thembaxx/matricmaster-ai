import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const TeamGoalsScreen = dynamic(() => import('@/screens/TeamGoals'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Team Goals | ${appConfig.name}`,
	description: 'Join team challenges and compete with other students to reach collective goals.',
	alternates: { canonical: `${baseUrl}/team-goals` },
	openGraph: {
		title: `Team Goals | ${appConfig.name}`,
		description: 'Join team challenges and compete together with fellow students.',
		url: `${baseUrl}/team-goals`,
		type: 'website',
	},
};

export default function TeamGoalsPage() {
	return <TeamGoalsScreen />;
}

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const CommunityHubScreen = dynamic(() => import('@/screens/CommunityHub'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh] animate-pulse bg-muted/20 rounded-3xl m-6" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Community Hub | ${appConfig.name.toLowerCase()}`,
	description:
		'Connect with fellow South African Grade 12 students in study channels and focus rooms.',
	alternates: { canonical: `${baseUrl}/community` },
	openGraph: {
		title: `Unified Community Hub | ${appConfig.name.toLowerCase()}`,
		description: 'The social heart of your matric journey.',
		url: `${baseUrl}/community`,
		type: 'website',
	},
};

export default function CommunityPage() {
	return (
		<div className="flex flex-col min-h-screen overflow-hidden w-full">
			<CommunityHubScreen />
		</div>
	);
}

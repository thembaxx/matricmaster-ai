import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const PracticeHubScreen = dynamic(() => import('@/screens/PracticeHub'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh] animate-pulse bg-muted/20 rounded-3xl m-6" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Practice Lab | ${appConfig.name}`,
	description: 'Practice with past papers, quizzes, and interactive exercises.',
	alternates: { canonical: `${baseUrl}/practice` },
	openGraph: {
		title: `Unified Practice Lab | ${appConfig.name}`,
		description: 'The ultimate practice resource for South African Grade 12 students.',
		url: `${baseUrl}/practice`,
		type: 'website',
	},
};

export default function PracticePage() {
	return (
		<div className="flex flex-col min-h-screen">
			<PracticeHubScreen />
		</div>
	);
}

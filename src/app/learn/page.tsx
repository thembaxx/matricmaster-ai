import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const LearningCenterScreen = dynamic(() => import('@/screens/LearningCenter'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh] animate-pulse bg-muted/20 rounded-3xl m-6" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Learning Hub | ${appConfig.name}`,
	description: 'Master your matric with unified lessons, curriculum maps, and study paths.',
	alternates: { canonical: `${baseUrl}/learn` },
	openGraph: {
		title: `Unified Learning Hub | ${appConfig.name}`,
		description: 'Everything you need to master the NSC Grade 12 curriculum in one place.',
		url: `${baseUrl}/learn`,
		type: 'website',
	},
};

export default function LearnPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<LearningCenterScreen />
		</div>
	);
}

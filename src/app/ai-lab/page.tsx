import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const AiLabScreen = dynamic(() => import('@/screens/AiLab'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh] animate-pulse bg-muted/20 rounded-3xl m-6" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `AI Lab | ${appConfig.name}`,
	description: 'Experiment with AI tools for learning.',
	alternates: { canonical: `${baseUrl}/ai-lab` },
	openGraph: {
		title: `Unified AI Lab Hub | ${appConfig.name}`,
		description: 'State-of-the-art AI tools for South African Matric students.',
		url: `${baseUrl}/ai-lab`,
		type: 'website',
	},
};

export default function AiLabPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<AiLabScreen />
		</div>
	);
}

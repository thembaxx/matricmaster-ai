import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const LessonsScreen = dynamic(() => import('@/screens/Lessons'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Lessons | ${appConfig.name} AI`,
	description: 'Browse and complete interactive lessons.',
	alternates: { canonical: `${baseUrl}/lessons` },
	openGraph: {
		title: `Interactive Lessons | ${appConfig.name} AI`,
		description:
			'Step-by-step lessons for Mathematics, Physical Sciences, and more for South African Grade 12 students.',
		url: `${baseUrl}/lessons`,
		type: 'website',
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'ItemList',
	name: 'Interactive Lessons',
	description: 'Educational lessons for South African NSC curriculum',
	itemListElement: [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Mathematics Lessons',
			url: `${baseUrl}/lessons?subject=mathematics`,
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: 'Physical Sciences Lessons',
			url: `${baseUrl}/lessons?subject=physical-sciences`,
		},
		{
			'@type': 'ListItem',
			position: 3,
			name: 'Life Sciences Lessons',
			url: `${baseUrl}/lessons?subject=life-sciences`,
		},
	],
};

export default function LessonsPage() {
	return (
		<>
			<script type="application/ld+json" suppressHydrationWarning>
				{JSON.stringify(jsonLd)}
			</script>
			<LessonsScreen />
		</>
	);
}

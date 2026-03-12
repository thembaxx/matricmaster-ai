import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import PastPapersScreen from '@/screens/PastPapers';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Past Papers | ${appConfig.name}`,
	description: 'Access NSC past papers with step-by-step explanations.',
	alternates: { canonical: `${baseUrl}/past-papers` },
	openGraph: {
		title: `NSC Past Papers | ${appConfig.name}`,
		description:
			'Access past papers from 2015-2024 with personalized explanations for South African Grade 12 students.',
		url: `${baseUrl}/past-papers`,
		type: 'website',
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'ItemList',
	name: 'NSC Past Papers',
	description: 'Collection of National Senior Certificate past papers with AI explanations',
	itemListElement: [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Mathematics Past Papers',
			url: `${baseUrl}/past-papers?subject=mathematics`,
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: 'Physical Sciences Past Papers',
			url: `${baseUrl}/past-papers?subject=physical-sciences`,
		},
		{
			'@type': 'ListItem',
			position: 3,
			name: 'Life Sciences Past Papers',
			url: `${baseUrl}/past-papers?subject=life-sciences`,
		},
	],
};

export default function PastPapersPage() {
	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema only, no user input
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<PastPapersScreen />
		</>
	);
}

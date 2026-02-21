import type { Metadata } from 'next';
import LessonsScreen from '@/screens/Lessons';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Lessons | MatricMaster AI',
	description: 'Browse and complete interactive lessons.',
	alternates: { canonical: `${baseUrl}/lessons` },
	openGraph: {
		title: 'Interactive Lessons | MatricMaster AI',
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
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema only, no user input
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<LessonsScreen />
		</>
	);
}

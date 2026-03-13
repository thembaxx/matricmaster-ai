import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Quiz | ${appConfig.name} AI`,
	description: 'Practice with interactive quizzes tailored to your learning needs.',
	alternates: { canonical: `${baseUrl}/quiz` },
	openGraph: {
		title: `Interactive Quizzes | ${appConfig.name} AI`,
		description:
			'Test your knowledge with adaptive quizzes for Mathematics, Physical Sciences, and more.',
		url: `${baseUrl}/quiz`,
		type: 'website',
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Quiz',
	name: `${appConfig.name} Practice Quizzes`,
	description: 'Interactive quizzes for South African NSC curriculum',
	educationalLevel: 'Grade 12',
	educationalUse: 'Practice',
	learningResourceType: 'Quiz',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema only, no user input
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{children}
		</>
	);
}

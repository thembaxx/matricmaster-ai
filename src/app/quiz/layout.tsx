import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Quiz | MatricMaster AI',
	description: 'Practice with interactive quizzes tailored to your learning needs.',
	alternates: { canonical: `${baseUrl}/quiz` },
	openGraph: {
		title: 'Interactive Quizzes | MatricMaster AI',
		description:
			'Test your knowledge with adaptive quizzes for Mathematics, Physical Sciences, and more.',
		url: `${baseUrl}/quiz`,
		type: 'website',
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Quiz',
	name: 'MatricMaster Practice Quizzes',
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

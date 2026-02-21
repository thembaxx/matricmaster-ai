import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'AI Tutor | MatricMaster AI',
	description: 'Get personalized help from our AI tutor for any subject.',
	alternates: { canonical: `${baseUrl}/ai-tutor` },
	openGraph: {
		title: 'AI Tutor | MatricMaster AI',
		description:
			'Get personalized help from our AI tutor for Mathematics, Physical Sciences, and more.',
		url: `${baseUrl}/ai-tutor`,
		type: 'website',
	},
};

export default function AITutorLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

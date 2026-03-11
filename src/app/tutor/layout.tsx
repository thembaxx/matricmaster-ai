import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Tutor hub | MatricMaster',
	description: 'Get personalized help from our expert tutors for any subject.',
	alternates: { canonical: `${baseUrl}/tutor` },
	openGraph: {
		title: 'Tutor hub | MatricMaster',
		description:
			'Get personalized help from our expert tutors for Mathematics, Physical Sciences, and more.',
		url: `${baseUrl}/tutor`,
		type: 'website',
	},
};

export default function AITutorLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

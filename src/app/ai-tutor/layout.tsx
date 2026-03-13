import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Study Helper | ${appConfig.name}`,
	description: "Get help with any NSC subject. Stuck on a question? We'll explain it.",
	alternates: { canonical: `${baseUrl}/ai-tutor` },
	openGraph: {
		title: `Study Helper | ${appConfig.name}`,
		description: 'Get help with Mathematics, Physical Sciences, and more NSC subjects.',
		url: `${baseUrl}/ai-tutor`,
		type: 'website',
	},
};

export default function AITutorLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

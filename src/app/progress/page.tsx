import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { appConfig } from '@/app.config';
import { getAuth } from '@/lib/auth';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Progress | ${appConfig.name} AI`,
	description: 'View your comprehensive learning progress and achievements.',
	alternates: { canonical: `${baseUrl}/progress` },
	openGraph: {
		title: `My Progress | ${appConfig.name} AI`,
		description: 'View your comprehensive learning progress and achievements.',
		url: `${baseUrl}/progress`,
		type: 'website',
	},
};

function extractHeaders(headersList: unknown) {
	const safeHeaders = new Headers();
	if (headersList && typeof headersList === 'object' && 'entries' in headersList) {
		for (const [key, value] of Object.entries(headersList)) {
			if (typeof key === 'string') {
				safeHeaders.set(key, String(value));
			}
		}
	}
	return safeHeaders;
}

const ProgressPage = async () => {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: extractHeaders(headersList) as any,
	});

	if (!session?.user) {
		redirect('/login');
	}

	const AnalyticsDashboard = (await import('@/components/Progress/AnalyticsDashboard')).default;

	return (
		<ViewTransition
			enter={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			exit={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			default="none"
		>
			<AnalyticsDashboard />
		</ViewTransition>
	);
};

export default ProgressPage;

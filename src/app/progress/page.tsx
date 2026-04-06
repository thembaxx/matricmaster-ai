import type { Metadata } from 'next';
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

const ProgressPage = async () => {
	const auth = await getAuth();
	const session = await auth.api.getSession();

	if (!session?.user) {
		redirect('/sign-in');
	}

	const UnifiedDashboard = (await import('@/components/Progress/UnifiedDashboard')).default;

	return (
		<ViewTransition
			enter={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			exit={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			default="none"
		>
			<UnifiedDashboard />
		</ViewTransition>
	);
};

export default ProgressPage;

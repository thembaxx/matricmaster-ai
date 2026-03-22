import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Dashboard | ${appConfig.name} AI`,
	description: 'Track your learning progress and continue your journey.',
	alternates: { canonical: `${baseUrl}/dashboard` },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

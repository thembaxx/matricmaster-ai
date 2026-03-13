import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { appConfig } from '@/app.config';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import ParentDashboardScreen from '@/screens/ParentDashboard';

export const metadata: Metadata = {
	title: `Parent Portal | ${appConfig.name} AI`,
	description: 'Monitor student progress, study time, and academic performance.',
};

export default async function ParentDashboardPage() {
	await dbManager.initialize();

	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		redirect('/sign-in?callbackUrl=/parent-dashboard');
	}

	return <ParentDashboardScreen userName={session.user.name || 'Student'} />;
}

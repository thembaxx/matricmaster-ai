import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { appConfig } from '@/app.config';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';

const ParentDashboardScreen = dynamic(() => import('@/screens/ParentDashboard'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `parent portal | ${appConfig.name} ai`,
	description: 'monitor student progress, study time, and academic performance.',
};

export const revalidate = 0;

export default async function ParentDashboardPage() {
	await dbManager.initialize();

	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		redirect('/login?callbackUrl=/parent-dashboard');
	}

	return <ParentDashboardScreen userName={session.user.name || 'student'} />;
}

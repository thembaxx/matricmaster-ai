import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { getAuth } from '@/lib/auth';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Dashboard | MatricMaster AI',
	description: 'Track your learning progress, view achievements, and continue your study journey.',
	alternates: { canonical: `${baseUrl}/dashboard` },
	openGraph: {
		title: 'My Dashboard | MatricMaster AI',
		description:
			'Track your learning progress, view achievements, and continue your study journey.',
		url: `${baseUrl}/dashboard`,
		type: 'website',
	},
};

const Dashboard = dynamic(() => import('@/screens/Dashboard'), {
	ssr: true,
	loading: () => <DashboardSkeleton />,
});

export default async function DashboardPage() {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) {
		redirect('/sign-in');
	}

	const [initialProgress, initialStreak] = await Promise.all([
		getUserProgressSummary(),
		getUserStreak(),
	]);

	return <Dashboard initialProgress={initialProgress} initialStreak={initialStreak} />;
}

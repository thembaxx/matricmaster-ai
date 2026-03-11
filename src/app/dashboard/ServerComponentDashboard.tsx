import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { getAuth } from '@/lib/auth';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Dashboard | MatricMaster',
	description: 'Track your learning progress, view achievements, and continue your study journey.',
	alternates: { canonical: `${baseUrl}/dashboard` },
	openGraph: {
		title: 'My Dashboard | MatricMaster',
		description:
			'Track your learning progress, view achievements, and continue your study journey.',
		url: `${baseUrl}/dashboard`,
		type: 'website',
	},
};

// Client component that uses React Query for real-time updates
const DashboardClient = dynamic(() => import('@/screens/DashboardWithReactQuery'), {
	ssr: false,
	loading: () => <DashboardSkeleton />,
});

export default async function ServerComponentDashboard() {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		redirect('/sign-in');
	}

	// Server-side data fetching for initial render
	const [initialProgress, initialStreak] = await Promise.all([
		getUserProgressSummary(),
		getUserStreak(),
	]);

	return (
		<DashboardClient
			initialProgress={initialProgress}
			initialStreak={initialStreak}
			session={session}
		/>
	);
}

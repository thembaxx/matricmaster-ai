import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { getAuth } from '@/lib/auth';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

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

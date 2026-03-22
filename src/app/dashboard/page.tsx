import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { generatePersonalizedBriefing } from '@/actions/ai-briefing';
import { getUnvisitedMistakesCountAction } from '@/actions/mistake-to-study-plan';
import { appConfig } from '@/app.config';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { getAuth } from '@/lib/auth';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getUserStreak } from '@/lib/db/progress-actions';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Dashboard | ${appConfig.name} AI`,
	description: 'Track your learning progress, view achievements, and continue your study journey.',
	alternates: { canonical: `${baseUrl}/dashboard` },
	openGraph: {
		title: `My Dashboard | ${appConfig.name} AI`,
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

	const [initialStreak, initialAchievements, briefingData, mistakeCount] = await Promise.all([
		getUserStreak(),
		getUserAchievements(),
		generatePersonalizedBriefing(),
		getUnvisitedMistakesCountAction(),
	]);

	return (
		<Dashboard
			initialStreak={initialStreak}
			initialAchievements={initialAchievements}
			session={session}
			briefingData={briefingData}
			mistakeCount={mistakeCount}
		/>
	);
}

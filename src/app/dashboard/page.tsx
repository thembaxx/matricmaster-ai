import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { generatePersonalizedBriefing } from '@/actions/ai-briefing';
import { getUnvisitedMistakesCountAction } from '@/actions/mistake-to-study-plan';
import { appConfig } from '@/app.config';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ACHIEVEMENTS } from '@/content';
import type { BriefingData, DashboardInitialStreak } from '@/content/mock/dashboard';
import { getAuth } from '@/lib/auth';
import type { UserAchievement } from '@/lib/db/achievement-actions';
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

export const revalidate = 0;

function DashboardErrorFallback() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
			<h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
			<p className="text-muted-foreground mb-4">
				We couldn&apos;t load your dashboard. Please try again.
			</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
			>
				Reload Dashboard
			</button>
		</div>
	);
}

function DashboardWithErrorBoundary({
	initialStreak,
	initialAchievements,
	session,
	briefingData,
	mistakeCount,
}: {
	initialStreak: DashboardInitialStreak | null;
	initialAchievements: { unlocked: UserAchievement[]; available: typeof ACHIEVEMENTS } | null;
	session: {
		user: { id: string; name?: string | null; email?: string | null; image?: string | null };
	};
	briefingData: BriefingData | null;
	mistakeCount: number;
}) {
	return (
		<ErrorBoundary fallback={<DashboardErrorFallback />}>
			<Dashboard
				initialStreak={initialStreak}
				initialAchievements={initialAchievements}
				session={session}
				briefingData={briefingData}
				mistakeCount={mistakeCount}
			/>
		</ErrorBoundary>
	);
}

function extractHeaders(headersList: any) {
	const safeHeaders = new Headers();
	for (const [key, value] of headersList.entries()) {
		safeHeaders.set(key, value);
	}
	return safeHeaders as Headers;
}

export default async function DashboardPage() {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: extractHeaders(headersList) as any,
	});
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
		<ViewTransition
			enter={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			exit={{ 'nav-forward': 'vt-nav-forward', 'nav-back': 'vt-nav-back', default: 'none' }}
			default="none"
		>
			<DashboardWithErrorBoundary
				initialStreak={initialStreak}
				initialAchievements={initialAchievements}
				session={session}
				briefingData={briefingData}
				mistakeCount={mistakeCount}
			/>
		</ViewTransition>
	);
}

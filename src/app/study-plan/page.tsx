import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';

const StudyPlanWizardScreen = dynamic(() => import('@/screens/StudyPlanWizard'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Study Plan | ${appConfig.name}`,
	description: 'Create your personalized NSC exam study plan.',
};

function StudyPlanLoading() {
	return (
		<div className="flex flex-col items-center justify-center h-full bg-background p-6">
			<div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
				<div className="w-16 h-16 rounded-full bg-primary/20" />
			</div>
			<h2 className="text-3xl font-black text-foreground mb-3 text-center">loading...</h2>
		</div>
	);
}

async function StudyPlanParamsHandler({
	searchParams,
}: {
	searchParams: Promise<{ topics?: string }>;
}) {
	const params = await searchParams;
	const topics = params.topics?.split(',').filter(Boolean) || [];
	return <StudyPlanWizardScreen prePopulatedTopics={topics} />;
}

export default function StudyPlanPage({
	searchParams,
}: {
	searchParams: Promise<{ topics?: string }>;
}) {
	return (
		<Suspense fallback={<StudyPlanLoading />}>
			<StudyPlanParamsHandler searchParams={searchParams} />
		</Suspense>
	);
}

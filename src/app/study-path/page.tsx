import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const StudyPathScreen = dynamic(() => import('@/screens/StudyPath'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Study Path | ${appConfig.name} AI`,
	description: 'Track your learning path and progress.',
};

export default function StudyPathPage({ searchParams }: { searchParams: { pathId?: string } }) {
	return <StudyPathScreen pathId={searchParams.pathId} />;
}

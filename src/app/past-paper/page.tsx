import type { Metadata } from 'next';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';
import { PastPaperViewerClient } from '@/components/PastPaperViewerClient';
import { PdfViewerSkeleton } from '@/components/QuizSkeleton';
import { mockPastPapers as PAST_PAPERS } from '@/content/mock';

interface PageProps {
	searchParams: Promise<{ id?: string; mode?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const { id } = await searchParams;
	const paper = PAST_PAPERS.find((p) => p.id === id);

	if (!paper) {
		return {
			title: `Past Paper | ${appConfig.name}`,
			description: 'Access NSC past papers with step-by-step explanations.',
		};
	}

	const title = `${paper.subject} ${paper.paper} (${paper.year})`;
	return {
		title: `${title} | ${appConfig.name}`,
		description: `Interactive viewer for ${title} past paper with detailed explanations.`,
		openGraph: {
			title: `${title} | ${appConfig.name}`,
			description: `Interactive viewer for ${title} past paper with detailed explanations.`,
			type: 'website',
		},
	};
}

export default async function PastPaperViewerPage({ searchParams }: PageProps) {
	const { id, mode } = await searchParams;

	return (
		<Suspense fallback={<PdfViewerSkeleton />}>
			<PastPaperViewerClient initialId={id} initialMode={mode} />
		</Suspense>
	);
}

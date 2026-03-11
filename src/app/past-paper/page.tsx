import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PastPaperViewerClient } from '@/components/PastPaperViewerClient';
import { PdfViewerSkeleton } from '@/components/QuizSkeleton';
import { PAST_PAPERS } from '@/constants/mock-data';

interface PageProps {
	searchParams: Promise<{ id?: string; mode?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const { id } = await searchParams;
	const paper = PAST_PAPERS.find((p) => p.id === id);

	if (!paper) {
		return {
			title: 'Past Paper | MatricMaster',
			description: 'Access NSC past papers with expert-guided explanations.',
		};
	}

	const title = `${paper.subject} ${paper.paper} (${paper.year})`;
	return {
		title: `${title} | MatricMaster`,
		description: `Interactive viewer for ${title} past paper with expert explanations.`,
		openGraph: {
			title: `${title} | MatricMaster`,
			description: `Interactive viewer for ${title} past paper with expert explanations.`,
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

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
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
			title: 'Past Paper | MatricMaster AI',
			description: 'Access NSC past papers with AI-powered explanations.',
		};
	}

	const title = `${paper.subject} ${paper.paper} (${paper.year})`;
	return {
		title: `${title} | MatricMaster AI`,
		description: `Interactive viewer for ${title} past paper with AI explanations.`,
		openGraph: {
			title: `${title} | MatricMaster AI`,
			description: `Interactive viewer for ${title} past paper with AI explanations.`,
			type: 'website',
		},
	};
}

const PastPaperViewerScreen = dynamic(() => import('@/screens/PastPaperViewer'), {
	ssr: false,
	loading: () => <PdfViewerSkeleton />,
});

export default async function PastPaperViewerPage({ searchParams }: PageProps) {
	const { id, mode } = await searchParams;

	return (
		<Suspense fallback={<PdfViewerSkeleton />}>
			<PastPaperViewerScreen initialId={id} initialMode={mode} />
		</Suspense>
	);
}

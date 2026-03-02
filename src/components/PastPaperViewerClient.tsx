'use client';

import dynamic from 'next/dynamic';
import { PdfViewerSkeleton } from '@/components/QuizSkeleton';

const PastPaperViewerScreen = dynamic(() => import('@/screens/PastPaperViewer'), {
	ssr: false,
	loading: () => <PdfViewerSkeleton />,
});

export function PastPaperViewerClient({
	initialId,
	initialMode,
}: {
	initialId?: string;
	initialMode?: string;
}) {
	return <PastPaperViewerScreen initialId={initialId} initialMode={initialMode} />;
}

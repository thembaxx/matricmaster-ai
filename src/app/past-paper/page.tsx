'use client';

import dynamic from 'next/dynamic';

import { Suspense } from 'react';
import { PdfViewerSkeleton } from '@/components/QuizSkeleton';

const PastPaperViewerScreen = dynamic(() => import('@/screens/PastPaperViewer'), {
	ssr: false,
	loading: () => <PdfViewerSkeleton />,
});

export default function PastPaperViewerPage() {
	return (
		<Suspense fallback={<PdfViewerSkeleton />}>
			<PastPaperViewerScreen />
		</Suspense>
	);
}

'use client';

import dynamic from 'next/dynamic';
import { PdfViewerSkeleton } from '@/components/QuizSkeleton';

const PastPaperViewerScreen = dynamic(() => import('@/screens/PastPaperViewer'), {
	ssr: false,
	loading: () => <PdfViewerSkeleton />,
});

export default function PastPaperViewerPage() {
	return <PastPaperViewerScreen />;
}

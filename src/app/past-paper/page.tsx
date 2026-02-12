import type { Metadata } from 'next';
import { Suspense } from 'react';
import PastPaperViewerScreen from '@/screens/PastPaperViewer';

export const metadata: Metadata = {
	title: 'Past Paper Viewer | MatricMaster AI',
	description: 'View and practice with past exam papers.',
};

export default function PastPaperViewerPage() {
	return (
		<Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
			<PastPaperViewerScreen />
		</Suspense>
	);
}

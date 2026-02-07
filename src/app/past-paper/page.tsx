'use client';

import { Suspense } from 'react';
import PastPaperViewerScreen from '@/screens/PastPaperViewer';

export default function PastPaperViewerPage() {
	return (
		<Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
			<PastPaperViewerScreen />
		</Suspense>
	);
}

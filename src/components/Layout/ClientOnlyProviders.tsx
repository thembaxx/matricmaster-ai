'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const OfflineIndicator = dynamic(
	() => import('@/components/AI/OfflineIndicator').then((m) => m.OfflineIndicator),
	{ ssr: false }
);
const WebLLMDownloader = dynamic(
	() => import('@/components/AI/WebLLMDownloader').then((m) => m.WebLLMDownloader),
	{ ssr: false }
);
const IOSInstallPrompt = dynamic(
	() => import('@/components/IOSInstallPrompt').then((m) => m.IOSInstallPrompt),
	{ ssr: false }
);

export function ClientOnlyProviders({ children }: { children?: ReactNode }) {
	return (
		<>
			{children}
			<OfflineIndicator />
			<WebLLMDownloader />
			<IOSInstallPrompt />
		</>
	);
}

import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Past Paper Viewer | ${appConfig.name} AI`,
	description: 'View and practice with past exam papers.',
};

export default function PastPaperLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

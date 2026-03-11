import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Past Paper Viewer | MatricMaster',
	description: 'View and practice with past exam papers.',
};

export default function PastPaperLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

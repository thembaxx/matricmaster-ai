import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const BookmarksScreen = dynamic(() => import('@/screens/Bookmarks'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Bookmarks | ${appConfig.name} AI`,
	description: 'Your saved questions and content.',
	alternates: { canonical: `${baseUrl}/bookmarks` },
};

export default function BookmarksPage() {
	return <BookmarksScreen />;
}

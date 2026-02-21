import type { Metadata } from 'next';
import BookmarksScreen from '@/screens/Bookmarks';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Bookmarks | MatricMaster AI',
	description: 'Your saved questions and content.',
	alternates: { canonical: `${baseUrl}/bookmarks` },
};

export default function BookmarksPage() {
	return <BookmarksScreen />;
}

import type { Metadata } from 'next';
import BookmarksScreen from '@/screens/Bookmarks';

export const metadata: Metadata = {
	title: 'Bookmarks | MatricMaster AI',
	description: 'Your saved questions and content.',
};

export default function BookmarksPage() {
	return <BookmarksScreen />;
}

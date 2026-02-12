import type { Metadata } from 'next';
import SearchScreen from '@/screens/Search';

export const metadata: Metadata = {
	title: 'Search | MatricMaster AI',
	description: 'Search for questions, lessons, and topics.',
};

export default function SearchPage() {
	return <SearchScreen />;
}

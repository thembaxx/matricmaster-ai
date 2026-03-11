import type { Metadata } from 'next';
import SearchScreen from '@/screens/Search';
import PageTransition from '@/components/Transition/PageTransition';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Search | MatricMaster',
	description: 'Search for questions, lessons, and topics.',
	alternates: { canonical: `${baseUrl}/search` },
};

export default function SearchPage() {
	return (
		<PageTransition>
			<SearchScreen />
		</PageTransition>
	);
}

import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import SearchScreen from '@/screens/Search';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Search | ${appConfig.name} AI`,
	description: 'Search for questions, lessons, and topics.',
	alternates: { canonical: `${baseUrl}/search` },
};

export default function SearchPage() {
	return <SearchScreen />;
}

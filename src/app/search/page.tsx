import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const SearchScreen = dynamic(() => import('@/screens/Search'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Search | ${appConfig.name} AI`,
	description: 'Search for questions, lessons, and topics.',
	alternates: { canonical: `${baseUrl}/search` },
};

export default function SearchPage() {
	return <SearchScreen />;
}

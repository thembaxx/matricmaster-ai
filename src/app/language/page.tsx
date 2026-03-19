import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const LanguageSelectScreen = dynamic(() => import('@/screens/LanguageSelect'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Language Selection | ${appConfig.name} AI`,
	description: 'Choose your preferred language for learning.',
};

export default function LanguageSelectPage() {
	return <LanguageSelectScreen />;
}

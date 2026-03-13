import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import LanguageSelectScreen from '@/screens/LanguageSelect';

export const metadata: Metadata = {
	title: `Language Selection | ${appConfig.name} AI`,
	description: 'Choose your preferred language for learning.',
};

export default function LanguageSelectPage() {
	return <LanguageSelectScreen />;
}

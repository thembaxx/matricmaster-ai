import type { Metadata } from 'next';
import LanguageSelectScreen from '@/screens/LanguageSelect';

export const metadata: Metadata = {
	title: 'Language Selection | MatricMaster AI',
	description: 'Choose your preferred language for learning.',
};

export default function LanguageSelectPage() {
	return <LanguageSelectScreen />;
}

import type { Metadata } from 'next';
import LanguageSelectScreen from '@/screens/LanguageSelect';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Language Selection | MatricMaster',
	description: 'Choose your preferred language for learning.',
};

export default function LanguageSelectPage() {
	return (
		<PageTransition>
			<LanguageSelectScreen />
		</PageTransition>
	);
}

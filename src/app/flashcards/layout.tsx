import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Flashcards | ${appConfig.name} AI`,
	description: 'Create and study flashcard decks with spaced repetition.',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

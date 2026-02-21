import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Flashcards | MatricMaster AI',
	description: 'Create and study flashcard decks with spaced repetition.',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

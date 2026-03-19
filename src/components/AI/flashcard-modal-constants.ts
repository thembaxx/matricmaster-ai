import type { Rating } from '@/lib/spaced-repetition';

export interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags?: string[];
	intervalDays?: number;
	easeFactor?: number | string;
	nextReview?: Date | string;
	timesReviewed?: number;
}

export interface FlashcardModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flashcards: Flashcard[];
	subject?: string;
	reviewMode?: boolean;
	onRate?: (flashcardId: string, rating: Rating) => Promise<void>;
	onAddToMasterDeck?: (flashcard: Flashcard) => Promise<void>;
	showAddToMasterDeck?: boolean;
}

export const RATING_BUTTONS: {
	rating: Rating;
	icon: typeof import('@hugeicons/core-free-icons').Cancel01Icon;
	label: string;
	shortcut: string;
}[] = [
	{ rating: 1 as Rating, icon: undefined as any, label: 'Again', shortcut: '1' },
	{ rating: 2 as Rating, icon: undefined as any, label: 'Hard', shortcut: '2' },
	{ rating: 3 as Rating, icon: undefined as any, label: 'Good', shortcut: '3' },
	{ rating: 4 as Rating, icon: undefined as any, label: 'Easy', shortcut: '4' },
];

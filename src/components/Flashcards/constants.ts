export interface FlashcardDeck {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	cardCount: number;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Flashcard {
	id: string;
	front: string;
	back: string;
	timesReviewed: number;
	timesCorrect: number;
	nextReview: Date | null;
}

export interface DeckStats {
	totalCards: number;
	newCards: number;
	learningCards: number;
	reviewCards: number;
	averageEase: number;
	dueToday: number;
}

export interface DeckWithStats extends FlashcardDeck {
	stats: DeckStats;
	dueCards: number;
}

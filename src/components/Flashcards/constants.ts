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

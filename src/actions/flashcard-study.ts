'use server';

import { and, desc, eq, isNull, lte, or } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { flashcardDecks, flashcardReviews, flashcards } from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface FlashcardDue {
	id: string;
	deckId: string;
	front: string;
	back: string;
	difficulty: string;
	easeFactor: number;
	intervalDays: number;
	nextReview: Date | null;
}

export async function getFlashcardsDueForReview(limit = 20): Promise<FlashcardDue[]> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();
		const now = new Date();

		const decks = await db.query.flashcardDecks.findMany({
			where: eq(flashcardDecks.userId, session.user.id),
		});
		const deckId = decks[0]?.id;
		if (!deckId) return [];

		const dueCards = await db.query.flashcards.findMany({
			where: and(
				eq(flashcards.deckId, deckId),
				or(lte(flashcards.nextReview, now), isNull(flashcards.nextReview))
			),
			orderBy: [desc(flashcards.nextReview)],
			limit,
		});

		return dueCards.map((card: (typeof dueCards)[number]) => ({
			id: card.id,
			deckId: card.deckId,
			front: card.front,
			back: card.back,
			difficulty: card.difficulty,
			easeFactor: Number(card.easeFactor),
			intervalDays: card.intervalDays,
			nextReview: card.nextReview,
		}));
	} catch (error) {
		console.error('getFlashcardsDueForReview failed:', error);
		return [];
	}
}

export async function reviewFlashcard(
	cardId: string,
	rating: 1 | 2 | 3 | 4 | 5
): Promise<{
	success: boolean;
	error?: string;
	intervalDays?: number;
	easeFactor?: number;
	nextReview?: Date;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const card = await db.query.flashcards.findFirst({
			where: eq(flashcards.id, cardId),
		});

		if (!card) throw new Error('Card not found');

		const currentEase = Number(card.easeFactor);
		const currentInterval = card.intervalDays;

		let newEase = currentEase;
		let newInterval = currentInterval;

		if (rating >= 4) {
			newEase = Math.min(currentEase + 0.1, 3.0);
			newInterval = Math.round(currentInterval * newEase);
		} else if (rating >= 3) {
			newInterval = Math.max(1, Math.round(currentInterval * 0.5));
		} else {
			newInterval = 1;
			newEase = Math.max(1.3, currentEase - 0.2);
		}

		const nextReview = new Date();
		nextReview.setDate(nextReview.getDate() + newInterval);

		await db
			.update(flashcards)
			.set({
				easeFactor: newEase.toFixed(2),
				intervalDays: newInterval,
				nextReview,
				lastReview: new Date(),
				repetitions: card.repetitions + 1,
				timesReviewed: card.timesReviewed + 1,
				timesCorrect: rating >= 3 ? card.timesCorrect + 1 : card.timesCorrect,
			})
			.where(eq(flashcards.id, cardId));

		await db.insert(flashcardReviews).values({
			userId: session.user.id,
			flashcardId: cardId,
			rating,
			intervalBefore: currentInterval,
			intervalAfter: newInterval,
			easeFactorBefore: currentEase.toFixed(2),
			easeFactorAfter: newEase.toFixed(2),
		});

		return { success: true, intervalDays: newInterval, easeFactor: newEase, nextReview };
	} catch (error) {
		console.error('reviewFlashcard failed:', error);
		return { success: false, error: 'Failed to review flashcard' };
	}
}

export async function createAdaptiveFlashcardDeck(): Promise<{
	success: boolean;
	error?: string;
	deck?: typeof flashcardDecks.$inferSelect;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const existing = await db.query.flashcardDecks.findFirst({
			where: and(
				eq(flashcardDecks.userId, session.user.id),
				eq(flashcardDecks.name, 'Adaptive Review')
			),
		});

		if (existing) return { success: true, deck: existing };

		const [deck] = await db
			.insert(flashcardDecks)
			.values({
				userId: session.user.id,
				name: 'Adaptive Review',
				description: 'From your weak topics',
				cardCount: 0,
			})
			.returning();

		return { success: true, deck };
	} catch (error) {
		console.error('createAdaptiveFlashcardDeck failed:', error);
		return { success: false, error: 'Failed to create flashcard deck' };
	}
}

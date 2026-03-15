'use server';

import { and, desc, eq, isNull, lte, or, sql } from 'drizzle-orm';
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
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const now = new Date();

	// Get user's deck IDs
	const userDecks = await db.query.flashcardDecks.findMany({
		where: eq(flashcardDecks.userId, session.user.id),
		columns: { id: true },
	});
	const deckIds = userDecks.map((d) => d.id);

	const dueCards = await db.query.flashcards.findMany({
		where: and(
			sql`${flashcards.deckId} IN (${deckIds.map(() => '?').join(', ')})`,
			or(lte(flashcards.nextReview, now), isNull(flashcards.nextReview))
		),
		orderBy: [desc(flashcards.nextReview)],
		limit,
	});

	return dueCards.map((card) => ({
		id: card.id,
		deckId: card.deckId,
		front: card.front,
		back: card.back,
		difficulty: card.difficulty,
		easeFactor: Number(card.easeFactor),
		intervalDays: card.intervalDays,
		nextReview: card.nextReview,
	}));
}

export async function reviewFlashcard(
	cardId: string,
	rating: 1 | 2 | 3 | 4 | 5
): Promise<{ intervalDays: number; easeFactor: number; nextReview: Date }> {
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

	return { intervalDays: newInterval, easeFactor: newEase, nextReview };
}

export async function createAdaptiveFlashcardDeck() {
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

	if (existing) return existing;

	const [deck] = await db
		.insert(flashcardDecks)
		.values({
			userId: session.user.id,
			name: 'Adaptive Review',
			description: 'Auto-generated from your weak topics',
			cardCount: 0,
		})
		.returning();

	return deck;
}

'use server';

import { and, desc, eq, lte, sql } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import {
	type Flashcard,
	type FlashcardDeck,
	flashcardDecks,
	flashcardReviews,
	flashcards,
} from '@/lib/db/schema';
import { calculateNextReview, DEFAULT_EASE_FACTOR, type Rating } from '@/lib/spaced-repetition';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

async function getUserId(): Promise<string> {
	const { getAuth } = await import('@/lib/auth');
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}
	return session.user.id;
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

export async function createDeck(
	name: string,
	description?: string,
	subjectId?: number
): Promise<FlashcardDeck> {
	const db = await getDb();
	const userId = await getUserId();

	const [deck] = await db
		.insert(flashcardDecks)
		.values({
			userId,
			name,
			description,
			subjectId,
			cardCount: 0,
			isPublic: false,
		})
		.returning();

	return deck;
}

export async function renameDeck(deckId: string, name: string): Promise<void> {
	const db = await getDb();
	const userId = await getUserId();

	await db
		.update(flashcardDecks)
		.set({ name, updatedAt: new Date() })
		.where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
}

export async function deleteDeck(deckId: string): Promise<void> {
	const db = await getDb();
	const userId = await getUserId();

	await db
		.delete(flashcardDecks)
		.where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
}

export async function getUserDecks(): Promise<DeckWithStats[]> {
	const db = await getDb();
	const userId = await getUserId();
	const now = new Date();

	const decks = await db.query.flashcardDecks.findMany({
		where: eq(flashcardDecks.userId, userId),
		orderBy: [desc(flashcardDecks.updatedAt)],
		with: {
			flashcards: true,
		},
	});

	return decks.map((deck) => {
		const deckFlashcards = deck.flashcards || [];
		let newCards = 0;
		let learningCards = 0;
		let reviewCards = 0;
		let dueToday = 0;
		let totalEase = 0;
		let easeCount = 0;

		for (const card of deckFlashcards) {
			const timesReviewed = card.timesReviewed ?? 0;
			const easeFactor = Number(card.easeFactor) ?? DEFAULT_EASE_FACTOR;

			if (timesReviewed === 0) {
				newCards++;
				learningCards++;
			} else if (easeFactor >= 2.5 && timesReviewed >= 5) {
				reviewCards++;
			} else {
				learningCards++;
			}

			if (card.nextReview && new Date(card.nextReview) <= now) {
				dueToday++;
			}

			if (timesReviewed > 0) {
				totalEase += easeFactor;
				easeCount++;
			}
		}

		return {
			...deck,
			stats: {
				totalCards: deckFlashcards.length,
				newCards,
				learningCards,
				reviewCards,
				averageEase: easeCount > 0 ? totalEase / easeCount : DEFAULT_EASE_FACTOR,
				dueToday,
			},
			dueCards: dueToday,
		};
	});
}

export async function getDeckStats(deckId: string): Promise<DeckStats | null> {
	const db = await getDb();
	const userId = await getUserId();
	const now = new Date();

	const deck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)),
		with: {
			flashcards: true,
		},
	});

	if (!deck) return null;

	let newCards = 0;
	let learningCards = 0;
	let reviewCards = 0;
	let dueToday = 0;
	let totalEase = 0;
	let easeCount = 0;

	for (const card of deck.flashcards || []) {
		const timesReviewed = card.timesReviewed ?? 0;
		const easeFactor = Number(card.easeFactor) ?? DEFAULT_EASE_FACTOR;

		if (timesReviewed === 0) {
			newCards++;
			learningCards++;
		} else if (easeFactor >= 2.5 && timesReviewed >= 5) {
			reviewCards++;
		} else {
			learningCards++;
		}

		if (card.nextReview && new Date(card.nextReview) <= now) {
			dueToday++;
		}

		if (timesReviewed > 0) {
			totalEase += easeFactor;
			easeCount++;
		}
	}

	return {
		totalCards: deck.flashcards?.length || 0,
		newCards,
		learningCards,
		reviewCards,
		averageEase: easeCount > 0 ? totalEase / easeCount : DEFAULT_EASE_FACTOR,
		dueToday,
	};
}

export async function addCard(
	deckId: string,
	front: string,
	back: string,
	difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Flashcard> {
	const db = await getDb();

	const [flashcard] = await db
		.insert(flashcards)
		.values({
			deckId,
			front,
			back,
			difficulty,
			timesReviewed: 0,
			timesCorrect: 0,
			easeFactor: DEFAULT_EASE_FACTOR.toString(),
			intervalDays: 1,
			repetitions: 0,
			nextReview: new Date(),
		})
		.returning();

	await db
		.update(flashcardDecks)
		.set({
			cardCount: sql`${flashcardDecks.cardCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(flashcardDecks.id, deckId));

	return flashcard;
}

export async function addCardsFromAI(
	topic: string,
	_subject: string,
	count = 10
): Promise<Flashcard[]> {
	const { getAuth } = await import('@/lib/auth');
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	let deck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.userId, session.user.id), eq(flashcardDecks.name, 'Master Deck')),
	});

	if (!deck) {
		[deck] = await db
			.insert(flashcardDecks)
			.values({
				userId: session.user.id,
				name: 'Master Deck',
				description: 'Your personal collection of AI-generated flashcards',
				cardCount: 0,
				isPublic: false,
			})
			.returning();
	}

	const newCards: Flashcard[] = [];
	for (let i = 0; i < count; i++) {
		const [card] = await db
			.insert(flashcards)
			.values({
				deckId: deck.id,
				front: `${topic} - Concept ${i + 1}`,
				back: `Answer for ${topic} concept ${i + 1}`,
				difficulty: 'medium',
				timesReviewed: 0,
				timesCorrect: 0,
				easeFactor: DEFAULT_EASE_FACTOR.toString(),
				intervalDays: 1,
				repetitions: 0,
				nextReview: new Date(),
			})
			.returning();
		newCards.push(card);
	}

	await db
		.update(flashcardDecks)
		.set({
			cardCount: sql`${flashcardDecks.cardCount} + ${count}`,
			updatedAt: new Date(),
		})
		.where(eq(flashcardDecks.id, deck.id));

	return newCards;
}

export async function getCardsDue(
	deckId?: string,
	limit = 50
): Promise<(Flashcard & { deck?: { id: string; name: string; subjectId: number | null } })[]> {
	const db = await getDb();
	const userId = await getUserId();
	const now = new Date();

	let query = db
		.select({
			id: flashcards.id,
			deckId: flashcards.deckId,
			front: flashcards.front,
			back: flashcards.back,
			imageUrl: flashcards.imageUrl,
			difficulty: flashcards.difficulty,
			timesReviewed: flashcards.timesReviewed,
			timesCorrect: flashcards.timesCorrect,
			easeFactor: flashcards.easeFactor,
			intervalDays: flashcards.intervalDays,
			repetitions: flashcards.repetitions,
			nextReview: flashcards.nextReview,
			lastReview: flashcards.lastReview,
			createdAt: flashcards.createdAt,
			updatedAt: flashcards.updatedAt,
			deck: {
				id: flashcardDecks.id,
				name: flashcardDecks.name,
				subjectId: flashcardDecks.subjectId,
			},
		})
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(and(eq(flashcardDecks.userId, userId), lte(flashcards.nextReview, now)))
		.orderBy(flashcards.nextReview)
		.limit(limit);

	if (deckId) {
		query = db
			.select({
				id: flashcards.id,
				deckId: flashcards.deckId,
				front: flashcards.front,
				back: flashcards.back,
				imageUrl: flashcards.imageUrl,
				difficulty: flashcards.difficulty,
				timesReviewed: flashcards.timesReviewed,
				timesCorrect: flashcards.timesCorrect,
				easeFactor: flashcards.easeFactor,
				intervalDays: flashcards.intervalDays,
				repetitions: flashcards.repetitions,
				nextReview: flashcards.nextReview,
				lastReview: flashcards.lastReview,
				createdAt: flashcards.createdAt,
				updatedAt: flashcards.updatedAt,
				deck: {
					id: flashcardDecks.id,
					name: flashcardDecks.name,
					subjectId: flashcardDecks.subjectId,
				},
			})
			.from(flashcards)
			.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
			.where(
				and(
					eq(flashcardDecks.userId, userId),
					eq(flashcards.deckId, deckId),
					lte(flashcards.nextReview, now)
				)
			)
			.orderBy(flashcards.nextReview)
			.limit(limit);
	}

	return query;
}

export async function getAllDue(limit = 50): Promise<Flashcard[]> {
	const db = await getDb();
	const userId = await getUserId();
	const now = new Date();

	const cards = await db
		.select()
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(and(eq(flashcardDecks.userId, userId), lte(flashcards.nextReview, now)))
		.orderBy(flashcards.nextReview)
		.limit(limit);

	return cards.map((c) => c.flashcards);
}

export async function reviewCard(
	flashcardId: string,
	rating: Rating
): Promise<{ nextReview: Date; interval: number }> {
	const db = await getDb();
	const userId = await getUserId();

	const [card] = await db
		.select()
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(and(eq(flashcards.id, flashcardId), eq(flashcardDecks.userId, userId)))
		.limit(1);

	if (!card) {
		throw new Error('Flashcard not found');
	}

	const currentInterval = card.flashcards.intervalDays ?? 1;
	const currentRepetitions = card.flashcards.repetitions ?? 0;
	const currentEaseFactor = Number(card.flashcards.easeFactor) ?? DEFAULT_EASE_FACTOR;
	const lastReview = card.flashcards.lastReview ? new Date(card.flashcards.lastReview) : undefined;

	const result = calculateNextReview(
		currentInterval,
		currentRepetitions,
		currentEaseFactor,
		rating,
		lastReview
	);

	await db
		.update(flashcards)
		.set({
			timesReviewed: (card.flashcards.timesReviewed ?? 0) + 1,
			timesCorrect: (card.flashcards.timesCorrect ?? 0) + (rating >= 3 ? 1 : 0),
			easeFactor: result.easeFactor.toString(),
			intervalDays: result.interval,
			repetitions: result.repetitions,
			nextReview: result.nextReview,
			lastReview: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(flashcards.id, flashcardId));

	await db.insert(flashcardReviews).values({
		userId,
		flashcardId,
		rating,
		intervalBefore: currentInterval,
		intervalAfter: result.interval,
		easeFactorBefore: currentEaseFactor.toString(),
		easeFactorAfter: result.easeFactor.toString(),
		reviewedAt: new Date(),
	});

	return { nextReview: result.nextReview, interval: result.interval };
}

export async function getMasterDeckCards(subjectId?: number): Promise<Flashcard[]> {
	const db = await getDb();
	const userId = await getUserId();

	const deck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.userId, userId), eq(flashcardDecks.name, 'Master Deck')),
	});

	if (!deck) return [];

	let query = db.select().from(flashcards).where(eq(flashcards.deckId, deck.id));

	if (subjectId && deck.subjectId === subjectId) {
		query = db
			.select()
			.from(flashcards)
			.where(and(eq(flashcards.deckId, deck.id)));
	}

	return query;
}

export async function moveCardToDeck(cardId: string, newDeckId: string): Promise<void> {
	const db = await getDb();
	const userId = await getUserId();

	const card = await db.query.flashcards.findFirst({
		where: eq(flashcards.id, cardId),
		with: {
			deck: true,
		},
	});

	if (!card || card.deck.userId !== userId) {
		throw new Error('Flashcard not found');
	}

	const oldDeckId = card.deckId;
	const newDeck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.id, newDeckId), eq(flashcardDecks.userId, userId)),
	});

	if (!newDeck) {
		throw new Error('Target deck not found');
	}

	await db.update(flashcards).set({ deckId: newDeckId }).where(eq(flashcards.id, cardId));

	await db
		.update(flashcardDecks)
		.set({
			cardCount: sql`${flashcardDecks.cardCount} - 1`,
			updatedAt: new Date(),
		})
		.where(eq(flashcardDecks.id, oldDeckId));

	await db
		.update(flashcardDecks)
		.set({
			cardCount: sql`${flashcardDecks.cardCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(flashcardDecks.id, newDeckId));
}

export async function getTotalDueCount(): Promise<number> {
	const db = await getDb();
	const userId = await getUserId();
	const now = new Date();

	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(and(eq(flashcardDecks.userId, userId), lte(flashcards.nextReview, now)));

	return Number(result[0]?.count ?? 0);
}

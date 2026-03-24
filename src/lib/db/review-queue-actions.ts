'use server';

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Rating } from '@/lib/spaced-repetition';
import { calculateNextReview, DEFAULT_EASE_FACTOR } from '@/lib/spaced-repetition';
import { dbManager, getDb } from './index';
import {
	type Flashcard,
	type FlashcardReview,
	flashcardDecks,
	flashcardReviews,
	flashcards,
	type NewFlashcard,
	type NewFlashcardDeck,
} from './schema';

export interface DueFlashcard extends Flashcard {
	deck?: {
		id: string;
		name: string;
		subjectId: number | null;
	};
}

export interface ReviewStats {
	totalReviews: number;
	todayReviews: number;
	correctToday: number;
	accuracyToday: number;
	streakDays: number;
	masteredCards: number;
	learningCards: number;
	newCards: number;
}

export interface DailyForecast {
	date: string;
	count: number;
}

export async function getDueFlashcards(userId: string): Promise<DueFlashcard[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		console.warn('[Review Queue] Database not available');
		return [];
	}

	const db = await getDb();
	const now = new Date();

	try {
		const dueCards = await db
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
			.orderBy(flashcards.nextReview);

		return dueCards as DueFlashcard[];
	} catch (error) {
		console.debug('[Review Queue] Error fetching due flashcards:', error);
		return [];
	}
}

export async function getFlashcardsDueToday(userId: string): Promise<DueFlashcard[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = await getDb();
	const now = new Date();
	const endOfDay = new Date(now);
	endOfDay.setHours(23, 59, 59, 999);

	try {
		const dueCards = await db
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
			.where(and(eq(flashcardDecks.userId, userId), lte(flashcards.nextReview, endOfDay)))
			.orderBy(flashcards.nextReview);

		return dueCards as DueFlashcard[];
	} catch (error) {
		console.debug('[Review Queue] Error fetching flashcards due today:', error);
		return [];
	}
}

export async function recordFlashcardReview(
	userId: string,
	flashcardId: string,
	rating: Rating
): Promise<{ success: boolean; review?: FlashcardReview; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
		const [card] = await db
			.select()
			.from(flashcards)
			.where(eq(flashcards.id, flashcardId))
			.limit(1);

		if (!card) {
			return { success: false, error: 'Flashcard not found' };
		}

		const currentInterval = card.intervalDays ?? 1;
		const currentRepetitions = card.repetitions ?? 0;
		const currentEaseFactor = Number(card.easeFactor) ?? DEFAULT_EASE_FACTOR;
		const lastReview = card.lastReview ? new Date(card.lastReview) : undefined;

		const result = calculateNextReview(
			currentInterval,
			currentRepetitions,
			currentEaseFactor,
			rating,
			lastReview
		);

		const isCorrect = rating >= 3;

		await db
			.update(flashcards)
			.set({
				timesReviewed: (card.timesReviewed ?? 0) + 1,
				timesCorrect: (card.timesCorrect ?? 0) + (isCorrect ? 1 : 0),
				easeFactor: result.easeFactor.toString(),
				intervalDays: result.interval,
				repetitions: result.repetitions,
				nextReview: result.nextReview,
				lastReview: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(flashcards.id, flashcardId));

		const [review] = await db
			.insert(flashcardReviews)
			.values({
				userId,
				flashcardId,
				rating,
				intervalBefore: currentInterval,
				intervalAfter: result.interval,
				easeFactorBefore: currentEaseFactor.toString(),
				easeFactorAfter: result.easeFactor.toString(),
				reviewedAt: new Date(),
			})
			.returning();

		return { success: true, review };
	} catch (error) {
		console.debug('[Review Queue] Error recording review:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to record review',
		};
	}
}

export async function getReviewStats(userId: string): Promise<ReviewStats> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return {
			totalReviews: 0,
			todayReviews: 0,
			correctToday: 0,
			accuracyToday: 0,
			streakDays: 0,
			masteredCards: 0,
			learningCards: 0,
			newCards: 0,
		};
	}

	const db = await getDb();
	const now = new Date();
	const startOfDay = new Date(now);
	startOfDay.setHours(0, 0, 0, 0);

	try {
		const [totalResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(flashcardReviews)
			.where(eq(flashcardReviews.userId, userId));

		const [todayResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(flashcardReviews)
			.where(
				and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.reviewedAt, startOfDay))
			);

		const [correctTodayResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(flashcardReviews)
			.where(
				and(
					eq(flashcardReviews.userId, userId),
					gte(flashcardReviews.reviewedAt, startOfDay),
					gte(flashcardReviews.rating, 3)
				)
			);

		const todayReviews = Number(todayResult?.count ?? 0);
		const correctToday = Number(correctTodayResult?.count ?? 0);
		const accuracyToday = todayReviews > 0 ? Math.round((correctToday / todayReviews) * 100) : 0;

		const allCards = await db
			.select({
				timesReviewed: flashcards.timesReviewed,
				easeFactor: flashcards.easeFactor,
			})
			.from(flashcards)
			.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
			.where(eq(flashcardDecks.userId, userId));

		let masteredCards = 0;
		let learningCards = 0;
		let newCards = 0;

		for (const card of allCards) {
			const timesReviewed = card.timesReviewed ?? 0;
			const easeFactor = Number(card.easeFactor) ?? DEFAULT_EASE_FACTOR;

			if (timesReviewed === 0) {
				newCards++;
			} else if (easeFactor >= 2.5 && timesReviewed >= 5) {
				masteredCards++;
			} else {
				learningCards++;
			}
		}

		return {
			totalReviews: Number(totalResult?.count ?? 0),
			todayReviews,
			correctToday,
			accuracyToday,
			streakDays: 0,
			masteredCards,
			learningCards,
			newCards,
		};
	} catch (error) {
		console.debug('[Review Queue] Error fetching stats:', error);
		return {
			totalReviews: 0,
			todayReviews: 0,
			correctToday: 0,
			accuracyToday: 0,
			streakDays: 0,
			masteredCards: 0,
			learningCards: 0,
			newCards: 0,
		};
	}
}

export async function getReviewForecast(userId: string, days = 7): Promise<DailyForecast[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = await getDb();
	const forecast: DailyForecast[] = [];

	for (let i = 0; i < days; i++) {
		const date = new Date();
		date.setDate(date.getDate() + i);
		date.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		try {
			const [result] = await db
				.select({ count: sql<number>`count(*)` })
				.from(flashcards)
				.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
				.where(
					and(
						eq(flashcardDecks.userId, userId),
						gte(flashcards.nextReview, date),
						lte(flashcards.nextReview, endOfDay)
					)
				);

			forecast.push({
				date: date.toISOString().split('T')[0],
				count: Number(result?.count ?? 0),
			});
		} catch (error) {
			console.warn('Failed to get flashcard count for forecast:', error);
			forecast.push({
				date: date.toISOString().split('T')[0],
				count: 0,
			});
		}
	}

	return forecast;
}

export async function createFlashcardDeck(
	userId: string,
	name: string,
	description?: string,
	subjectId?: number
): Promise<{ success: boolean; deck?: NewFlashcardDeck; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
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

		return { success: true, deck };
	} catch (error) {
		console.debug('[Review Queue] Error creating deck:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create deck',
		};
	}
}

export async function getUserDecks(userId: string): Promise<NewFlashcardDeck[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = await getDb();

	try {
		return db
			.select()
			.from(flashcardDecks)
			.where(eq(flashcardDecks.userId, userId))
			.orderBy(desc(flashcardDecks.updatedAt));
	} catch (error) {
		console.debug('[Review Queue] Error fetching decks:', error);
		return [];
	}
}

export async function addFlashcardToDeck(
	deckId: string,
	front: string,
	back: string,
	difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{ success: boolean; flashcard?: NewFlashcard; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
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

		return { success: true, flashcard };
	} catch (error) {
		console.debug('[Review Queue] Error adding flashcard:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to add flashcard',
		};
	}
}

export async function getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = await getDb();

	try {
		return db.select().from(flashcards).where(eq(flashcards.deckId, deckId));
	} catch (error) {
		console.debug('[Review Queue] Error fetching deck flashcards:', error);
		return [];
	}
}

export async function updateFlashcardDeck(
	deckId: string,
	userId: string,
	data: { name?: string; description?: string; subjectId?: number | null; isPublic?: boolean }
): Promise<{ success: boolean; deck?: NewFlashcardDeck; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
		const [existing] = await db
			.select()
			.from(flashcardDecks)
			.where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)))
			.limit(1);

		if (!existing) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		const [updated] = await db
			.update(flashcardDecks)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(flashcardDecks.id, deckId))
			.returning();

		return { success: true, deck: updated };
	} catch (error) {
		console.debug('[Review Queue] Error updating deck:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update deck',
		};
	}
}

export async function deleteFlashcardDeck(
	deckId: string,
	userId: string
): Promise<{ success: boolean; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
		const [existing] = await db
			.select()
			.from(flashcardDecks)
			.where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)))
			.limit(1);

		if (!existing) {
			return { success: false, error: 'Deck not found or unauthorized' };
		}

		await db.delete(flashcardDecks).where(eq(flashcardDecks.id, deckId));

		return { success: true };
	} catch (error) {
		console.debug('[Review Queue] Error deleting deck:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete deck',
		};
	}
}

export async function updateFlashcard(
	flashcardId: string,
	deckId: string,
	data: { front?: string; back?: string; difficulty?: string }
): Promise<{ success: boolean; flashcard?: Flashcard; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
		const [existing] = await db
			.select()
			.from(flashcards)
			.where(and(eq(flashcards.id, flashcardId), eq(flashcards.deckId, deckId)))
			.limit(1);

		if (!existing) {
			return { success: false, error: 'Flashcard not found' };
		}

		const [updated] = await db
			.update(flashcards)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(flashcards.id, flashcardId))
			.returning();

		return { success: true, flashcard: updated };
	} catch (error) {
		console.debug('[Review Queue] Error updating flashcard:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update flashcard',
		};
	}
}

export async function deleteFlashcard(
	flashcardId: string,
	deckId: string
): Promise<{ success: boolean; error?: string }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false, error: 'Database not available' };
	}

	const db = await getDb();

	try {
		await db.delete(flashcards).where(eq(flashcards.id, flashcardId));

		await db
			.update(flashcardDecks)
			.set({
				cardCount: sql`${flashcardDecks.cardCount} - 1`,
				updatedAt: new Date(),
			})
			.where(eq(flashcardDecks.id, deckId));

		return { success: true };
	} catch (error) {
		console.debug('[Review Queue] Error deleting flashcard:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete flashcard',
		};
	}
}

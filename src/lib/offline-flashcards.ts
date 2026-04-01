import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'lumni-flashcards';
const DB_VERSION = 1;
const STORE_NAME = 'flashcard-decks';

interface CachedDeck {
	deckId: string;
	cards: Array<{
		id: string;
		front: string;
		back: string;
		difficulty: number;
		topic: string;
		subject: string;
	}>;
	cachedAt: number;
	expiresAt: number;
}

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
	if (db) return db;
	db = await openDB(DB_NAME, DB_VERSION, {
		upgrade(database) {
			if (!database.objectStoreNames.contains(STORE_NAME)) {
				database.createObjectStore(STORE_NAME, { keyPath: 'deckId' });
			}
		},
	});
	return db;
}

export async function cacheFlashcardDeck(deck: CachedDeck): Promise<void> {
	const store = await getDb();
	await store.put(STORE_NAME, deck);
}

export async function getCachedFlashcardDeck(deckId: string): Promise<CachedDeck | null> {
	const store = await getDb();
	const cached = await store.get(STORE_NAME, deckId);

	if (!cached) return null;

	if (Date.now() > cached.expiresAt) {
		await store.delete(STORE_NAME, deckId);
		return null;
	}

	return cached;
}

export async function queueFlashcardReview(review: {
	deckId: string;
	cardId: string;
	wasCorrect: boolean;
	timestamp: number;
}): Promise<void> {
	const store = await getDb();
	const queueName = 'review-queue';

	if (!store.objectStoreNames.contains(queueName)) {
		store.createObjectStore(queueName, { keyPath: 'id', autoIncrement: true });
	}

	await store.add(queueName, { ...review, synced: false, createdAt: Date.now() });
}

export async function getPendingReviews(): Promise<Array<Record<string, unknown>>> {
	const store = await getDb();
	if (!store.objectStoreNames.contains('review-queue')) return [];
	return store.getAll('review-queue');
}

export async function markReviewsSynced(ids: number[]): Promise<void> {
	const store = await getDb();
	for (const id of ids) {
		const review = await store.get('review-queue', id);
		if (review) {
			review.synced = true;
			await store.put('review-queue', review);
		}
	}
}

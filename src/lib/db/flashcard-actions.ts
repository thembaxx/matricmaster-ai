'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { db, dbManager } from './index';
import { flashcardDecks, flashcards } from './schema';

async function getConnectedDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return db;
}

export async function saveToFlashcardsAction(data: {
	front: string;
	back: string;
	subjectName?: string;
}) {
	try {
		const user = await ensureAuthenticated();
		const database = await getConnectedDb();

		// Clean the input to avoid weird markers or excessive length
		const front = data.front.trim().substring(0, 1000);
		const back = data.back.trim().substring(0, 2000);

		// Find or create a default deck for this user
		let deck = await database.query.flashcardDecks.findFirst({
			where: and(eq(flashcardDecks.userId, user.id), eq(flashcardDecks.name, 'Snap Solutions')),
		});

		if (!deck) {
			const [newDeck] = await database
				.insert(flashcardDecks)
				.values({
					userId: user.id,
					name: 'Snap Solutions',
					description: 'Flashcards automatically generated from your snapped questions.',
				})
				.returning();
			deck = newDeck;
		}

		await database.insert(flashcards).values({
			deckId: deck.id,
			front,
			back,
		});

		return { success: true };
	} catch (error) {
		console.error('Error saving flashcard:', error);
		return { success: false, error: 'Failed to save flashcard' };
	}
}

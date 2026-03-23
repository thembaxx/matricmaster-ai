'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { dbManagerV2 } from './database-manager-v2';
import { flashcardDecks, flashcards } from './schema';

async function getConnectedDb() {
	await dbManagerV2.initialize();
	return dbManagerV2.getSmartDb() as any;
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
		let deck = await database
			.select()
			.from(flashcardDecks)
			.where(and(eq(flashcardDecks.userId, user.id), eq(flashcardDecks.name, 'Snap Solutions')))
			.limit(1)
			.then((rows: any[]) => rows[0]);

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
		console.debug('Error saving flashcard:', error);
		return { success: false, error: 'Failed to save flashcard' };
	}
}

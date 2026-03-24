import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import {
	addFlashcardToDeck,
	createFlashcardDeck,
	getUserDecks,
} from '@/lib/db/review-queue-actions';
import { generateFlashcardsFromAIResponse, validateFlashcards } from '@/lib/flashcard-generator';

const requestSchema = z.object({
	content: z.string().min(10, 'Content must be at least 10 characters'),
	subject: z.string().min(1, 'Subject is required').max(100),
	topic: z.string().min(1, 'Topic is required').max(500),
	deckName: z.string().max(200).optional(),
	deckId: z.string().uuid().optional(),
	maxCards: z.number().min(1).max(20).optional().default(10),
});

interface FlashcardResult {
	id: string;
	front: string;
	back: string;
	type: string;
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = requestSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { content, subject, topic, deckName, deckId, maxCards } = validation.data;
		const userId = session.user.id;

		// Generate flashcards from content
		const rawFlashcards = generateFlashcardsFromAIResponse(content, subject, { maxCards });
		const flashcards = validateFlashcards(rawFlashcards);

		if (flashcards.length === 0) {
			return NextResponse.json(
				{ error: 'Could not extract flashcards from the provided content' },
				{ status: 400 }
			);
		}

		// Find or create deck
		let targetDeckId = deckId;
		let deckInfo: { id: string; name: string; cardCount: number };

		if (targetDeckId) {
			// Verify the deck exists and belongs to user
			const userDecks = await getUserDecks(userId);
			const existingDeck = userDecks.find((d) => d.id === targetDeckId);
			if (!existingDeck || !existingDeck.name || !existingDeck.id) {
				return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
			}
			const deckName_ = existingDeck.name as string;
			const deckId_ = existingDeck.id as string;
			deckInfo = {
				id: deckId_,
				name: deckName_,
				cardCount: existingDeck.cardCount ?? 0,
			};
		} else {
			// Create new deck or find existing one by name
			const finalDeckName = deckName || `${subject} - ${topic}`;
			const userDecks = await getUserDecks(userId);
			const existingDeck = userDecks.find(
				(d) => d.name && d.id && d.name.toLowerCase() === finalDeckName.toLowerCase()
			);

			if (existingDeck?.name && existingDeck?.id) {
				targetDeckId = existingDeck.id as string;
				const deckName_ = existingDeck.name as string;
				deckInfo = {
					id: existingDeck.id as string,
					name: deckName_,
					cardCount: existingDeck.cardCount ?? 0,
				};
			} else {
				const result = await createFlashcardDeck(
					userId,
					finalDeckName,
					`Flashcards from AI tutor: ${subject} - ${topic}`,
					undefined
				);

				if (!result.success || !result.deck || !result.deck.id || !result.deck.name) {
					return NextResponse.json(
						{ error: result.error || 'Failed to create deck' },
						{ status: 500 }
					);
				}

				targetDeckId = result.deck.id;
				deckInfo = {
					id: result.deck.id,
					name: result.deck.name,
					cardCount: 0,
				};
			}
		}

		// Add flashcards to deck
		const createdCards: FlashcardResult[] = [];
		const errors: string[] = [];

		for (const card of flashcards) {
			const result = await addFlashcardToDeck(
				targetDeckId!,
				card.front,
				card.back,
				card.type === 'formula' ? 'easy' : 'medium'
			);

			if (result.success && result.flashcard?.id) {
				createdCards.push({
					id: result.flashcard.id as string,
					front: card.front,
					back: card.back,
					type: card.type,
				});
			} else {
				errors.push(`Failed to add card: ${card.front.slice(0, 30)}...`);
			}
		}

		if (createdCards.length === 0) {
			return NextResponse.json(
				{ error: 'Failed to create any flashcards', details: errors },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			flashcards: createdCards,
			deck: deckInfo,
			count: createdCards.length,
			errors: errors.length > 0 ? errors : undefined,
		});
	} catch (error) {
		console.debug('[Flashcards from AI] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while creating flashcards' },
			{ status: 500 }
		);
	}
}

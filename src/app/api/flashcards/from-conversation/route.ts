import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import {
	addFlashcardToDeck,
	createFlashcardDeck,
	getUserDecks,
} from '@/lib/db/review-queue-actions';

const requestSchema = z.object({
	conversation: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1),
			})
		)
		.min(1, 'Conversation must have at least one message'),
	subject: z.string().optional(),
	deckId: z.string().uuid().optional(),
	deckName: z.string().max(200).optional(),
});

interface ExtractedConcept {
	term: string;
	definition: string;
	context: string;
	suggestedTags: string[];
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

		const { conversation, subject, deckId, deckName } = validation.data;
		const userId = session.user.id;

		// Extract concepts from conversation using the extract-concepts API
		const extractResponse = await fetch(`${request.nextUrl.origin}/api/ai-tutor/extract-concepts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: request.headers.get('cookie') || '',
			},
			body: JSON.stringify({
				conversation: conversation.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				subject,
			}),
		});

		if (!extractResponse.ok) {
			return NextResponse.json(
				{ error: 'Failed to extract concepts from conversation' },
				{ status: 500 }
			);
		}

		const { concepts }: { concepts: ExtractedConcept[] } = await extractResponse.json();

		if (!concepts || concepts.length === 0) {
			return NextResponse.json(
				{ error: 'No concepts could be extracted from the conversation' },
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
			if (!existingDeck?.name || !existingDeck.id) {
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
			const finalDeckName = deckName || `${subject || 'Study'} Flashcards from Conversation`;
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
					`Flashcards extracted from AI tutor conversation: ${subject || 'General'}`,
					undefined
				);

				if (!result.success || !result.deck?.id || !result.deck.name) {
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

		// Create flashcards from concepts
		const createdCards: { id: string; front: string; back: string; tags: string[] }[] = [];
		const errors: string[] = [];

		for (const concept of concepts) {
			const result = await addFlashcardToDeck(
				targetDeckId!,
				concept.term,
				concept.definition,
				'medium'
			);

			if (result.success && result.flashcard?.id) {
				createdCards.push({
					id: result.flashcard.id as string,
					front: concept.term,
					back: concept.definition,
					tags: concept.suggestedTags,
				});
			} else {
				errors.push(`Failed to add card: ${concept.term.slice(0, 30)}...`);
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
			conceptsExtracted: concepts.length,
			errors: errors.length > 0 ? errors : undefined,
		});
	} catch (error) {
		console.debug('Flashcard Generation Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while generating flashcards' },
			{ status: 500 }
		);
	}
}

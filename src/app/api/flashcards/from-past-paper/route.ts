import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import {
	addFlashcardToDeck,
	createFlashcardDeck,
	getUserDecks,
} from '@/lib/db/review-queue-actions';
import { getEnv } from '@/lib/env';
import { generateFlashcardsFromAIResponse, validateFlashcards } from '@/lib/flashcard-generator';

const requestSchema = z.object({
	paperId: z.string().min(1, 'Paper ID is required'),
	maxCards: z.number().min(1).max(20).optional().default(10),
	deckName: z.string().max(200).optional(),
	deckId: z.string().uuid().optional(),
});

interface FlashcardResult {
	id: string;
	front: string;
	back: string;
	type: string;
}

async function fetchPastPaperContent(paperId: string): Promise<string | null> {
	const databaseUrl = getEnv('DATABASE_URL');
	if (!databaseUrl) return null;

	try {
		const response = await fetch(
			`${databaseUrl}/rest/v1/past_papers?paper_id=eq.${encodeURIComponent(paperId)}&select=extracted_questions,subject,paper,year,month`,
			{
				headers: {
					'Content-Type': 'application/json',
					apikey: databaseUrl.split('@')[1]?.split('/')[2] || '',
					Authorization: `Bearer ${databaseUrl.split('@')[1]?.split('/')[2] || ''}`,
				},
			}
		);

		if (!response.ok) return null;

		const data = await response.json();
		if (!data[0]) return null;

		const paper = data[0];
		let content = `${paper.subject} ${paper.paper} - ${paper.month} ${paper.year}\n\n`;

		if (paper.extracted_questions && Array.isArray(paper.extracted_questions)) {
			for (const q of paper.extracted_questions) {
				if (q.question) {
					content += `Question ${q.number || ''}: ${q.question}\n`;
					if (q.answer) content += `Answer: ${q.answer}\n`;
					if (q.solution) content += `Solution: ${q.solution}\n`;
					content += '\n';
				}
			}
		}

		return content.length > 100 ? content : null;
	} catch (error) {
		console.debug('[API] Error fetching past paper content:', error);
		return null;
	}
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

		const { paperId, maxCards, deckName, deckId } = validation.data;
		const userId = session.user.id;

		const pastPaperContent = await fetchPastPaperContent(paperId);
		if (!pastPaperContent) {
			return NextResponse.json(
				{ error: 'Could not extract content from this past paper' },
				{ status: 400 }
			);
		}

		const subjectMatch = pastPaperContent.match(/^([A-Za-z]+)/);
		const subject = subjectMatch ? subjectMatch[1] : 'General';

		const rawFlashcards = generateFlashcardsFromAIResponse(pastPaperContent, subject, { maxCards });
		const flashcards = validateFlashcards(rawFlashcards);

		if (flashcards.length === 0) {
			return NextResponse.json(
				{ error: 'Could not extract flashcards from this past paper' },
				{ status: 400 }
			);
		}

		let targetDeckId = deckId;
		let deckInfo: { id: string; name: string; cardCount: number };

		if (targetDeckId) {
			const userDecks = await getUserDecks(userId);
			const existingDeck = userDecks.find((d) => d.id === targetDeckId);
			if (!existingDeck?.name || !existingDeck.id) {
				return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
			}
			deckInfo = {
				id: existingDeck.id as string,
				name: existingDeck.name as string,
				cardCount: existingDeck.cardCount ?? 0,
			};
		} else {
			const finalDeckName = deckName || `Past Paper - ${subject}`;
			const userDecks = await getUserDecks(userId);
			const existingDeck = userDecks.find(
				(d) => d.name && d.id && d.name.toLowerCase() === finalDeckName.toLowerCase()
			);

			if (existingDeck?.name && existingDeck?.id) {
				targetDeckId = existingDeck.id as string;
				deckInfo = {
					id: existingDeck.id as string,
					name: existingDeck.name as string,
					cardCount: existingDeck.cardCount ?? 0,
				};
			} else {
				const result = await createFlashcardDeck(
					userId,
					finalDeckName,
					`Flashcards generated from past paper: ${paperId}`,
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
		console.debug('[Flashcards from Past Paper] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while creating flashcards' },
			{ status: 500 }
		);
	}
}

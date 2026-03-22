'use server';

import { and, eq, like, sql } from 'drizzle-orm';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { ensureAuthenticated } from '@/lib/db/actions';
import { dbManager, getDb } from '@/lib/db/index';
import { flashcardDecks, flashcards } from '@/lib/db/schema';

export interface PdfFlashcardResult {
	success: boolean;
	cardsCreated: number;
	errors: string[];
	deckId?: string;
}

export interface PdfPage {
	pageNumber: number;
	content: string;
}

export interface ExtractedConcept {
	concept: string;
	question: string;
	answer: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

async function getConnectedDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return getDb();
}

async function extractConceptsFromText(
	text: string,
	subject: string,
	topic?: string
): Promise<ExtractedConcept[]> {
	const prompt = `You are an expert South African Matriculation (Grade 12) study tutor. Analyze the following text and extract key concepts that would make good flashcards for exam preparation.

Requirements:
1. Extract 10-15 key concepts per page
2. Focus on definitions, formulas, theorems, processes, and important facts
3. Each flashcard should have:
   - A clear, testable question on the front
   - A complete answer on the back
4. Topics should be categorized appropriately
5. Difficulty should be based on NSC exam standards

Text to analyze:
${text}

Subject: ${subject}
${topic ? `Topic: ${topic}` : ''}

Return ONLY valid JSON array with this format:
{
  "concepts": [
    {
      "concept": "Brief name of the concept",
      "question": "The flashcard question",
      "answer": "The complete answer",
      "topic": "The topic this belongs to",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make questions specific and testable. Avoid vague questions like "What is X?" when possible.`;

	try {
		const result = await generateAI({
			prompt,
			model: AI_MODELS.PRIMARY,
		});

		if (!result) {
			throw new Error('AI generation returned empty result');
		}

		const jsonMatch = result.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			return parsed.concepts || [];
		}

		return [];
	} catch (error) {
		console.debug('[PdfToFlashcard] Concept extraction failed:', error);
		return [];
	}
}

async function findOrCreatePdfDeck(userId: string, paperName: string, _subject: string) {
	const db = await getConnectedDb();

	const deckName = `Past Paper: ${paperName}`;
	let deck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.userId, userId), eq(flashcardDecks.name, deckName)),
	});

	if (!deck) {
		const [newDeck] = await db
			.insert(flashcardDecks)
			.values({
				userId,
				name: deckName,
				description: `Flashcards generated from ${paperName} past paper`,
				isPublic: false,
			})
			.returning();
		deck = newDeck;
	}

	return deck;
}

export async function generateFlashcardsFromPdf(
	pdfText: string,
	subject: string,
	paperName: string,
	topic?: string,
	_cardsPerPage = 10
): Promise<PdfFlashcardResult> {
	const result: PdfFlashcardResult = {
		success: false,
		cardsCreated: 0,
		errors: [],
	};

	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const deck = await findOrCreatePdfDeck(user.id, paperName, subject);
		result.deckId = deck.id;

		const pageContents = pdfText.split(/\n\n+/).filter((p) => p.trim().length > 50);

		const pagesToProcess = pageContents.slice(0, 10);

		for (const pageContent of pagesToProcess) {
			if (pageContent.trim().length < 100) continue;

			const concepts = await extractConceptsFromText(pageContent, subject, topic);

			for (const concept of concepts) {
				const existingCard = await db
					.select({ id: flashcards.id })
					.from(flashcards)
					.where(
						and(
							eq(flashcards.deckId, deck.id),
							eq(flashcards.front, concept.question.substring(0, 500))
						)
					)
					.limit(1);

				if (existingCard.length > 0) {
					continue;
				}

				await db.insert(flashcards).values({
					deckId: deck.id,
					front: concept.question.substring(0, 1000),
					back: concept.answer.substring(0, 2000),
					difficulty: concept.difficulty,
					timesReviewed: 0,
					timesCorrect: 0,
					easeFactor: '2.5',
					intervalDays: 1,
					repetitions: 0,
					nextReview: new Date(),
				});

				result.cardsCreated++;
			}
		}

		await db
			.update(flashcardDecks)
			.set({
				cardCount: sql`${flashcardDecks.cardCount} + ${result.cardsCreated}`,
				updatedAt: new Date(),
			})
			.where(eq(flashcardDecks.id, deck.id));

		result.success = true;
		return result;
	} catch (error) {
		console.debug('[PdfToFlashcard] Error generating flashcards:', error);
		result.errors.push(String(error));
		return result;
	}
}

export async function generateFlashcardsBatchFromPdf(
	pdfPages: PdfPage[],
	subject: string,
	paperName: string,
	topic?: string,
	_cardsPerPage = 10
): Promise<PdfFlashcardResult> {
	const result: PdfFlashcardResult = {
		success: false,
		cardsCreated: 0,
		errors: [],
	};

	if (pdfPages.length === 0) {
		return result;
	}

	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const deck = await findOrCreatePdfDeck(user.id, paperName, subject);
		result.deckId = deck.id;

		const pagesToProcess = pdfPages.slice(0, 10);

		for (const page of pagesToProcess) {
			const concepts = await extractConceptsFromText(page.content, subject, topic);

			for (const concept of concepts) {
				const existingCard = await db
					.select({ id: flashcards.id })
					.from(flashcards)
					.where(
						and(
							eq(flashcards.deckId, deck.id),
							eq(flashcards.front, concept.question.substring(0, 500))
						)
					)
					.limit(1);

				if (existingCard.length > 0) {
					continue;
				}

				await db.insert(flashcards).values({
					deckId: deck.id,
					front: concept.question.substring(0, 1000),
					back: concept.answer.substring(0, 2000),
					difficulty: concept.difficulty,
					timesReviewed: 0,
					timesCorrect: 0,
					easeFactor: '2.5',
					intervalDays: 1,
					repetitions: 0,
					nextReview: new Date(),
				});

				result.cardsCreated++;
			}
		}

		await db
			.update(flashcardDecks)
			.set({
				cardCount: sql`${flashcardDecks.cardCount} + ${result.cardsCreated}`,
				updatedAt: new Date(),
			})
			.where(eq(flashcardDecks.id, deck.id));

		result.success = true;
		return result;
	} catch (error) {
		console.debug('[PdfToFlashcard] Error in batch generation:', error);
		result.errors.push(String(error));
		return result;
	}
}

export async function getPdfFlashcardDecks(): Promise<
	Array<{
		id: string;
		name: string;
		description: string | null;
		cardCount: number;
		createdAt: Date | null;
	}>
> {
	const user = await ensureAuthenticated();
	const db = await getConnectedDb();

	const decks = await db
		.select({
			id: flashcardDecks.id,
			name: flashcardDecks.name,
			description: flashcardDecks.description,
			cardCount: flashcardDecks.cardCount,
			createdAt: flashcardDecks.createdAt,
		})
		.from(flashcardDecks)
		.where(and(eq(flashcardDecks.userId, user.id), like(flashcardDecks.name, 'Past Paper:%')));

	return decks;
}

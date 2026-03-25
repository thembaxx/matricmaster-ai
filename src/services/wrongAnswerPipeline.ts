'use server';

import { and, eq, like, sql } from 'drizzle-orm';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { ensureAuthenticated } from '@/lib/db/actions';
import { dbManager, getDb } from '@/lib/db/index';
import { flashcardDecks, flashcards } from '@/lib/db/schema';

export type FlashcardSourceType = 'manual' | 'ai_generated' | 'quiz_mistake' | 'pdf';

export interface WrongAnswerData {
	questionId: string;
	questionText: string;
	correctAnswer: string;
	userAnswer?: string;
	explanation?: string;
	topic: string;
	subject: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GeneratedFlashcard {
	front: string;
	back: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	explanation?: string;
}

export interface PipelineResult {
	success: boolean;
	flashcardId?: string;
	flashcardIds?: string[];
	cardsCreated?: number;
	error?: string;
}

export interface QuizMistakesFlashcards {
	quizMistakeDeckId?: string;
	createdCount: number;
	skippedCount: number;
	errors: string[];
}

async function getConnectedDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return getDb();
}

function extractKeyConcept(questionText: string, topic: string): string {
	const conceptMatch = questionText.match(
		/(?:what is|define|explain|calculate|find|determine|prove|differentiate|integrate|solve)\s+(?:the\s+)?([^.!?]+)/i
	);
	if (conceptMatch) {
		return conceptMatch[1].trim();
	}

	const topicMatch = questionText.match(/(?:in|of|for|with|to)\s+([^,.\n]+)/);
	if (topicMatch) {
		return `${topic}: ${topicMatch[1].trim()}`;
	}

	return topic;
}

async function generateAIFlashcard(wrongAnswer: WrongAnswerData): Promise<GeneratedFlashcard> {
	const keyConcept = extractKeyConcept(wrongAnswer.questionText, wrongAnswer.topic);

	const prompt = `You are an expert South African Matriculation (Grade 12) study tutor creating flashcards for spaced repetition.

Given this wrong quiz question:
- Question: ${wrongAnswer.questionText}
- Correct Answer: ${wrongAnswer.correctAnswer}
- User's Answer: ${wrongAnswer.userAnswer || 'Not provided'}
- Explanation: ${wrongAnswer.explanation || 'None provided'}
- Topic: ${wrongAnswer.topic}
- Subject: ${wrongAnswer.subject}

Create ONE flashcard that helps the student master this concept. The flashcard should:
1. Front: A clear, concise question that tests the KEY CONCEPT (not the exact question, but the underlying principle)
2. Back: The answer with a brief explanation
3. Focus on WHY the correct answer is correct, not just WHAT it is

Return ONLY valid JSON with this exact format:
{
  "front": "The question or prompt",
  "back": "The answer with explanation",
  "difficulty": "easy|medium|hard",
  "topic": "${wrongAnswer.topic}",
  "explanation": "Brief teaching note"
}

Make the front question generic enough to apply to similar problems, not just this exact question.`;

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
			return {
				front: parsed.front || `What is ${keyConcept}?`,
				back: parsed.back || `${wrongAnswer.correctAnswer}\n\n${parsed.explanation || ''}`,
				topic: parsed.topic || wrongAnswer.topic,
				difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty)
					? parsed.difficulty
					: 'medium',
				explanation: parsed.explanation,
			};
		}

		return {
			front: `What is ${keyConcept}?`,
			back: `${wrongAnswer.correctAnswer}${wrongAnswer.explanation ? `\n\n${wrongAnswer.explanation}` : ''}`,
			topic: wrongAnswer.topic,
			difficulty: wrongAnswer.difficulty || 'medium',
		};
	} catch (error) {
		console.debug('[WrongAnswerPipeline] AI generation failed:', error);
		return {
			front: `What is ${keyConcept}?`,
			back: `${wrongAnswer.correctAnswer}${wrongAnswer.explanation ? `\n\n${wrongAnswer.explanation}` : ''}`,
			topic: wrongAnswer.topic,
			difficulty: wrongAnswer.difficulty || 'medium',
		};
	}
}

async function findOrCreateMistakesDeck(userId: string, topic?: string) {
	const db = await getConnectedDb();

	const deckName = topic ? `Quiz Mistakes: ${topic}` : 'Quiz Mistakes';
	let deck = await db.query.flashcardDecks.findFirst({
		where: and(eq(flashcardDecks.userId, userId), eq(flashcardDecks.name, deckName)),
	});

	if (!deck) {
		const [newDeck] = await db
			.insert(flashcardDecks)
			.values({
				userId,
				name: deckName,
				description: `Flashcards automatically generated from quiz mistakes${topic ? ` on ${topic}` : ''}`,
			})
			.returning();
		deck = newDeck;
	}

	return deck;
}

async function checkDuplicate(deckId: string, front: string): Promise<boolean> {
	const db = await getConnectedDb();

	const existing = await db
		.select({ id: flashcards.id })
		.from(flashcards)
		.where(and(eq(flashcards.deckId, deckId), eq(flashcards.front, front.substring(0, 500))))
		.limit(1);

	return existing.length > 0;
}

export async function createFlashcardFromWrongAnswer(
	wrongAnswer: WrongAnswerData
): Promise<PipelineResult> {
	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const deck = await findOrCreateMistakesDeck(user.id, wrongAnswer.topic);

		const isDuplicate = await checkDuplicate(deck.id, wrongAnswer.questionText);
		if (isDuplicate) {
			return {
				success: false,
				error: 'duplicate',
			};
		}

		const generatedCard = await generateAIFlashcard(wrongAnswer);

		const [flashcard] = await db
			.insert(flashcards)
			.values({
				deckId: deck.id,
				front: generatedCard.front.substring(0, 1000),
				back: generatedCard.back.substring(0, 2000),
				difficulty: generatedCard.difficulty,
				timesReviewed: 0,
				timesCorrect: 0,
				easeFactor: '2.5',
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
			.where(eq(flashcardDecks.id, deck.id));

		return {
			success: true,
			flashcardId: flashcard.id,
		};
	} catch (error) {
		console.debug('[WrongAnswerPipeline] Error creating flashcard:', error);
		return {
			success: false,
			error: 'Failed to create flashcard',
		};
	}
}

export async function processQuizMistakes(
	wrongAnswers: WrongAnswerData[]
): Promise<QuizMistakesFlashcards> {
	const result: QuizMistakesFlashcards = {
		createdCount: 0,
		skippedCount: 0,
		errors: [],
	};

	if (wrongAnswers.length === 0) {
		return result;
	}

	try {
		const user = await ensureAuthenticated();
		const deck = await findOrCreateMistakesDeck(user.id);

		result.quizMistakeDeckId = deck.id;

		for (const wrongAnswer of wrongAnswers) {
			const pipelineResult = await createFlashcardFromWrongAnswer(wrongAnswer);

			if (pipelineResult.success && pipelineResult.flashcardId) {
				result.createdCount++;
			} else if (pipelineResult.error === 'duplicate') {
				result.skippedCount++;
			} else {
				result.errors.push(`Failed for question: ${wrongAnswer.questionId}`);
			}
		}

		return result;
	} catch (error) {
		console.debug('[WrongAnswerPipeline] Error processing quiz mistakes:', error);
		result.errors.push(String(error));
		return result;
	}
}

export async function getQuizMistakeCards(
	deckId?: string,
	sortBy: 'mostRecent' | 'hardestFirst' = 'mostRecent',
	options?: { limit?: number; offset?: number }
): Promise<Array<typeof flashcards.$inferSelect & { deckName: string | null }>> {
	const user = await ensureAuthenticated();
	const db = await getConnectedDb();

	const whereClause = deckId
		? and(
				eq(flashcardDecks.userId, user.id),
				eq(flashcardDecks.id, deckId),
				like(flashcardDecks.name, 'Quiz Mistakes%')
			)
		: and(eq(flashcardDecks.userId, user.id), like(flashcardDecks.name, 'Quiz Mistakes%'));

	const cards = await db
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
			sourceType: flashcards.sourceType,
			sourceQuestionId: flashcards.sourceQuestionId,
			createdAt: flashcards.createdAt,
			updatedAt: flashcards.updatedAt,
			deckName: flashcardDecks.name,
		})
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(whereClause)
		.orderBy(
			sortBy === 'hardestFirst'
				? sql` CAST(${flashcards.easeFactor} AS FLOAT) ASC`
				: sql`${flashcards.createdAt} DESC`
		)
		.limit(options?.limit ?? 50)
		.offset(options?.offset ?? 0);

	return cards;
}

export async function getQuizMistakeStats(): Promise<{
	totalCards: number;
	dueToday: number;
	averageEase: number;
}> {
	const user = await ensureAuthenticated();
	const db = await getConnectedDb();
	const now = new Date();

	const cards = await db
		.select()
		.from(flashcards)
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(and(eq(flashcardDecks.userId, user.id), like(flashcardDecks.name, 'Quiz Mistakes%')));

	let dueToday = 0;
	let totalEase = 0;
	let easeCount = 0;

	for (const card of cards) {
		if (card.flashcards.nextReview && new Date(card.flashcards.nextReview) <= now) {
			dueToday++;
		}
		if (card.flashcards.timesReviewed && card.flashcards.timesReviewed > 0) {
			totalEase += Number(card.flashcards.easeFactor);
			easeCount++;
		}
	}

	return {
		totalCards: cards.length,
		dueToday,
		averageEase: easeCount > 0 ? totalEase / easeCount : 2.5,
	};
}

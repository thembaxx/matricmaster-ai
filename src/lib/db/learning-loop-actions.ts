'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { dbManager, getDb } from './index';
import { flashcardDecks, flashcards, options, questions, topicMastery } from './schema';

export interface MistakeInfo {
	questionId: string;
	questionText: string;
	correctAnswer: string;
	explanation: string | null;
	topic: string;
	subject: string;
}

export interface WeakTopic {
	topic: string;
	masteryLevel: number;
	subjectId: number;
}

async function getConnectedDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return getDb();
}

export async function getWeakTopicsForUser(): Promise<WeakTopic[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const masteryRecords = await db
			.select()
			.from(topicMastery)
			.where(and(eq(topicMastery.userId, user.id), eq(topicMastery.consecutiveCorrect, 0)));

		const weakTopics: WeakTopic[] = [];
		for (const record of masteryRecords) {
			if (record.questionsAttempted && record.questionsAttempted >= 3) {
				const accuracy = Number(record.masteryLevel) || 0;
				if (accuracy < 50) {
					weakTopics.push({
						topic: record.topic,
						masteryLevel: accuracy,
						subjectId: record.subjectId,
					});
				}
			}
		}

		return weakTopics.sort((a, b) => a.masteryLevel - b.masteryLevel).slice(0, 10);
	} catch (error) {
		console.error('[Learning Loop] Error getting weak topics:', error);
		return [];
	}
}

export async function getMistakesFromStore(): Promise<MistakeInfo[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const { useQuizResultStore } = await import('@/stores/useQuizResultStore');
		const mistakes = useQuizResultStore.getState().getLastMistakes();

		if (mistakes.length === 0) {
			return [];
		}

		const mistakeInfos: MistakeInfo[] = [];

		for (const mistake of mistakes) {
			const questionRecords = await db
				.select()
				.from(questions)
				.where(eq(questions.id, mistake.questionId))
				.limit(1);

			if (!questionRecords[0]) continue;

			const question = questionRecords[0];

			const optionRecords = await db
				.select()
				.from(options)
				.where(and(eq(options.questionId, question.id), eq(options.isCorrect, true)))
				.limit(1);

			const correctOption = optionRecords[0];

			mistakeInfos.push({
				questionId: question.id,
				questionText: question.questionText || '',
				correctAnswer: correctOption?.optionText || '',
				explanation: correctOption?.explanation || null,
				topic: mistake.topic,
				subject: mistake.subject,
			});
		}

		return mistakeInfos;
	} catch (error) {
		console.error('[Learning Loop] Error getting mistakes from store:', error);
		return [];
	}
}

export async function generateFlashcardsFromMistakes(): Promise<{
	success: boolean;
	cardsCreated: number;
	error?: string;
}> {
	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const mistakes = await getMistakesFromStore();

		if (mistakes.length === 0) {
			return { success: true, cardsCreated: 0, error: 'no_mistakes' };
		}

		let deck = await db.query.flashcardDecks.findFirst({
			where: eq(flashcardDecks.userId, user.id),
		});

		if (!deck) {
			const [newDeck] = await db
				.insert(flashcardDecks)
				.values({
					userId: user.id,
					name: 'Mistake Master',
					description: 'Flashcards generated from quiz mistakes for focused practice',
				})
				.returning();
			deck = newDeck;
		}

		let cardsCreated = 0;

		for (const mistake of mistakes) {
			const existingCards = await db
				.select()
				.from(flashcards)
				.where(
					and(
						eq(flashcards.deckId, deck!.id),
						eq(flashcards.front, mistake.questionText.substring(0, 500))
					)
				)
				.limit(1);

			if (existingCards.length > 0) {
				continue;
			}

			const back = mistake.explanation
				? `${mistake.correctAnswer}\n\nExplanation: ${mistake.explanation}`
				: mistake.correctAnswer;

			await db.insert(flashcards).values({
				deckId: deck!.id,
				front: mistake.questionText.substring(0, 1000),
				back: back.substring(0, 2000),
				difficulty: 'medium',
				easeFactor: '2.5',
				intervalDays: 1,
				repetitions: 0,
				nextReview: new Date(),
			});

			cardsCreated++;
		}

		if (deck.cardCount !== undefined) {
			await db
				.update(flashcardDecks)
				.set({ cardCount: (deck.cardCount || 0) + cardsCreated })
				.where(eq(flashcardDecks.id, deck.id));
		}

		return { success: true, cardsCreated };
	} catch (error) {
		console.error('[Learning Loop] Error generating flashcards:', error);
		return { success: false, cardsCreated: 0, error: 'Generation failed' };
	}
}

export async function generateFlashcardsFromWeakTopics(): Promise<{
	success: boolean;
	cardsCreated: number;
	error?: string;
}> {
	try {
		const user = await ensureAuthenticated();
		const db = await getConnectedDb();

		const weakTopics = await getWeakTopicsForUser();

		if (weakTopics.length === 0) {
			return { success: true, cardsCreated: 0, error: 'no_weak_topics' };
		}

		let deck = await db.query.flashcardDecks.findFirst({
			where: eq(flashcardDecks.userId, user.id),
		});

		if (!deck) {
			const [newDeck] = await db
				.insert(flashcardDecks)
				.values({
					userId: user.id,
					name: 'Mistake Master',
					description: 'Flashcards generated from weak topics for focused practice',
				})
				.returning();
			deck = newDeck;
		}

		let cardsCreated = 0;

		for (const weakTopic of weakTopics) {
			const topicQuestions = await db
				.select()
				.from(questions)
				.where(and(eq(questions.topic, weakTopic.topic), eq(questions.isActive, true)))
				.limit(5);

			for (const question of topicQuestions) {
				const existingCards = await db
					.select()
					.from(flashcards)
					.where(
						and(
							eq(flashcards.deckId, deck!.id),
							eq(flashcards.front, question.questionText.substring(0, 500))
						)
					)
					.limit(1);

				if (existingCards.length > 0) continue;

				const correctOption = await db
					.select()
					.from(options)
					.where(and(eq(options.questionId, question.id), eq(options.isCorrect, true)))
					.limit(1);

				if (!correctOption[0]) continue;

				const back = correctOption[0].explanation
					? `${correctOption[0].optionText}\n\nExplanation: ${correctOption[0].explanation}`
					: correctOption[0].optionText;

				await db.insert(flashcards).values({
					deckId: deck!.id,
					front: question.questionText.substring(0, 1000),
					back: back.substring(0, 2000),
					difficulty: 'medium',
					easeFactor: '2.5',
					intervalDays: 1,
					repetitions: 0,
					nextReview: new Date(),
				});

				cardsCreated++;
			}
		}

		if (deck.cardCount !== undefined) {
			await db
				.update(flashcardDecks)
				.set({ cardCount: (deck.cardCount || 0) + cardsCreated })
				.where(eq(flashcardDecks.id, deck.id));
		}

		return { success: true, cardsCreated };
	} catch (error) {
		console.error('[Learning Loop] Error generating flashcards from weak topics:', error);
		return { success: false, cardsCreated: 0, error: 'Generation failed' };
	}
}

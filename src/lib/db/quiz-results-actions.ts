import { eq } from 'drizzle-orm';
import {
	createFlashcardFromWrongAnswer,
	type WrongAnswerData,
} from '@/services/wrongAnswerPipeline';
import { getDb } from './index';
import { quizResults } from './schema';

export interface QuizResultInput {
	userId: string;
	quizId: string;
	subjectId?: number;
	topic?: string;
	score: number;
	totalQuestions: number;
	percentage: number;
	timeTaken: number;
	answers?: QuizAnswerInput[];
	completedAt: string;
}

export interface QuizAnswerInput {
	questionId: string;
	questionText: string;
	selectedOption: string | null;
	correctOption: string | null;
	isCorrect: boolean;
	explanation?: string;
}

export interface QuizResultWithMistakes {
	result: Awaited<ReturnType<typeof saveQuizResult>>;
	mistakesCreated: number;
	errors: string[];
}

export async function saveQuizResultWithMistakes(
	result: QuizResultInput
): Promise<QuizResultWithMistakes> {
	const db = await getDb();

	const [savedResult] = await db
		.insert(quizResults)
		.values({
			userId: result.userId,
			quizId: result.quizId,
			score: result.score,
			totalQuestions: result.totalQuestions,
			percentage: result.percentage.toString(),
			timeTaken: result.timeTaken,
			completedAt: new Date(result.completedAt),
		})
		.returning();

	let mistakesCreated = 0;
	const errors: string[] = [];

	if (result.answers && result.answers.length > 0) {
		const wrongAnswers = result.answers.filter((a) => !a.isCorrect);

		for (const wrongAnswer of wrongAnswers) {
			const wrongAnswerData: WrongAnswerData = {
				questionId: wrongAnswer.questionId,
				questionText: wrongAnswer.questionText,
				correctAnswer: wrongAnswer.correctOption || '',
				userAnswer: wrongAnswer.selectedOption || undefined,
				explanation: wrongAnswer.explanation,
				topic: result.topic || 'General',
				subject: result.subjectId?.toString() || 'Unknown',
			};

			try {
				const flashcardResult = await createFlashcardFromWrongAnswer(wrongAnswerData);
				if (flashcardResult.success && flashcardResult.flashcardId) {
					mistakesCreated++;
				} else if (flashcardResult.error && flashcardResult.error !== 'duplicate') {
					errors.push(
						`Failed to create flashcard for question ${wrongAnswer.questionId}: ${flashcardResult.error}`
					);
				}
			} catch (error) {
				errors.push(`Error processing wrong answer ${wrongAnswer.questionId}: ${error}`);
			}
		}
	}

	return {
		result: savedResult,
		mistakesCreated,
		errors,
	};
}

export async function saveQuizResult(result: QuizResultInput) {
	const db = await getDb();

	const [savedResult] = await db
		.insert(quizResults)
		.values({
			userId: result.userId,
			quizId: result.quizId,
			score: result.score,
			totalQuestions: result.totalQuestions,
			percentage: result.percentage.toString(),
			timeTaken: result.timeTaken,
			completedAt: new Date(result.completedAt),
		})
		.returning();

	return savedResult;
}

export async function getQuizResultsByUser(userId: string) {
	const db = await getDb();
	return db.select().from(quizResults).where(eq(quizResults.userId, userId));
}

export async function getQuizResultById(id: string) {
	const db = await getDb();
	const results = await db.select().from(quizResults).where(eq(quizResults.id, id));
	return results[0] || null;
}

export async function getQuizStatsByUser(userId: string) {
	const db = await getDb();
	const results = await db.select().from(quizResults).where(eq(quizResults.userId, userId));

	type QuizResultRow = typeof quizResults.$inferSelect;
	const totalQuizzes = results.length;
	const totalQuestions = results.reduce(
		(sum: number, r: QuizResultRow) => sum + r.totalQuestions,
		0
	);
	const totalCorrect = results.reduce((sum: number, r: QuizResultRow) => sum + r.score, 0);
	const averagePercentage =
		totalQuizzes > 0
			? results.reduce((sum: number, r: QuizResultRow) => sum + Number(r.percentage), 0) /
				totalQuizzes
			: 0;

	return {
		totalQuizzes,
		totalQuestions,
		totalCorrect,
		averagePercentage: Math.round(averagePercentage * 100) / 100,
		bestScore: Math.max(...results.map((r: QuizResultRow) => Number(r.percentage)), 0),
		totalTimeSpent: results.reduce((sum: number, r: QuizResultRow) => sum + r.timeTaken, 0),
	};
}

export async function getRecentQuizResults(userId: string, limit = 10) {
	const db = await getDb();
	return db
		.select()
		.from(quizResults)
		.where(eq(quizResults.userId, userId))
		.orderBy(quizResults.completedAt)
		.limit(limit);
}

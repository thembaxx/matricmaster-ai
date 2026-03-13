import { eq } from 'drizzle-orm';
import { dbManager } from './index';
import { quizResults } from './schema';

export interface QuizResultInput {
	userId: string;
	quizId: string;
	score: number;
	totalQuestions: number;
	percentage: number;
	timeTaken: number;
	answers?: {
		questionId: string;
		selectedOption: string | null;
		isCorrect: boolean;
	}[];
	completedAt: string;
}

export async function saveQuizResult(result: QuizResultInput) {
	const connected = await dbManager.waitForConnection();
	if (!connected) {
		throw new Error('Database connection failed');
	}

	const db = await dbManager.getDb();

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
	const connected = await dbManager.waitForConnection();
	if (!connected) {
		throw new Error('Database connection failed');
	}

	const db = await dbManager.getDb();
	return db.select().from(quizResults).where(eq(quizResults.userId, userId));
}

export async function getQuizResultById(id: string) {
	const connected = await dbManager.waitForConnection();
	if (!connected) {
		throw new Error('Database connection failed');
	}

	const db = await dbManager.getDb();
	const results = await db.select().from(quizResults).where(eq(quizResults.id, id));
	return results[0] || null;
}

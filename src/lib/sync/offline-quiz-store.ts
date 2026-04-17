import { type IDBPDatabase, openDB } from 'idb';

export interface OfflineQuizAnswer {
	questionId: string;
	selectedOption: string;
	isCorrect: boolean;
}

export interface OfflineQuizResult {
	id: string;
	userId: string;
	quizId: string;
	subjectId: number;
	topic?: string;
	answers: OfflineQuizAnswer[];
	score: number;
	totalQuestions: number;
	percentage: number;
	timeTaken: number;
	completedAt: string;
	synced: boolean;
}

const DB_NAME = 'lumni-offline-quizzes';
const STORE_NAME = 'pendingQuizzes';

let db: IDBPDatabase | null = null;

export async function getOfflineQuizDB(): Promise<IDBPDatabase> {
	if (db) return db;

	db = await openDB(DB_NAME, 1, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				store.createIndex('by-synced', 'synced');
			}
		},
	});

	return db;
}

export async function saveOfflineQuizResult(result: OfflineQuizResult): Promise<void> {
	const db = await getOfflineQuizDB();
	await db.put(STORE_NAME, result);
}

export async function getPendingQuizzes(): Promise<OfflineQuizResult[]> {
	const db = await getOfflineQuizDB();
	return db.getAllFromIndex(STORE_NAME, 'by-synced', 0);
}

export async function getAllQuizzes(): Promise<OfflineQuizResult[]> {
	const db = await getOfflineQuizDB();
	return db.getAll(STORE_NAME);
}

export async function markQuizSynced(id: string): Promise<void> {
	const db = await getOfflineQuizDB();
	const quiz = await db.get(STORE_NAME, id);
	if (quiz) {
		quiz.synced = true;
		await db.put(STORE_NAME, quiz);
	}
}

export async function deleteOfflineQuiz(id: string): Promise<void> {
	const db = await getOfflineQuizDB();
	await db.delete(STORE_NAME, id);
}

export async function getPendingCount(): Promise<number> {
	const pending = await getPendingQuizzes();
	return pending.length;
}

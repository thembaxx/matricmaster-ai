'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

interface QuizAnswer {
	questionId: string;
	selectedOption: string;
	isCorrect: boolean;
	timeSpentMs: number;
	answeredAt: string;
}

interface QuizSession {
	id: string;
	quizId: string;
	subject: string;
	answers: QuizAnswer[];
	currentQuestionIndex: number;
	startedAt: string;
	lastUpdatedAt: string;
	completed: boolean;
}

interface QuizOfflineDB extends DBSchema {
	quizSessions: {
		key: string;
		value: QuizSession;
		indexes: { 'by-quiz': string };
	};
	pendingSync: {
		key: string;
		value: {
			id: string;
			type: 'answer' | 'completion';
			payload: any;
			createdAt: string;
		};
	};
}

let dbPromise: Promise<IDBPDatabase<QuizOfflineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<QuizOfflineDB>> {
	if (!dbPromise) {
		dbPromise = openDB<QuizOfflineDB>('quiz-offline-db', 1, {
			upgrade(db) {
				const sessionStore = db.createObjectStore('quizSessions', {
					keyPath: 'id',
				});
				sessionStore.createIndex('by-quiz', 'quizId');

				db.createObjectStore('pendingSync', {
					keyPath: 'id',
				});
			},
		});
	}
	return dbPromise;
}

export async function saveQuizProgress(
	sessionId: string,
	quizId: string,
	subject: string,
	currentQuestionIndex: number,
	answers: QuizAnswer[]
): Promise<void> {
	const db = await getDB();

	const session: QuizSession = {
		id: sessionId,
		quizId,
		subject,
		answers,
		currentQuestionIndex,
		startedAt: answers[0]?.answeredAt || new Date().toISOString(),
		lastUpdatedAt: new Date().toISOString(),
		completed: false,
	};

	await db.put('quizSessions', session);
}

export async function saveQuizAnswer(
	sessionId: string,
	quizId: string,
	subject: string,
	answer: QuizAnswer
): Promise<void> {
	const db = await getDB();

	const existingSession = await db.get('quizSessions', sessionId);

	if (existingSession) {
		const existingAnswers = existingSession.answers;
		const existingIndex = existingAnswers.findIndex((a) => a.questionId === answer.questionId);

		if (existingIndex >= 0) {
			existingAnswers[existingIndex] = answer;
		} else {
			existingAnswers.push(answer);
		}

		await db.put('quizSessions', {
			...existingSession,
			answers: existingAnswers,
			lastUpdatedAt: new Date().toISOString(),
		});
	} else {
		await db.put('quizSessions', {
			id: sessionId,
			quizId,
			subject,
			answers: [answer],
			currentQuestionIndex: 0,
			startedAt: new Date().toISOString(),
			lastUpdatedAt: new Date().toISOString(),
			completed: false,
		});
	}

	await queueForSync(sessionId, 'answer', {
		sessionId,
		quizId,
		answer,
	});
}

export async function completeQuizOffline(
	sessionId: string,
	quizId: string,
	subject: string,
	totalQuestions: number,
	score: number,
	percentage: number,
	timeTaken: number
): Promise<void> {
	const db = await getDB();

	const session = await db.get('quizSessions', sessionId);

	if (session) {
		await db.put('quizSessions', {
			...session,
			completed: true,
			currentQuestionIndex: totalQuestions,
			lastUpdatedAt: new Date().toISOString(),
		});
	}

	await queueForSync(sessionId, 'completion', {
		sessionId,
		quizId,
		subject,
		totalQuestions,
		score,
		percentage,
		timeTaken,
		answers: session?.answers || [],
	});
}

async function queueForSync(
	sessionId: string,
	type: 'answer' | 'completion',
	payload: any
): Promise<void> {
	const db = await getDB();

	await db.put('pendingSync', {
		id: `${sessionId}-${type}-${Date.now()}`,
		type,
		payload,
		createdAt: new Date().toISOString(),
	});
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | undefined> {
	const db = await getDB();
	return db.get('quizSessions', sessionId);
}

export async function getAllPendingSessions(): Promise<QuizSession[]> {
	const db = await getDB();
	const sessions = await db.getAll('quizSessions');
	return sessions.filter((s) => !s.completed);
}

export async function getPendingSyncItems(): Promise<
	Array<{ id: string; type: string; payload: any; createdAt: string }>
> {
	const db = await getDB();
	const items = await db.getAll('pendingSync');
	return items;
}

export async function clearPendingSyncItem(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('pendingSync', id);
}

export async function clearCompletedSession(sessionId: string): Promise<void> {
	const db = await getDB();
	await db.delete('quizSessions', sessionId);
}

export async function hasOfflineData(): Promise<boolean> {
	const db = await getDB();
	const sessions = await db.getAll('quizSessions');
	const pending = await db.getAll('pendingSync');
	return sessions.length > 0 || pending.length > 0;
}

export function isOnline(): boolean {
	if (typeof window === 'undefined') return true;
	return navigator.onLine;
}

export function registerOnlineListener(callback: (online: boolean) => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = () => callback(navigator.onLine);

	window.addEventListener('online', handler);
	window.addEventListener('offline', handler);

	return () => {
		window.removeEventListener('online', handler);
		window.removeEventListener('offline', handler);
	};
}

export async function syncAllPendingData(): Promise<{
	synced: number;
	failed: number;
}> {
	if (!isOnline()) {
		return { synced: 0, failed: 0 };
	}

	const db = await getDB();
	const pending = await db.getAll('pendingSync');

	let synced = 0;
	let failed = 0;

	for (const item of pending) {
		try {
			const response = await fetch('/api/quiz/sync-offline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item),
			});

			if (response.ok) {
				await db.delete('pendingSync', item.id);
				synced++;
			} else {
				failed++;
			}
		} catch (error) {
			console.debug('[OfflineSync] Failed to sync:', error);
			failed++;
		}
	}

	return { synced, failed };
}

const ANSWERED_QUESTIONS_KEY = 'matricmaster_answered_questions';

export function getAnsweredQuestionIds(quizId: string): string[] {
	try {
		const stored = localStorage.getItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

export function markQuestionAnswered(quizId: string, questionId: string): void {
	try {
		const answered = getAnsweredQuestionIds(quizId);
		if (!answered.includes(questionId)) {
			answered.push(questionId);
			localStorage.setItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`, JSON.stringify(answered));
		}
	} catch (error) {
		console.error('Failed to mark question as answered:', error);
	}
}

export function isQuestionAnswered(quizId: string, questionId: string): boolean {
	return getAnsweredQuestionIds(quizId).includes(questionId);
}

export function clearAnsweredQuestions(quizId: string): void {
	try {
		localStorage.removeItem(`${ANSWERED_QUESTIONS_KEY}_${quizId}`);
	} catch (error) {
		console.error('Failed to clear answered questions:', error);
	}
}

export function getAllAnsweredQuestions(): Record<string, string[]> {
	const result: Record<string, string[]> = {};
	try {
		const keys = Object.keys(localStorage).filter((k) => k.startsWith(ANSWERED_QUESTIONS_KEY));
		for (const key of keys) {
			const quizId = key.replace(`${ANSWERED_QUESTIONS_KEY}_`, '');
			const stored = localStorage.getItem(key);
			if (stored) {
				result[quizId] = JSON.parse(stored);
			}
		}
	} catch (error) {
		console.error('Failed to get all answered questions:', error);
	}
	return result;
}

'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import { getLessonsBySubject, type Lesson } from '@/lib/lessons';

export interface CachedPaper {
	id: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	downloadUrl: string;
	cachedAt: number;
	size: number;
	data?: ArrayBuffer;
}

export interface CachedQuiz {
	id: string;
	subject: string;
	topic?: string;
	questions: QuizQuestion[];
	cachedAt: number;
}

export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: string;
	explanation?: string;
}

export interface CachedAIResponse {
	prompt: string;
	response: string;
	cachedAt: number;
}

export interface StorageUsage {
	used: number;
	total: number;
	percentage: number;
}

interface OfflineCacheDB extends DBSchema {
	lessons: {
		key: string;
		value: {
			subjectId: string;
			lessons: Lesson[];
			cachedAt: number;
		};
		indexes: { 'by-date': number };
	};
	papers: {
		key: string;
		value: CachedPaper;
		indexes: { 'by-subject': string; 'by-date': number };
	};
	quizzes: {
		key: string;
		value: CachedQuiz;
		indexes: { 'by-subject': string };
	};
	aiResponses: {
		key: string;
		value: CachedAIResponse;
		indexes: { 'by-date': number };
	};
	metadata: {
		key: string;
		value: { key: string; value: unknown };
	};
}

const DB_NAME = 'matricmaster-offline-cache';
const DB_VERSION = 1;
const MAX_STORAGE_PERCENT = 50;
const AI_RESPONSE_EXPIRY_DAYS = 7;
const PAPER_EXPIRY_DAYS = 30;

let dbPromise: Promise<IDBPDatabase<OfflineCacheDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineCacheDB>> {
	if (!dbPromise) {
		dbPromise = openDB<OfflineCacheDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const lessonStore = db.createObjectStore('lessons', { keyPath: 'subjectId' });
				lessonStore.createIndex('by-date', 'cachedAt');

				const paperStore = db.createObjectStore('papers', { keyPath: 'id' });
				paperStore.createIndex('by-subject', 'subject');
				paperStore.createIndex('by-date', 'cachedAt');

				const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
				quizStore.createIndex('by-subject', 'subject');

				const aiStore = db.createObjectStore('aiResponses', { keyPath: 'prompt' });
				aiStore.createIndex('by-date', 'cachedAt');

				db.createObjectStore('metadata', { keyPath: 'key' });
			},
		});
	}
	return dbPromise;
}

function normalizeSubjectId(subjectId: number | string): string {
	return String(subjectId).toLowerCase().replace('_', '-');
}

export async function cacheLessons(subjectId: number): Promise<void> {
	const db = await getDB();
	const normalizedId = normalizeSubjectId(subjectId);
	const lessons = getLessonsBySubject(normalizedId);

	await db.put('lessons', {
		subjectId: normalizedId,
		lessons,
		cachedAt: Date.now(),
	});
}

export async function getCachedLessons(subjectId: number): Promise<Lesson[]> {
	const db = await getDB();
	const normalizedId = normalizeSubjectId(subjectId);
	const cached = await db.get('lessons', normalizedId);

	if (cached) {
		return cached.lessons;
	}
	return [];
}

export async function isLessonCached(subjectId: number): Promise<boolean> {
	const db = await getDB();
	const normalizedId = normalizeSubjectId(subjectId);
	const cached = await db.get('lessons', normalizedId);
	return !!cached;
}

export async function downloadPastPaper(paperId: string): Promise<void> {
	const response = await fetch(`/api/past-papers/${paperId}`);
	if (!response.ok) {
		throw new Error(`Failed to download paper: ${response.statusText}`);
	}

	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();

	const metadata = await fetch(`/api/past-papers/${paperId}/metadata`).catch(() => null);
	const meta = metadata?.ok
		? await metadata.json()
		: { subject: '', paper: '', year: 0, month: '' };

	const db = await getDB();
	await db.put('papers', {
		id: paperId,
		subject: meta.subject || '',
		paper: meta.paper || '',
		year: meta.year || 0,
		month: meta.month || '',
		downloadUrl: `/api/past-papers/${paperId}`,
		cachedAt: Date.now(),
		size: arrayBuffer.byteLength,
		data: arrayBuffer,
	});
}

export async function getCachedPastPaper(paperId: string): Promise<ArrayBuffer | null> {
	const db = await getDB();
	const cached = await db.get('papers', paperId);
	return cached?.data ?? null;
}

export async function getCachedPastPapers(): Promise<CachedPaper[]> {
	const db = await getDB();
	const papers = await db.getAll('papers');
	return papers.map((p) => ({ ...p, data: undefined }));
}

export async function deleteCachedPaper(paperId: string): Promise<void> {
	const db = await getDB();
	await db.delete('papers', paperId);
}

export async function cacheQuizData(quizId: string, data: CachedQuiz): Promise<void> {
	const db = await getDB();
	await db.put('quizzes', {
		...data,
		id: quizId,
		cachedAt: Date.now(),
	});
}

export async function getCachedQuiz(quizId: string): Promise<CachedQuiz | null> {
	const db = await getDB();
	const cached = await db.get('quizzes', quizId);
	return cached ?? null;
}

export async function cacheAIResponse(prompt: string, response: string): Promise<void> {
	const db = await getDB();
	const normalizedPrompt = prompt.toLowerCase().trim().substring(0, 500);
	await db.put('aiResponses', {
		prompt: normalizedPrompt,
		response,
		cachedAt: Date.now(),
	});
}

export async function getCachedAIResponse(prompt: string): Promise<string | null> {
	const db = await getDB();
	const normalizedPrompt = prompt.toLowerCase().trim().substring(0, 500);
	const cached = await db.get('aiResponses', normalizedPrompt);

	if (cached) {
		const expiryMs = AI_RESPONSE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
		if (Date.now() - cached.cachedAt < expiryMs) {
			return cached.response;
		}
		await db.delete('aiResponses', normalizedPrompt);
	}
	return null;
}

export async function getStorageUsage(): Promise<StorageUsage> {
	if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
		return { used: 0, total: 0, percentage: 0 };
	}

	const estimate = await navigator.storage.estimate();
	const used = estimate.usage ?? 0;
	const total = estimate.quota ?? 0;
	const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

	return { used, total, percentage };
}

export async function clearOldCache(): Promise<void> {
	const db = await getDB();
	const now = Date.now();
	const DAY_MS = 24 * 60 * 60 * 1000;

	const oldPapers = await db.getAll('papers');
	const paperTx = db.transaction('papers', 'readwrite');
	for (const paper of oldPapers) {
		if (now - paper.cachedAt > PAPER_EXPIRY_DAYS * DAY_MS) {
			await paperTx.store.delete(paper.id);
		}
	}
	await paperTx.done;

	const oldAI = await db.getAll('aiResponses');
	const aiTx = db.transaction('aiResponses', 'readwrite');
	for (const entry of oldAI) {
		if (now - entry.cachedAt > AI_RESPONSE_EXPIRY_DAYS * DAY_MS) {
			await aiTx.store.delete(entry.prompt);
		}
	}
	await aiTx.done;
}

export async function isStorageAvailable(): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
		return false;
	}

	try {
		const estimate = await navigator.storage.estimate();
		const percentage = (estimate.usage ?? 0) / (estimate.quota ?? 1);
		return percentage < MAX_STORAGE_PERCENT;
	} catch (error) {
		console.warn('Failed to check storage estimate:', error);
		return false;
	}
}

export async function clearAllOfflineCache(): Promise<void> {
	const db = await getDB();
	await Promise.all([
		db.clear('lessons'),
		db.clear('papers'),
		db.clear('quizzes'),
		db.clear('aiResponses'),
	]);
}

export async function getCacheStats(): Promise<{
	lessonCount: number;
	paperCount: number;
	quizCount: number;
	aiResponseCount: number;
}> {
	const db = await getDB();
	const [lessons, papers, quizzes, aiResponses] = await Promise.all([
		db.count('lessons'),
		db.count('papers'),
		db.count('quizzes'),
		db.count('aiResponses'),
	]);

	return {
		lessonCount: lessons,
		paperCount: papers,
		quizCount: quizzes,
		aiResponseCount: aiResponses,
	};
}

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

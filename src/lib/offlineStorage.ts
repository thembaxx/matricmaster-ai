'use client';

interface OfflineProgress {
	quizProgress: {
		id: string;
		quizId: string;
		subject: string;
		answers: Array<{
			questionId: string;
			selectedOption: string;
			isCorrect: boolean;
			timeSpentMs: number;
			answeredAt: string;
		}>;
		currentQuestionIndex: number;
		startedAt: string;
		lastUpdatedAt: string;
		completed: boolean;
	} | null;
	flashcardReviews: Array<{
		cardId: string;
		reviewed: boolean;
		confidence: 'easy' | 'medium' | 'hard';
		reviewedAt: string;
	}>;
	studySessionData: Record<string, unknown>;
	timestamp: number;
}

interface CachedAIConversation {
	id: string;
	messages: Array<{
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
		suggestions?: string[];
		subject?: string;
	}>;
	subject: string;
	cachedAt: number;
}

const PROGRESS_KEY = 'matricmaster_offline_progress';
const AI_CONVERSATIONS_KEY = 'matricmaster_ai_conversations';
const PENDING_SYNC_KEY = 'matricmaster_pending_sync';
const MAX_CONVERSATIONS = 20;

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function saveOfflineProgress(data: OfflineProgress): void {
	if (!isBrowser()) return;

	try {
		const serialized = JSON.stringify(data);
		localStorage.setItem(PROGRESS_KEY, serialized);
	} catch (error) {
		console.error('Failed to save offline progress:', error);
	}
}

export function getOfflineProgress(): OfflineProgress | null {
	if (!isBrowser()) return null;

	try {
		const stored = localStorage.getItem(PROGRESS_KEY);
		if (!stored) return null;

		const parsed = JSON.parse(stored) as OfflineProgress;
		const age = Date.now() - parsed.timestamp;
		const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

		if (age > MAX_AGE_MS) {
			clearOfflineProgress();
			return null;
		}

		return parsed;
	} catch (error) {
		console.error('Failed to get offline progress:', error);
		return null;
	}
}

export function clearOfflineProgress(): void {
	if (!isBrowser()) return;

	try {
		localStorage.removeItem(PROGRESS_KEY);
	} catch (error) {
		console.error('Failed to clear offline progress:', error);
	}
}

export function saveAIConversation(conversation: CachedAIConversation): void {
	if (!isBrowser()) return;

	try {
		const existing = getAIConversations();
		const existingIndex = existing.findIndex((c) => c.id === conversation.id);

		if (existingIndex >= 0) {
			existing[existingIndex] = conversation;
		} else {
			existing.unshift(conversation);
		}

		const trimmed = existing.slice(0, MAX_CONVERSATIONS);
		localStorage.setItem(AI_CONVERSATIONS_KEY, JSON.stringify(trimmed));

		if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({
				type: 'CACHE_AI_CONVERSATION',
				conversationId: conversation.id,
				messages: conversation.messages,
			});
		}
	} catch (error) {
		console.error('Failed to save AI conversation:', error);
	}
}

export function getAIConversations(): CachedAIConversation[] {
	if (!isBrowser()) return [];

	try {
		const stored = localStorage.getItem(AI_CONVERSATIONS_KEY);
		if (!stored) return [];

		const conversations = JSON.parse(stored) as CachedAIConversation[];

		return conversations.filter((c) => {
			const age = Date.now() - c.cachedAt;
			const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
			return age < MAX_AGE_MS;
		});
	} catch (error) {
		console.error('Failed to get AI conversations:', error);
		return [];
	}
}

export function getAIConversation(conversationId: string): CachedAIConversation | null {
	const conversations = getAIConversations();
	return conversations.find((c) => c.id === conversationId) || null;
}

export function deleteAIConversation(conversationId: string): void {
	if (!isBrowser()) return;

	try {
		const existing = getAIConversations();
		const filtered = existing.filter((c) => c.id !== conversationId);
		localStorage.setItem(AI_CONVERSATIONS_KEY, JSON.stringify(filtered));

		if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({
				type: 'CLEAR_AI_CACHE',
				conversationId,
			});
		}
	} catch (error) {
		console.error('Failed to delete AI conversation:', error);
	}
}

export function addPendingSyncItem(
	type: 'quiz_answer' | 'flashcard_review' | 'study_session',
	payload: Record<string, unknown>
): void {
	if (!isBrowser()) return;

	try {
		const pending = getPendingSyncItems();
		const newItem = {
			id: `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
			type,
			payload,
			createdAt: new Date().toISOString(),
		};
		pending.push(newItem);
		localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
	} catch (error) {
		console.error('Failed to add pending sync item:', error);
	}
}

export function getPendingSyncItems(): Array<{
	id: string;
	type: string;
	payload: Record<string, unknown>;
	createdAt: string;
}> {
	if (!isBrowser()) return [];

	try {
		const stored = localStorage.getItem(PENDING_SYNC_KEY);
		if (!stored) return [];

		return JSON.parse(stored);
	} catch (error) {
		console.error('Failed to get pending sync items:', error);
		return [];
	}
}

export function clearPendingSyncItem(itemId: string): void {
	if (!isBrowser()) return;

	try {
		const pending = getPendingSyncItems();
		const filtered = pending.filter((item) => item.id !== itemId);
		localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error('Failed to clear pending sync item:', error);
	}
}

export function clearAllPendingSyncItems(): void {
	if (!isBrowser()) return;

	try {
		localStorage.removeItem(PENDING_SYNC_KEY);
	} catch (error) {
		console.error('Failed to clear all pending sync items:', error);
	}
}

export async function syncOfflineProgress(): Promise<{
	success: boolean;
	synced: number;
	failed: number;
}> {
	if (!isBrowser() || !navigator.onLine) {
		return { success: false, synced: 0, failed: 0 };
	}

	const pending = getPendingSyncItems();
	if (pending.length === 0) {
		return { success: true, synced: 0, failed: 0 };
	}

	let synced = 0;
	let failed = 0;

	for (const item of pending) {
		try {
			const endpoint = getSyncEndpoint(item.type);
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item.payload),
			});

			if (response.ok) {
				clearPendingSyncItem(item.id);
				synced++;
			} else {
				failed++;
			}
		} catch (error) {
			console.error(`Failed to sync item ${item.id}:`, error);
			failed++;
		}
	}

	return { success: failed === 0, synced, failed };
}

function getSyncEndpoint(type: string): string {
	const endpoints: Record<string, string> = {
		quiz_answer: '/api/quiz/sync-offline',
		flashcard_review: '/api/flashcards/sync-offline',
		study_session: '/api/study-sessions/sync-offline',
	};
	return endpoints[type] || '/api/sync';
}

export function hasPendingSyncItems(): boolean {
	return getPendingSyncItems().length > 0;
}

export function getStorageStats(): { used: number; itemCount: number } {
	if (!isBrowser()) return { used: 0, itemCount: 0 };

	try {
		const keys = [PROGRESS_KEY, AI_CONVERSATIONS_KEY, PENDING_SYNC_KEY];

		let totalUsed = 0;
		let totalItems = 0;

		for (const key of keys) {
			const value = localStorage.getItem(key);
			if (value) {
				totalUsed += value.length;
				totalItems++;
			}
		}

		return { used: totalUsed, itemCount: totalItems };
	} catch {
		return { used: 0, itemCount: 0 };
	}
}

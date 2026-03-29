'use client';

export interface QuizAutoSaveData {
	quizId: string;
	currentQuestionIndex: number;
	selectedOption: string | null;
	answerText: string;
	isChecked: boolean;
	elapsedSeconds: number;
	mode: 'test' | 'practice';
	currentSubject: string;
	score: number;
	correctCount: number;
	incorrectCount: number;
	topicStats: Array<{ topic: string; correct: number; total: number }>;
	savedAt?: number;
	questionCount: number;
}

const STORAGE_KEY = 'quiz-auto-save';
const AUTO_SAVE_INTERVAL = 10000;

function safeLocalStorageSet(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'QuotaExceededError') {
			try {
				const keys = Object.keys(localStorage);
				const oldQuizKeys = keys.filter((k) => k.includes('quiz') || k.includes('temp'));
				for (const k of oldQuizKeys) {
					localStorage.removeItem(k);
				}

				localStorage.setItem(key, value);
				return true;
			} catch {
				try {
					sessionStorage.setItem(key, value);
					return true;
				} catch {
					console.warn('Storage unavailable, quiz state not saved');
					return false;
				}
			}
		}
		console.error('Failed to save quiz state:', error);
		return false;
	}
}

function safeLocalStorageGet(key: string): string | null {
	try {
		const value = localStorage.getItem(key);
		if (value) return value;

		return sessionStorage.getItem(key);
	} catch {
		return null;
	}
}

export function saveQuizState(data: QuizAutoSaveData): boolean {
	try {
		const serialized = JSON.stringify(data);
		return safeLocalStorageSet(STORAGE_KEY, serialized);
	} catch (error) {
		console.error('Failed to save quiz state:', error);
		return false;
	}
}

export function loadQuizState(): QuizAutoSaveData | null {
	try {
		const stored = safeLocalStorageGet(STORAGE_KEY);
		if (!stored) return null;
		return JSON.parse(stored) as QuizAutoSaveData;
	} catch (error) {
		console.error('Failed to load quiz state:', error);
		return null;
	}
}

export function clearSavedQuiz(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
		sessionStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error('Failed to clear saved quiz:', error);
	}
}

export function checkForRecovery(): QuizAutoSaveData | null {
	const saved = loadQuizState();
	if (!saved) return null;
	const saveTime = saved.savedAt ?? 0;
	const timeSinceSave = Date.now() - saveTime;
	if (timeSinceSave > 24 * 60 * 60 * 1000) {
		clearSavedQuiz();
		return null;
	}
	return saved;
}

export function startAutoSave(
	getState: () => Omit<QuizAutoSaveData, 'savedAt'>,
	onError?: () => void
): () => void {
	const interval = setInterval(() => {
		try {
			const state = getState();
			if (state.quizId) {
				const saved = saveQuizState(state);
				if (!saved) {
					onError?.();
				}
			}
		} catch (error) {
			console.error('Auto-save failed:', error);
			onError?.();
		}
	}, AUTO_SAVE_INTERVAL);
	return () => clearInterval(interval);
}

export function getTimeSinceLastSave(): number {
	const saved = loadQuizState();
	if (!saved) return 0;
	return Date.now() - (saved.savedAt ?? 0);
}

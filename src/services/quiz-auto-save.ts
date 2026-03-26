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
const AUTO_SAVE_INTERVAL = 30000;

export function saveQuizState(data: QuizAutoSaveData): void {
	try {
		const serialized = JSON.stringify(data);
		localStorage.setItem(STORAGE_KEY, serialized);
	} catch (error) {
		console.error('Failed to save quiz state:', error);
	}
}

export function loadQuizState(): QuizAutoSaveData | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
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
				saveQuizState(state);
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

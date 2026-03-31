'use client';

import { create } from 'zustand';
import type { QuizAutoSaveData } from '@/services/quiz-auto-save';
import {
	checkForRecovery,
	clearSavedQuiz,
	loadQuizState,
	saveQuizState,
} from '@/services/quiz-auto-save';

const QUIZ_SYNC_CHANNEL = typeof window !== 'undefined' ? new BroadcastChannel('quiz-sync') : null;

interface QuizAutoSaveState {
	savedQuizState: QuizAutoSaveData | null;
	lastSavedAt: number | null;
	showRecoveryDialog: boolean;
	recoveryAvailable: boolean;
	syncedFromTab: boolean;

	saveQuizState: (state: QuizAutoSaveData) => void;
	loadQuizState: () => QuizAutoSaveData | null;
	clearSavedQuiz: () => void;
	checkForRecovery: () => QuizAutoSaveData | null;
	dismissRecovery: () => void;
	confirmRecovery: () => void;
	broadcastState: (state: QuizAutoSaveData) => void;
	listenForSync: () => () => void;
}

export const useQuizAutoSaveStore = create<QuizAutoSaveState>((set, get) => ({
	savedQuizState: null,
	lastSavedAt: null,
	showRecoveryDialog: false,
	recoveryAvailable: false,
	syncedFromTab: false,

	saveQuizState: (state: QuizAutoSaveData) => {
		const stateToSave = {
			...state,
			savedAt: Date.now(),
		};
		saveQuizState(stateToSave);
		set({ savedQuizState: stateToSave, lastSavedAt: Date.now() });
		get().broadcastState(stateToSave);
	},

	loadQuizState: () => {
		const loaded = loadQuizState();
		if (loaded) {
			set({ savedQuizState: loaded, lastSavedAt: loaded.savedAt });
		}
		return loaded;
	},

	clearSavedQuiz: () => {
		clearSavedQuiz();
		set({ savedQuizState: null, lastSavedAt: null, showRecoveryDialog: false });
	},

	checkForRecovery: () => {
		const recovered = checkForRecovery();
		if (recovered) {
			set({
				savedQuizState: recovered,
				recoveryAvailable: true,
				showRecoveryDialog: true,
			});
		}
		return recovered;
	},

	dismissRecovery: () => {
		clearSavedQuiz();
		set({ showRecoveryDialog: false, recoveryAvailable: false, savedQuizState: null });
	},

	confirmRecovery: () => {
		set({ showRecoveryDialog: false });
	},

	broadcastState: (state: QuizAutoSaveData) => {
		if (QUIZ_SYNC_CHANNEL) {
			QUIZ_SYNC_CHANNEL.postMessage({
				type: 'quiz-state-update',
				payload: state,
				timestamp: Date.now(),
			});
		}
	},

	listenForSync: () => {
		if (!QUIZ_SYNC_CHANNEL) return () => {};

		const handler = (event: MessageEvent) => {
			if (event.data.type === 'quiz-state-update') {
				const current = get().savedQuizState;
				if (!current || event.data.timestamp > (current.savedAt ?? 0)) {
					set({
						savedQuizState: event.data.payload,
						syncedFromTab: true,
					});
				}
			}
		};

		QUIZ_SYNC_CHANNEL.addEventListener('message', handler);
		return () => QUIZ_SYNC_CHANNEL.removeEventListener('message', handler);
	},
}));

export function useQuizAutoSave() {
	const store = useQuizAutoSaveStore();
	return {
		savedQuizState: store.savedQuizState,
		lastSavedAt: store.lastSavedAt,
		showRecoveryDialog: store.showRecoveryDialog,
		recoveryAvailable: store.recoveryAvailable,
		syncedFromTab: store.syncedFromTab,
		saveQuizState: store.saveQuizState,
		loadQuizState: store.loadQuizState,
		clearSavedQuiz: store.clearSavedQuiz,
		checkForRecovery: store.checkForRecovery,
		dismissRecovery: store.dismissRecovery,
		confirmRecovery: store.confirmRecovery,
		listenForSync: store.listenForSync,
	};
}

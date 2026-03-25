'use client';

import { create } from 'zustand';
import type { QuizAutoSaveData } from '@/services/quiz-auto-save';
import {
	checkForRecovery,
	clearSavedQuiz,
	loadQuizState,
	saveQuizState,
} from '@/services/quiz-auto-save';

interface QuizAutoSaveState {
	savedQuizState: QuizAutoSaveData | null;
	lastSavedAt: number | null;
	showRecoveryDialog: boolean;
	recoveryAvailable: boolean;

	saveQuizState: (state: QuizAutoSaveData) => void;
	loadQuizState: () => QuizAutoSaveData | null;
	clearSavedQuiz: () => void;
	checkForRecovery: () => QuizAutoSaveData | null;
	dismissRecovery: () => void;
	confirmRecovery: () => void;
}

export const useQuizAutoSaveStore = create<QuizAutoSaveState>((set, _get) => ({
	savedQuizState: null,
	lastSavedAt: null,
	showRecoveryDialog: false,
	recoveryAvailable: false,

	saveQuizState: (state: QuizAutoSaveData) => {
		const stateToSave = {
			...state,
			savedAt: Date.now(),
		};
		saveQuizState(stateToSave);
		set({ savedQuizState: stateToSave, lastSavedAt: Date.now() });
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
}));

export function useQuizAutoSave() {
	const store = useQuizAutoSaveStore();
	return {
		savedQuizState: store.savedQuizState,
		lastSavedAt: store.lastSavedAt,
		showRecoveryDialog: store.showRecoveryDialog,
		recoveryAvailable: store.recoveryAvailable,
		saveQuizState: store.saveQuizState,
		loadQuizState: store.loadQuizState,
		clearSavedQuiz: store.clearSavedQuiz,
		checkForRecovery: store.checkForRecovery,
		dismissRecovery: store.dismissRecovery,
		confirmRecovery: store.confirmRecovery,
	};
}

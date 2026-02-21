import { create } from 'zustand';
import type { QuizResult } from '@/types/quiz';

interface QuizResultState {
	currentResult: QuizResult | null;
	save: (result: QuizResult) => void;
	get: () => QuizResult | null;
	clear: () => void;
	has: () => boolean;
}

export const useQuizResultStore = create<QuizResultState>((set, get) => ({
	currentResult: null,

	save: (result: QuizResult) => {
		set({ currentResult: result });
	},

	get: () => {
		return get().currentResult;
	},

	clear: () => {
		set({ currentResult: null });
	},

	has: () => {
		return get().currentResult !== null;
	},
}));

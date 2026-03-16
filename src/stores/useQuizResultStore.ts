import { create } from 'zustand';
import type { QuizResult } from '@/types/quiz';

interface Mistake {
	topic: string;
	questionId: string;
	subject: string;
}

interface QuizResultState {
	currentResult: QuizResult | null;
	lastMistakes: Mistake[];
	save: (result: QuizResult) => void;
	get: () => QuizResult | null;
	getLastMistakes: () => Mistake[];
	setLastMistakes: (mistakes: Mistake[]) => void;
	addMistake: (mistake: Mistake) => void;
	clear: () => void;
	has: () => boolean;
}

export const useQuizResultStore = create<QuizResultState>((set, get) => ({
	currentResult: null,
	lastMistakes: [],

	save: (result: QuizResult) => {
		set({ currentResult: result });
	},

	get: () => {
		return get().currentResult;
	},

	getLastMistakes: () => {
		return get().lastMistakes;
	},

	setLastMistakes: (mistakes: Mistake[]) => {
		set({ lastMistakes: mistakes.slice(0, 10) });
	},

	addMistake: (mistake: Mistake) => {
		const current = get().lastMistakes;
		const updated = [mistake, ...current].slice(0, 10);
		set({ lastMistakes: updated });
	},

	clear: () => {
		set({ currentResult: null, lastMistakes: [] });
	},

	has: () => {
		return get().currentResult !== null;
	},
}));

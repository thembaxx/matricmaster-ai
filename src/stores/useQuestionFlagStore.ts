'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuestionFlagStore {
	flaggedQuestions: Map<string, string[]>;
	toggleFlag: (quizId: string, questionId: string) => void;
	clearFlags: (quizId: string) => void;
	getFlaggedQuestions: (quizId: string) => string[];
	isFlagged: (quizId: string, questionId: string) => boolean;
	getFlaggedCount: (quizId: string) => number;
}

export const useQuestionFlagStore = create<QuestionFlagStore>()(
	persist(
		(set, get) => ({
			flaggedQuestions: new Map(),

			toggleFlag: (quizId: string, questionId: string) => {
				set((state) => {
					const newMap = new Map(state.flaggedQuestions);
					const currentFlags = newMap.get(quizId) || [];
					const index = currentFlags.indexOf(questionId);

					if (index > -1) {
						const updatedFlags = currentFlags.filter((id) => id !== questionId);
						if (updatedFlags.length === 0) {
							newMap.delete(quizId);
						} else {
							newMap.set(quizId, updatedFlags);
						}
					} else {
						newMap.set(quizId, [...currentFlags, questionId]);
					}

					return { flaggedQuestions: newMap };
				});
			},

			clearFlags: (quizId: string) => {
				set((state) => {
					const newMap = new Map(state.flaggedQuestions);
					newMap.delete(quizId);
					return { flaggedQuestions: newMap };
				});
			},

			getFlaggedQuestions: (quizId: string) => {
				return get().flaggedQuestions.get(quizId) || [];
			},

			isFlagged: (quizId: string, questionId: string) => {
				const flags = get().flaggedQuestions.get(quizId) || [];
				return flags.includes(questionId);
			},

			getFlaggedCount: (quizId: string) => {
				return (get().flaggedQuestions.get(quizId) || []).length;
			},
		}),
		{
			name: 'quiz-flags-storage',
		}
	)
);

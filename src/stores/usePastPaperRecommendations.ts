'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DifficultyLevel } from '@/services/adaptive-difficulty';

export interface WeakArea {
	topic: string;
	subject: string;
	mistakeCount: number;
	lastMistakeDate: string;
	priorityScore: number;
}

export interface PastPaperRecommendation {
	paperId: string;
	subject: string;
	year: number;
	month: string;
	paper: string;
	coveredTopics: string[];
	matchingWeakAreas: WeakArea[];
	priorityScore: number;
	reason: string;
}

interface PastPaperRecommendationState {
	weakAreas: WeakArea[];
	recommendations: PastPaperRecommendation[];
	lastUpdated: string | null;
	showOnlyRecommended: boolean;

	addWeakAreas: (mistakes: Array<{ topic: string; subject: string }>) => void;
	calculatePriorities: (difficulty: DifficultyLevel) => void;
	setRecommendations: (recs: PastPaperRecommendation[]) => void;
	clearRecommendations: () => void;
	toggleShowOnlyRecommended: () => void;
	getWeakAreasForSubject: (subject: string) => WeakArea[];
	getRecommendationsForSubject: (subject: string) => PastPaperRecommendation[];
	refreshAfterQuiz: (
		mistakes: Array<{ topic: string; subject: string }>,
		difficulty: DifficultyLevel
	) => void;
}

const calculatePriorityScore = (
	mistakeCount: number,
	lastMistakeDate: string,
	difficulty: DifficultyLevel
): number => {
	const now = new Date();
	const lastMistake = new Date(lastMistakeDate);
	const daysSinceMistake = Math.floor(
		(now.getTime() - lastMistake.getTime()) / (1000 * 60 * 60 * 24)
	);

	const difficultyWeight: Record<DifficultyLevel, number> = {
		beginner: 1.2,
		easy: 1.1,
		medium: 1.0,
		hard: 0.9,
		expert: 0.8,
	};

	const frequencyScore = mistakeCount * 10;
	const recencyScore = Math.max(0, 10 - daysSinceMistake);
	const difficultyScore = difficultyWeight[difficulty];

	return frequencyScore * recencyScore * difficultyScore;
};

export const usePastPaperRecommendationsStore = create<PastPaperRecommendationState>()(
	persist(
		(set, get) => ({
			weakAreas: [],
			recommendations: [],
			lastUpdated: null,
			showOnlyRecommended: false,

			addWeakAreas: (mistakes) => {
				const existing = get().weakAreas;
				const now = new Date().toISOString();

				const newWeakAreas = [...existing];

				mistakes.forEach((mistake) => {
					const existingIndex = newWeakAreas.findIndex(
						(w) => w.topic === mistake.topic && w.subject === mistake.subject
					);

					if (existingIndex >= 0) {
						newWeakAreas[existingIndex] = {
							...newWeakAreas[existingIndex],
							mistakeCount: newWeakAreas[existingIndex].mistakeCount + 1,
							lastMistakeDate: now,
						};
					} else {
						newWeakAreas.push({
							topic: mistake.topic,
							subject: mistake.subject,
							mistakeCount: 1,
							lastMistakeDate: now,
							priorityScore: 0,
						});
					}
				});

				set({ weakAreas: newWeakAreas });
			},

			calculatePriorities: (difficulty) => {
				const weakAreas = get().weakAreas;
				const updated = weakAreas.map((area) => ({
					...area,
					priorityScore: calculatePriorityScore(
						area.mistakeCount,
						area.lastMistakeDate,
						difficulty
					),
				}));

				updated.sort((a, b) => b.priorityScore - a.priorityScore);
				set({ weakAreas: updated, lastUpdated: new Date().toISOString() });
			},

			setRecommendations: (recs) => {
				set({ recommendations: recs, lastUpdated: new Date().toISOString() });
			},

			clearRecommendations: () => {
				set({ recommendations: [], weakAreas: [] });
			},

			toggleShowOnlyRecommended: () => {
				set((state) => ({ showOnlyRecommended: !state.showOnlyRecommended }));
			},

			getWeakAreasForSubject: (subject) => {
				return get().weakAreas.filter((w) => w.subject === subject);
			},

			getRecommendationsForSubject: (subject) => {
				return get().recommendations.filter((r) => r.subject === subject);
			},

			refreshAfterQuiz: (mistakes, difficulty) => {
				get().addWeakAreas(mistakes);
				get().calculatePriorities(difficulty);
			},
		}),
		{
			name: 'past-paper-recommendations-storage',
			partialize: (state) => ({
				weakAreas: state.weakAreas,
				recommendations: state.recommendations,
				lastUpdated: state.lastUpdated,
			}),
		}
	)
);

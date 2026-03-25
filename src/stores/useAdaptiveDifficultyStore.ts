'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DifficultyLevel } from '@/services/adaptive-difficulty';
import {
	type AnalyzeResult,
	analyzePerformance,
	type DifficultyMetrics,
	getPerformanceStats,
} from '@/services/adaptive-difficulty';

interface PerformanceHistory {
	correct: number;
	incorrect: number;
	streakCorrect: number;
	streakIncorrect: number;
}

interface AdaptiveDifficultyState {
	currentDifficulty: DifficultyLevel;
	performanceHistory: Record<DifficultyLevel, PerformanceHistory>;
	consecutiveCorrect: number;
	consecutiveIncorrect: number;
	totalQuestionsAnswered: number;

	adjustDifficulty: (isCorrect: boolean) => AnalyzeResult;
	getRecommendedDifficulty: () => DifficultyLevel;
	resetMetrics: () => void;
	getCurrentMetrics: () => DifficultyMetrics;
	getPerformanceForLevel: (level: DifficultyLevel) => DifficultyMetrics;
	getStats: () => ReturnType<typeof getPerformanceStats>;
	setDifficulty: (level: DifficultyLevel) => void;
}

const initialPerformanceHistory: Record<DifficultyLevel, PerformanceHistory> = {
	beginner: { correct: 0, incorrect: 0, streakCorrect: 0, streakIncorrect: 0 },
	easy: { correct: 0, incorrect: 0, streakCorrect: 0, streakIncorrect: 0 },
	medium: { correct: 0, incorrect: 0, streakCorrect: 0, streakIncorrect: 0 },
	hard: { correct: 0, incorrect: 0, streakCorrect: 0, streakIncorrect: 0 },
	expert: { correct: 0, incorrect: 0, streakCorrect: 0, streakIncorrect: 0 },
};

export const useAdaptiveDifficultyStore = create<AdaptiveDifficultyState>()(
	persist(
		(set, get) => ({
			currentDifficulty: 'medium',
			performanceHistory: initialPerformanceHistory,
			consecutiveCorrect: 0,
			consecutiveIncorrect: 0,
			totalQuestionsAnswered: 0,

			adjustDifficulty: (isCorrect: boolean) => {
				const state = get();
				const { currentDifficulty, performanceHistory } = state;
				const currentMetrics = performanceHistory[currentDifficulty];

				const newConsecutiveCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0;
				const newConsecutiveIncorrect = !isCorrect ? state.consecutiveIncorrect + 1 : 0;

				const updatedMetrics: PerformanceHistory = {
					correct: currentMetrics.correct + (isCorrect ? 1 : 0),
					incorrect: currentMetrics.incorrect + (isCorrect ? 0 : 1),
					streakCorrect: newConsecutiveCorrect,
					streakIncorrect: newConsecutiveIncorrect,
				};

				const newHistory = {
					...performanceHistory,
					[currentDifficulty]: updatedMetrics,
				};

				const analysis = analyzePerformance(currentDifficulty, {
					correct: updatedMetrics.correct,
					incorrect: updatedMetrics.incorrect,
					streakCorrect: updatedMetrics.streakCorrect,
					streakIncorrect: updatedMetrics.streakIncorrect,
				});

				set({
					consecutiveCorrect: newConsecutiveCorrect,
					consecutiveIncorrect: newConsecutiveIncorrect,
					performanceHistory: newHistory,
					totalQuestionsAnswered: state.totalQuestionsAnswered + 1,
					currentDifficulty: analysis.newDifficulty,
				});

				return analysis;
			},

			getRecommendedDifficulty: () => {
				const { performanceHistory } = get();
				let bestLevel: DifficultyLevel = 'beginner';
				let bestAccuracy = 0;

				(Object.keys(performanceHistory) as DifficultyLevel[]).forEach((level) => {
					const metrics = performanceHistory[level];
					const total = metrics.correct + metrics.incorrect;
					if (total > 0) {
						const accuracy = metrics.correct / total;
						if (accuracy > bestAccuracy && accuracy >= 0.6) {
							bestAccuracy = accuracy;
							bestLevel = level;
						}
					}
				});

				const totalAnswered = get().totalQuestionsAnswered;
				if (totalAnswered < 5) {
					return 'medium';
				}

				return bestLevel;
			},

			resetMetrics: () => {
				set({
					performanceHistory: initialPerformanceHistory,
					consecutiveCorrect: 0,
					consecutiveIncorrect: 0,
					totalQuestionsAnswered: 0,
					currentDifficulty: 'medium',
				});
			},

			getCurrentMetrics: () => {
				const { currentDifficulty, performanceHistory } = get();
				const metrics = performanceHistory[currentDifficulty];
				return {
					correct: metrics.correct,
					incorrect: metrics.incorrect,
					streakCorrect: metrics.streakCorrect,
					streakIncorrect: metrics.streakIncorrect,
				};
			},

			getPerformanceForLevel: (level: DifficultyLevel) => {
				const { performanceHistory } = get();
				return performanceHistory[level];
			},

			getStats: () => {
				const metrics = get().getCurrentMetrics();
				return getPerformanceStats(metrics);
			},

			setDifficulty: (level: DifficultyLevel) => {
				set({ currentDifficulty: level });
			},
		}),
		{
			name: 'adaptive-difficulty-storage',
			partialize: (state) => ({
				currentDifficulty: state.currentDifficulty,
				performanceHistory: state.performanceHistory,
				totalQuestionsAnswered: state.totalQuestionsAnswered,
			}),
		}
	)
);

export function useAdaptiveDifficulty() {
	const store = useAdaptiveDifficultyStore();
	return {
		currentDifficulty: store.currentDifficulty,
		adjustDifficulty: store.adjustDifficulty,
		getRecommendedDifficulty: store.getRecommendedDifficulty,
		resetMetrics: store.resetMetrics,
		getCurrentMetrics: store.getCurrentMetrics,
		getPerformanceForLevel: store.getPerformanceForLevel,
		getStats: store.getStats,
		setDifficulty: store.setDifficulty,
		consecutiveCorrect: store.consecutiveCorrect,
		consecutiveIncorrect: store.consecutiveIncorrect,
		totalQuestionsAnswered: store.totalQuestionsAnswered,
	};
}

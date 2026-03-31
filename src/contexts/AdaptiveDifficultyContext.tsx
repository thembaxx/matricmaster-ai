'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { DifficultyLevel, DifficultyMetrics } from '@/services/adaptive-difficulty';
import {
	getDifficultyBgColor,
	getDifficultyColor,
	getDifficultyLabel,
} from '@/services/adaptive-difficulty';
import { useAdaptiveDifficultyStore } from '@/stores/useAdaptiveDifficultyStore';

interface AdaptiveDifficultyContextType {
	currentDifficulty: DifficultyLevel;
	adjustDifficulty: (isCorrect: boolean) => {
		newDifficulty: DifficultyLevel;
		recommendation: string;
	};
	getRecommendedDifficulty: () => DifficultyLevel;
	resetMetrics: () => void;
	getCurrentMetrics: () => DifficultyMetrics;
	getPerformanceForLevel: (level: DifficultyLevel) => DifficultyMetrics;
	getStats: () => {
		accuracy: number;
		totalAnswered: number;
		isStreaking: boolean;
		streakType: 'correct' | 'incorrect' | 'none';
		streakCount: number;
	};
	setDifficulty: (level: DifficultyLevel) => void;
	consecutiveCorrect: number;
	consecutiveIncorrect: number;
	totalQuestionsAnswered: number;
	isLoading: boolean;
	getDifficultyLabel: (level: DifficultyLevel) => string;
	getDifficultyColor: (level: DifficultyLevel) => string;
	getDifficultyBgColor: (level: DifficultyLevel) => string;
}

const AdaptiveDifficultyContext = createContext<AdaptiveDifficultyContextType | undefined>(
	undefined
);

export function AdaptiveDifficultyProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);

	const store = useAdaptiveDifficultyStore();

	useEffect(() => {
		const init = async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
			setIsLoading(false);
		};
		init();
	}, []);

	const value: AdaptiveDifficultyContextType = {
		currentDifficulty: store.currentDifficulty,
		adjustDifficulty: (isCorrect: boolean) => {
			const result = store.adjustDifficulty(isCorrect);
			return {
				newDifficulty: result.newDifficulty,
				recommendation: result.recommendation,
			};
		},
		getRecommendedDifficulty: store.getRecommendedDifficulty,
		resetMetrics: store.resetMetrics,
		getCurrentMetrics: store.getCurrentMetrics,
		getPerformanceForLevel: store.getPerformanceForLevel,
		getStats: store.getStats,
		setDifficulty: store.setDifficulty,
		consecutiveCorrect: store.consecutiveCorrect,
		consecutiveIncorrect: store.consecutiveIncorrect,
		totalQuestionsAnswered: store.totalQuestionsAnswered,
		isLoading,
		getDifficultyLabel,
		getDifficultyColor,
		getDifficultyBgColor,
	};

	return (
		<AdaptiveDifficultyContext.Provider value={value}>
			{children}
		</AdaptiveDifficultyContext.Provider>
	);
}

export function useAdaptiveDifficultyContext() {
	const context = useContext(AdaptiveDifficultyContext);
	if (context === undefined) {
		throw new Error(
			'useAdaptiveDifficultyContext must be used within an AdaptiveDifficultyProvider'
		);
	}
	return context;
}

'use client';

import { useCallback, useMemo } from 'react';
import type { DifficultyLevel } from '@/services/adaptive-difficulty';
import { DIFFICULTY_ORDER } from '@/services/adaptive-difficulty';
import { useAdaptiveDifficulty } from '@/stores/useAdaptiveDifficultyStore';

export interface PastPaperDifficultyConfig {
	filterByDifficulty: boolean;
	includeHarderThanRecommended: boolean;
	includeEasierThanRecommended: boolean;
}

const DEFAULT_CONFIG: PastPaperDifficultyConfig = {
	filterByDifficulty: false,
	includeHarderThanRecommended: true,
	includeEasierThanRecommended: true,
};

export function usePastPaperDifficulty(config: PastPaperDifficultyConfig = DEFAULT_CONFIG) {
	const { currentDifficulty, getRecommendedDifficulty, getPerformanceForLevel, adjustDifficulty } =
		useAdaptiveDifficulty();

	const difficultyLevels = useMemo(() => DIFFICULTY_ORDER, []);

	const recommendedDifficulty = useMemo(
		() => getRecommendedDifficulty(),
		[getRecommendedDifficulty]
	);

	const getDifficultyBounds = useCallback(() => {
		const recommendedIndex = difficultyLevels.indexOf(recommendedDifficulty);
		const currentIndex = difficultyLevels.indexOf(currentDifficulty);

		return {
			minIndex: Math.max(0, Math.min(recommendedIndex, currentIndex)),
			maxIndex: Math.min(difficultyLevels.length - 1, Math.max(recommendedIndex, currentIndex)),
			recommendedIndex,
			currentIndex,
		};
	}, [recommendedDifficulty, currentDifficulty, difficultyLevels]);

	const shouldIncludePaper = useCallback(
		(paperDifficulty: DifficultyLevel) => {
			if (!config.filterByDifficulty) return true;

			const paperIndex = difficultyLevels.indexOf(paperDifficulty);
			const currentIndex = difficultyLevels.indexOf(currentDifficulty);
			const { minIndex, maxIndex } = getDifficultyBounds();

			const inRange = paperIndex >= minIndex && paperIndex <= maxIndex;

			if (config.includeHarderThanRecommended && config.includeEasierThanRecommended) {
				return inRange;
			}

			if (!config.includeHarderThanRecommended && !config.includeEasierThanRecommended) {
				return paperIndex === currentIndex;
			}

			if (!config.includeHarderThanRecommended) {
				const bounds = getDifficultyBounds();
				return paperIndex <= bounds.currentIndex && inRange;
			}

			if (!config.includeEasierThanRecommended) {
				const bounds = getDifficultyBounds();
				return paperIndex >= bounds.minIndex && inRange;
			}

			return inRange;
		},
		[config, difficultyLevels, getDifficultyBounds, currentDifficulty]
	);

	const getDifficultySuggestions = useCallback(
		(practiceMode: 'exam' | 'practice') => {
			if (practiceMode === 'exam') {
				return {
					suggestedDifficulty: currentDifficulty,
					message: `Based on your performance, we recommend ${currentDifficulty} difficulty for exam practice.`,
				};
			}

			return {
				suggestedDifficulty: recommendedDifficulty,
				message: `For practice mode, we suggest ${recommendedDifficulty} to build confidence before tackling harder questions.`,
			};
		},
		[currentDifficulty, recommendedDifficulty]
	);

	const adjustDifficultyForPerformance = useCallback(
		(isCorrect: boolean) => {
			return adjustDifficulty(isCorrect);
		},
		[adjustDifficulty]
	);

	const getPerformanceAtLevel = useCallback(
		(level: DifficultyLevel) => {
			return getPerformanceForLevel(level);
		},
		[getPerformanceForLevel]
	);

	const getDifficultyProgress = useMemo(() => {
		const currentIndex = difficultyLevels.indexOf(currentDifficulty);
		const totalLevels = difficultyLevels.length;
		const progress = ((currentIndex + 1) / totalLevels) * 100;

		return {
			currentLevel: currentDifficulty,
			levelIndex: currentIndex,
			totalLevels,
			progress,
			nextLevel: currentIndex < totalLevels - 1 ? difficultyLevels[currentIndex + 1] : null,
			previousLevel: currentIndex > 0 ? difficultyLevels[currentIndex - 1] : null,
		};
	}, [currentDifficulty, difficultyLevels]);

	return {
		currentDifficulty,
		recommendedDifficulty,
		shouldIncludePaper,
		getDifficultySuggestions,
		adjustDifficultyForPerformance,
		getPerformanceAtLevel,
		getDifficultyProgress,
		difficultyLevels,
	};
}

'use client';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyMetrics {
	correct: number;
	incorrect: number;
	streakCorrect: number;
	streakIncorrect: number;
}

export interface AdaptiveDifficultyConfig {
	correctToIncrease: number;
	incorrectToDecrease: number;
	minCorrectForIncrease: number;
	minIncorrectForDecrease: number;
}

export const DIFFICULTY_ORDER: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, AdaptiveDifficultyConfig> = {
	beginner: {
		correctToIncrease: 3,
		incorrectToDecrease: 0,
		minCorrectForIncrease: 3,
		minIncorrectForDecrease: 0,
	},
	easy: {
		correctToIncrease: 3,
		incorrectToDecrease: 3,
		minCorrectForIncrease: 3,
		minIncorrectForDecrease: 3,
	},
	medium: {
		correctToIncrease: 3,
		incorrectToDecrease: 3,
		minCorrectForIncrease: 3,
		minIncorrectForDecrease: 3,
	},
	hard: {
		correctToIncrease: 3,
		incorrectToDecrease: 3,
		minCorrectForIncrease: 3,
		minIncorrectForDecrease: 3,
	},
	expert: {
		correctToIncrease: 0,
		incorrectToDecrease: 3,
		minCorrectForIncrease: 0,
		minIncorrectForDecrease: 3,
	},
};

export function getDifficultyIndex(level: DifficultyLevel): number {
	return DIFFICULTY_ORDER.indexOf(level);
}

export function getDifficultyByIndex(index: number): DifficultyLevel {
	return DIFFICULTY_ORDER[Math.min(Math.max(index, 0), DIFFICULTY_ORDER.length - 1)];
}

export function getNextDifficulty(current: DifficultyLevel): DifficultyLevel | null {
	const currentIndex = getDifficultyIndex(current);
	if (currentIndex >= DIFFICULTY_ORDER.length - 1) {
		return null;
	}
	return getDifficultyByIndex(currentIndex + 1);
}

export function getPreviousDifficulty(current: DifficultyLevel): DifficultyLevel | null {
	const currentIndex = getDifficultyIndex(current);
	if (currentIndex <= 0) {
		return null;
	}
	return getDifficultyByIndex(currentIndex - 1);
}

export function getDifficultyLabel(level: DifficultyLevel): string {
	const labels: Record<DifficultyLevel, string> = {
		beginner: 'Beginner',
		easy: 'Easy',
		medium: 'Medium',
		hard: 'Hard',
		expert: 'Expert',
	};
	return labels[level];
}

export function getDifficultyColor(level: DifficultyLevel): string {
	const colors: Record<DifficultyLevel, string> = {
		beginner: 'text-green-500',
		easy: 'text-emerald-500',
		medium: 'text-yellow-500',
		hard: 'text-orange-500',
		expert: 'text-red-500',
	};
	return colors[level];
}

export function getDifficultyBgColor(level: DifficultyLevel): string {
	const colors: Record<DifficultyLevel, string> = {
		beginner: 'bg-green-500/20',
		easy: 'bg-emerald-500/20',
		medium: 'bg-yellow-500/20',
		hard: 'bg-orange-500/20',
		expert: 'bg-red-500/20',
	};
	return colors[level];
}

export interface AnalyzeResult {
	shouldIncrease: boolean;
	shouldDecrease: boolean;
	newDifficulty: DifficultyLevel;
	recommendation: string;
}

export function analyzePerformance(
	currentLevel: DifficultyLevel,
	metrics: DifficultyMetrics
): AnalyzeResult {
	const config = DIFFICULTY_CONFIG[currentLevel];
	const { streakCorrect, streakIncorrect } = metrics;

	const shouldIncrease = streakCorrect >= config.minCorrectForIncrease && currentLevel !== 'expert';

	const shouldDecrease =
		streakIncorrect >= config.minIncorrectForDecrease && currentLevel !== 'beginner';

	let newDifficulty = currentLevel;
	let recommendation = 'Maintain current difficulty level';

	if (shouldIncrease && !shouldDecrease) {
		const next = getNextDifficulty(currentLevel);
		if (next) {
			newDifficulty = next;
			recommendation = `Great performance! Increasing to ${getDifficultyLabel(next)}`;
		}
	} else if (shouldDecrease && !shouldIncrease) {
		const prev = getPreviousDifficulty(currentLevel);
		if (prev) {
			newDifficulty = prev;
			recommendation = `Struggling a bit. Decreasing to ${getDifficultyLabel(prev)}`;
		}
	} else if (streakCorrect >= 2 && !shouldIncrease && currentLevel !== 'expert') {
		recommendation = 'Almost ready to increase difficulty!';
	} else if (streakIncorrect >= 2 && !shouldDecrease && currentLevel !== 'beginner') {
		recommendation = 'Keep going, you can do it!';
	}

	return {
		shouldIncrease,
		shouldDecrease,
		newDifficulty,
		recommendation,
	};
}

export function getOverallAccuracy(metrics: DifficultyMetrics): number {
	const total = metrics.correct + metrics.incorrect;
	if (total === 0) return 0;
	return Math.round((metrics.correct / total) * 100);
}

export function getPerformanceStats(metrics: DifficultyMetrics): {
	accuracy: number;
	totalAnswered: number;
	isStreaking: boolean;
	streakType: 'correct' | 'incorrect' | 'none';
	streakCount: number;
} {
	const accuracy = getOverallAccuracy(metrics);
	const totalAnswered = metrics.correct + metrics.incorrect;
	const isStreaking = metrics.streakCorrect >= 2 || metrics.streakIncorrect >= 2;
	const streakType =
		metrics.streakCorrect >= metrics.streakIncorrect
			? metrics.streakCorrect > 0
				? 'correct'
				: 'none'
			: metrics.streakIncorrect > 0
				? 'incorrect'
				: 'none';
	const streakCount = Math.max(metrics.streakCorrect, metrics.streakIncorrect);

	return {
		accuracy,
		totalAnswered,
		isStreaking,
		streakType,
		streakCount,
	};
}

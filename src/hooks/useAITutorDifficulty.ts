'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DifficultyLevel } from '@/services/adaptive-difficulty';
import { useAdaptiveDifficulty } from '@/stores/useAdaptiveDifficultyStore';

export type ExplanationComplexity = 'simple' | 'moderate' | 'detailed' | 'expert';

export interface AITutorDifficultyConfig {
	complexityPreference: ExplanationComplexity;
	autoAdjust: boolean;
	showComplexityToggle: boolean;
}

const STORAGE_KEY = 'ai-tutor-explanation-complexity';

const COMPLEXITY_ORDER: ExplanationComplexity[] = ['simple', 'moderate', 'detailed', 'expert'];

const DIFFICULTY_TO_COMPLEXITY_MAP: Record<DifficultyLevel, ExplanationComplexity> = {
	beginner: 'simple',
	easy: 'simple',
	medium: 'moderate',
	hard: 'detailed',
	expert: 'expert',
};

const COMPLEXITY_LABELS: Record<ExplanationComplexity, string> = {
	simple: 'Simple',
	moderate: 'Moderate',
	detailed: 'Detailed',
	expert: 'Expert',
};

const COMPLEXITY_DESCRIPTIONS: Record<ExplanationComplexity, string> = {
	simple: 'Basic explanations with everyday examples',
	moderate: 'Balanced explanations with some technical detail',
	detailed: 'In-depth explanations with full technical coverage',
	expert: 'Comprehensive explanations with advanced concepts',
};

export function useAITutorDifficulty() {
	const { currentDifficulty, adjustDifficulty, getStats } = useAdaptiveDifficulty();

	const [complexityPreference, setComplexityPreferenceState] =
		useState<ExplanationComplexity>('moderate');
	const [autoAdjust, setAutoAdjust] = useState(true);
	const [showComplexityToggle, setShowComplexityToggle] = useState(true);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (COMPLEXITY_ORDER.includes(parsed.complexityPreference)) {
					setComplexityPreferenceState(parsed.complexityPreference);
				}
				if (typeof parsed.autoAdjust === 'boolean') {
					setAutoAdjust(parsed.autoAdjust);
				}
			}
		} catch {
			// Ignore read errors
		}
	}, []);

	const setComplexityPreference = useCallback(
		(complexity: ExplanationComplexity) => {
			setComplexityPreferenceState(complexity);
			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({ complexityPreference: complexity, autoAdjust })
				);
			} catch {
				// Ignore write errors
			}
		},
		[autoAdjust]
	);

	const toggleAutoAdjust = useCallback(() => {
		setAutoAdjust((prev) => {
			const newValue = !prev;
			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({ complexityPreference, autoAdjust: newValue })
				);
			} catch {
				// Ignore write errors
			}
			return newValue;
		});
	}, [complexityPreference]);

	const effectiveComplexity = useMemo(() => {
		if (autoAdjust) {
			return DIFFICULTY_TO_COMPLEXITY_MAP[currentDifficulty];
		}
		return complexityPreference;
	}, [autoAdjust, currentDifficulty, complexityPreference]);

	const getComplexityForDifficulty = useCallback((difficulty: DifficultyLevel) => {
		return DIFFICULTY_TO_COMPLEXITY_MAP[difficulty];
	}, []);

	const shouldOfferSimplerExplanation = useCallback(() => {
		const stats = getStats();
		return stats.accuracy < 60 && stats.totalAnswered > 5;
	}, [getStats]);

	const shouldOfferAdvancedExplanation = useCallback(() => {
		const stats = getStats();
		return stats.accuracy >= 80 && stats.totalAnswered > 10;
	}, [getStats]);

	const getExplanationPromptModifier = useCallback(() => {
		switch (effectiveComplexity) {
			case 'simple':
				return 'Explain in very simple terms with everyday examples. Avoid technical jargon.';
			case 'moderate':
				return 'Provide a balanced explanation with some technical detail but keep it accessible.';
			case 'detailed':
				return 'Provide a thorough explanation with full technical details and edge cases.';
			case 'expert':
				return 'Provide a comprehensive expert-level explanation with advanced concepts and nuances.';
			default:
				return '';
		}
	}, [effectiveComplexity]);

	const getComplexityLabel = useCallback(
		(complexity?: ExplanationComplexity) => {
			const c = complexity ?? effectiveComplexity;
			return COMPLEXITY_LABELS[c];
		},
		[effectiveComplexity]
	);

	const getComplexityDescription = useCallback(
		(complexity?: ExplanationComplexity) => {
			const c = complexity ?? effectiveComplexity;
			return COMPLEXITY_DESCRIPTIONS[c];
		},
		[effectiveComplexity]
	);

	const availableComplexities = useMemo(() => {
		return COMPLEXITY_ORDER.map((complexity) => ({
			value: complexity,
			label: COMPLEXITY_LABELS[complexity],
			description: COMPLEXITY_DESCRIPTIONS[complexity],
		}));
	}, []);

	const trackAnswer = useCallback(
		(isCorrect: boolean) => {
			return adjustDifficulty(isCorrect);
		},
		[adjustDifficulty]
	);

	return {
		complexityPreference,
		setComplexityPreference,
		autoAdjust,
		toggleAutoAdjust,
		effectiveComplexity,
		currentDifficulty,
		showComplexityToggle,
		setShowComplexityToggle,
		getComplexityForDifficulty,
		shouldOfferSimplerExplanation,
		shouldOfferAdvancedExplanation,
		getExplanationPromptModifier,
		getComplexityLabel,
		getComplexityDescription,
		availableComplexities,
		trackAnswer,
	};
}

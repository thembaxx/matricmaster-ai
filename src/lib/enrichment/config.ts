// ============================================================================
// ENRICHMENT CONFIGURATION TYPES AND DEFAULTS
// ============================================================================

/**
 * Configuration for the data enrichment pipeline.
 * Defines how synthetic student activity data is generated for prototyping.
 */

export interface DistributionConfig {
	type: 'beta' | 'normal' | 'lognormal' | 'uniform';
	params: Record<string, number>;
}

export interface UserProfileConfig {
	name: string;
	quizFrequency: number; // quizzes per week
	flashcardFrequency: number; // sessions per week
	studySessionFrequency: number; // sessions per week
	accuracyDistribution: DistributionConfig;
	subjectWeights: Record<string, number>;
}

export interface EnrichmentConfig {
	name: string;
	seed: number;
	userCount: number;
	monthsOfActivity: number;
	profiles: UserProfileConfig[];
}

// ============================================================================
// SUBJECT CONSTANTS
// ============================================================================

export const SUBJECT_KEYS = [
	'mathematics',
	'physical-sciences',
	'life-sciences',
	'english',
	'afrikaans',
	'geography',
	'history',
	'accounting',
	'business-studies',
	'economics',
] as const;

export type SubjectKey = (typeof SUBJECT_KEYS)[number];

// ============================================================================
// HELPER: Create distribution configs
// ============================================================================

/**
 * Create a beta distribution config (bounded 0-1, good for accuracy rates).
 * Beta(alpha, beta) where alpha/beta control skew.
 */
export function betaDistribution(alpha: number, beta: number): DistributionConfig {
	return {
		type: 'beta',
		params: { alpha, beta },
	};
}

/**
 * Create a normal distribution config.
 */
export function normalDistribution(mean: number, std: number): DistributionConfig {
	return {
		type: 'normal',
		params: { mean, std },
	};
}

/**
 * Create a lognormal distribution config (good for time durations).
 */
export function lognormalDistribution(mu: number, sigma: number): DistributionConfig {
	return {
		type: 'lognormal',
		params: { mu, sigma },
	};
}

/**
 * Create a uniform distribution config (equal probability across range).
 */
export function uniformDistribution(min: number, max: number): DistributionConfig {
	return {
		type: 'uniform',
		params: { min, max },
	};
}

// ============================================================================
// DEFAULT SUBJECT WEIGHTS FOR DIFFERENT STUDENT PROFILES
// ============================================================================

/**
 * Base subject weights used as starting point for profile configurations.
 * Weights indicate relative focus/time spent on each subject.
 */
export const baseSubjectWeights: Record<SubjectKey, number> = {
	mathematics: 1.5,
	'physical-sciences': 1.2,
	'life-sciences': 1.0,
	english: 0.8,
	afrikaans: 0.6,
	geography: 0.9,
	history: 0.8,
	accounting: 1.0,
	'business-studies': 0.7,
	economics: 0.7,
};

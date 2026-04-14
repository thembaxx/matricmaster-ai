import type { EnrichmentConfig, UserProfileConfig } from './config';
import { baseSubjectWeights, betaDistribution, uniformDistribution } from './config';

// ============================================================================
// DEFAULT ENRICHMENT CONFIGURATION
// ============================================================================

/**
 * Five distinct student profiles for synthetic data generation.
 * Each profile represents a different study pattern and performance level.
 */

/**
 * DILIGENT STUDENT
 * - Studies frequently across all subjects
 * - High accuracy (75-95%)
 * - Consistent study sessions
 * - Strong focus on core subjects (Maths, Sciences)
 */
const diligentProfile: UserProfileConfig = {
	name: 'Diligent',
	quizFrequency: 5, // 5 quizzes per week
	flashcardFrequency: 4, // 4 flashcard sessions per week
	studySessionFrequency: 6, // 6 study sessions per week
	accuracyDistribution: betaDistribution(8, 2), // Skewed toward 80-95% accuracy
	subjectWeights: {
		...baseSubjectWeights,
		mathematics: 2.0,
		'physical-sciences': 1.8,
		'life-sciences': 1.4,
		english: 1.0,
	},
};

/**
 * STRUGGLING STUDENT
 * - Studies infrequently
 * - Low accuracy (25-55%)
 * - Irregular study patterns
 * - Avoids difficult subjects
 */
const strugglingProfile: UserProfileConfig = {
	name: 'Struggling',
	quizFrequency: 1.5, // 1-2 quizzes per week
	flashcardFrequency: 1, // 1 flashcard session per week
	studySessionFrequency: 2, // 2 study sessions per week
	accuracyDistribution: betaDistribution(2, 4), // Skewed toward 25-50% accuracy
	subjectWeights: {
		...baseSubjectWeights,
		mathematics: 0.5, // Avoids maths
		'physical-sciences': 0.5, // Avoids sciences
		english: 1.2, // Prefers language subjects
		afrikaans: 1.0,
		history: 1.0,
		'business-studies': 1.2,
	},
};

/**
 * AVERAGE STUDENT
 * - Moderate study frequency
 * - Average accuracy (45-70%)
 * - Balanced subject coverage
 * - Typical Matric student pattern
 */
const averageProfile: UserProfileConfig = {
	name: 'Average',
	quizFrequency: 3, // 3 quizzes per week
	flashcardFrequency: 2, // 2 flashcard sessions per week
	studySessionFrequency: 3, // 3 study sessions per week
	accuracyDistribution: betaDistribution(4, 3), // Centered around 55-65% accuracy
	subjectWeights: {
		...baseSubjectWeights,
	},
};

/**
 * CRAMMER STUDENT
 * - Bursts of activity before exams, quiet otherwise
 * - Variable accuracy (35-75%)
 * - High volume, low retention study sessions
 * - Focus on memorization subjects
 */
const crammerProfile: UserProfileConfig = {
	name: 'Crammer',
	quizFrequency: 4, // 4 quizzes per week (but in bursts)
	flashcardFrequency: 5, // 5 flashcard sessions per week (memorization heavy)
	studySessionFrequency: 3, // 3 study sessions per week
	accuracyDistribution: uniformDistribution(0.35, 0.75), // Wide range 35-75%
	subjectWeights: {
		...baseSubjectWeights,
		'life-sciences': 1.6, // Heavy on content-heavy subjects
		history: 1.5,
		'business-studies': 1.4,
		geography: 1.3,
		mathematics: 0.8, // Less focus on problem-solving
		'physical-sciences': 0.8,
	},
};

/**
 * BALANCED STUDENT
 * - Steady, consistent study pattern
 * - Good accuracy (60-85%)
 * - Well-rounded across all subjects
 * - Ideal study habits
 */
const balancedProfile: UserProfileConfig = {
	name: 'Balanced',
	quizFrequency: 3.5, // ~3-4 quizzes per week
	flashcardFrequency: 3, // 3 flashcard sessions per week
	studySessionFrequency: 4, // 4 study sessions per week
	accuracyDistribution: betaDistribution(5, 2), // Skewed toward 65-85% accuracy
	subjectWeights: {
		mathematics: 1.3,
		'physical-sciences': 1.3,
		'life-sciences': 1.2,
		english: 1.0,
		afrikaans: 0.9,
		geography: 1.0,
		history: 1.0,
		accounting: 1.1,
		'business-studies': 1.0,
		economics: 1.0,
	},
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

/**
 * Default enrichment configuration with 5 distinct student profiles.
 * Used as the baseline for generating synthetic activity data.
 */
export const defaultEnrichmentConfig: EnrichmentConfig = {
	name: 'matric-master-phase1-prototype',
	seed: 42, // Reproducible randomness
	userCount: 50, // Number of synthetic users to generate
	monthsOfActivity: 6, // Generate 6 months of historical activity
	profiles: [diligentProfile, strugglingProfile, averageProfile, crammerProfile, balancedProfile],
};

/**
 * Profile distribution weights (what % of users should match each profile).
 * Realistic distribution: more average/struggling, fewer diligent.
 */
export const profileDistribution: Record<string, number> = {
	Diligent: 0.1, // 10% of users
	Struggling: 0.25, // 25% of users
	Average: 0.35, // 35% of users
	Crammer: 0.15, // 15% of users
	Balanced: 0.15, // 15% of users
};

import type {
	AdaptiveLearningMetrics,
	DifficultyRecommendation,
	KnowledgeGap,
	LearningPreferences,
	LearningVelocity,
	MasteryCalculation,
	UserLearningProfile,
} from '../../types/personalization';
import type { QuizResult } from '../db/schema';

// ============================================================================
// PROFILE UTILITIES
// ============================================================================

/**
 * Calculate learning velocity based on recent quiz performance
 */
export function calculateLearningVelocity(quizResults: QuizResult[]): LearningVelocity {
	if (quizResults.length === 0) {
		return {
			questionsPerMinute: 0,
			accuracyTrend: 'stable',
			consistencyScore: 0,
			riskOfBurnout: 'low',
			recommendedAdjustments: [],
		};
	}

	// Calculate questions per minute
	const totalTime = quizResults.reduce((sum, result) => sum + result.timeTaken, 0);
	const totalQuestions = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0);
	const questionsPerMinute = totalTime > 0 ? (totalQuestions / totalTime) * 60 : 0;

	// Calculate accuracy trend
	const accuracies = quizResults.map((r) => Number(r.percentage)).slice(-10); // Last 10 results
	const accuracyTrend = calculateTrend(accuracies);

	// Calculate consistency score (inverse of standard deviation)
	const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
	const variance = accuracies.reduce((sum, acc) => sum + (acc - mean) ** 2, 0) / accuracies.length;
	const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

	// Assess burnout risk based on declining accuracy and consistency
	const riskOfBurnout =
		accuracyTrend === 'declining' && consistencyScore < 60
			? 'high'
			: accuracyTrend === 'declining' || consistencyScore < 70
				? 'medium'
				: 'low';

	const recommendedAdjustments: string[] = [];
	if (riskOfBurnout === 'high') {
		recommendedAdjustments.push('Consider taking a break', 'Reduce study session length');
	} else if (questionsPerMinute > 10) {
		recommendedAdjustments.push('Consider slowing down to improve accuracy');
	} else if (questionsPerMinute < 2) {
		recommendedAdjustments.push('Try increasing pace while maintaining accuracy');
	}

	return {
		questionsPerMinute,
		accuracyTrend,
		consistencyScore,
		riskOfBurnout,
		recommendedAdjustments,
	};
}

/**
 * Calculate mastery level for a topic based on performance history
 */
export function calculateTopicMastery(
	topicResults: AdaptiveLearningMetrics[],
	minSampleSize = 5
): MasteryCalculation {
	if (topicResults.length < minSampleSize) {
		return {
			topic: topicResults[0]?.topic || 'unknown',
			currentMastery: 0,
			confidence: 0,
			trend: 'stable',
			nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
			strengthIndicators: [],
			weaknessIndicators: ['Insufficient data'],
		};
	}

	const performances = topicResults.map((r) => r.performanceScore);
	const recentPerformances = performances.slice(-10); // Last 10 attempts
	const currentMastery =
		recentPerformances.reduce((sum, score) => sum + score, 0) / recentPerformances.length;

	// Calculate confidence based on sample size and variance
	const variance =
		recentPerformances.reduce((sum, score) => sum + (score - currentMastery) ** 2, 0) /
		recentPerformances.length;
	const confidence = Math.min(
		100,
		(recentPerformances.length / minSampleSize) * (1 - Math.sqrt(variance) / 50) * 100
	);

	// Determine trend
	const trend = calculateTrend(recentPerformances);

	// Calculate next review date using spaced repetition principles
	const nextReviewDate = calculateNextReviewDate(
		currentMastery,
		trend,
		topicResults[topicResults.length - 1]?.createdAt
	);

	// Generate indicators
	const strengthIndicators: string[] = [];
	const weaknessIndicators: string[] = [];

	if (currentMastery >= 80) strengthIndicators.push('High mastery level');
	if (trend === 'improving') strengthIndicators.push('Improving performance');
	if (confidence >= 80) strengthIndicators.push('Reliable assessment');

	if (currentMastery < 60) weaknessIndicators.push('Needs more practice');
	if (trend === 'declining') weaknessIndicators.push('Performance declining');
	if (confidence < 50) weaknessIndicators.push('More data needed for accurate assessment');

	return {
		topic: topicResults[0]?.topic || 'Unknown',
		currentMastery,
		confidence,
		trend,
		nextReviewDate,
		strengthIndicators,
		weaknessIndicators,
	};
}

/**
 * Identify knowledge gaps based on performance patterns
 */
export function identifyKnowledgeGaps(
	profile: UserLearningProfile,
	recentResults: AdaptiveLearningMetrics[]
): KnowledgeGap[] {
	const gaps: KnowledgeGap[] = [];

	// Analyze weak areas from profile
	for (const weakArea of profile.weakAreas) {
		const topicResults = recentResults.filter((r) => r.topic === weakArea);
		if (topicResults.length > 0) {
			const mastery = calculateTopicMastery(topicResults);
			if (mastery.currentMastery < 60) {
				gaps.push({
					topic: weakArea,
					subject: 'unknown', // Would need subject mapping
					severity: mastery.currentMastery < 40 ? 'high' : 'medium',
					estimatedTimeToFix: Math.max(30, 120 - mastery.currentMastery), // 30-120 minutes
					prerequisites: [], // Would need curriculum data
					recommendedResources: ['Practice quizzes', 'Video explanations'],
					blockingProgress: mastery.currentMastery < 30,
				});
			}
		}
	}

	// Sort by severity and impact
	return gaps.sort((a, b) => {
		const severityOrder = { high: 3, medium: 2, low: 1 };
		return severityOrder[b.severity] - severityOrder[a.severity];
	});
}

/**
 * Recommend difficulty adjustment based on performance
 */
export function recommendDifficultyAdjustment(
	currentDifficulty: 'easy' | 'medium' | 'hard',
	recentPerformances: number[],
	_responseToDifficulty: Record<string, number>
): DifficultyRecommendation {
	const avgPerformance =
		recentPerformances.reduce((sum, p) => sum + p, 0) / recentPerformances.length;
	const consistency = calculateConsistency(recentPerformances);

	let recommendedDifficulty = currentDifficulty;
	let reason = '';
	const confidence = Math.min(100, recentPerformances.length * 20); // More data = higher confidence

	// Difficulty adjustment logic
	if (avgPerformance >= 85 && consistency >= 80) {
		// Performing well consistently - can increase difficulty
		if (currentDifficulty === 'easy') {
			recommendedDifficulty = 'medium';
			reason = 'Consistently high performance suggests ready for medium difficulty';
		} else if (currentDifficulty === 'medium') {
			recommendedDifficulty = 'hard';
			reason = 'Excellent performance indicates readiness for challenging content';
		}
	} else if (avgPerformance <= 50 || consistency <= 60) {
		// Struggling - decrease difficulty
		if (currentDifficulty === 'hard') {
			recommendedDifficulty = 'medium';
			reason = 'Low performance suggests need for medium difficulty';
		} else if (currentDifficulty === 'medium') {
			recommendedDifficulty = 'easy';
			reason = 'Struggling with medium difficulty - try easier content';
		}
	} else {
		// Performance is moderate - maintain current difficulty
		reason = 'Performance is appropriate for current difficulty level';
	}

	const alternativeOptions: DifficultyRecommendation[] = [];

	// Generate alternatives
	if (recommendedDifficulty !== 'easy') {
		alternativeOptions.push({
			currentDifficulty,
			recommendedDifficulty: 'easy',
			reason: 'If feeling overwhelmed, start with easier content',
			confidence: 90,
			alternativeOptions: [],
		});
	}

	if (recommendedDifficulty !== 'medium') {
		alternativeOptions.push({
			currentDifficulty,
			recommendedDifficulty: 'medium',
			reason: 'Balanced difficulty for steady progress',
			confidence: 85,
			alternativeOptions: [],
		});
	}

	if (recommendedDifficulty !== 'hard') {
		alternativeOptions.push({
			currentDifficulty,
			recommendedDifficulty: 'hard',
			reason: 'Challenge yourself for faster improvement',
			confidence: avgPerformance >= 70 ? 80 : 60,
			alternativeOptions: [],
		});
	}

	return {
		currentDifficulty,
		recommendedDifficulty,
		reason,
		confidence,
		alternativeOptions,
	};
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate trend from a series of values
 */
function calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
	if (values.length < 3) return 'stable';

	const recent = values.slice(-3);
	const older = values.slice(-6, -3);

	if (older.length === 0) return 'stable';

	const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
	const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;

	const difference = recentAvg - olderAvg;

	if (difference > 5) return 'improving';
	if (difference < -5) return 'declining';
	return 'stable';
}

/**
 * Calculate consistency score (0-100) from a series of values
 */
function calculateConsistency(values: number[]): number {
	if (values.length < 2) return 100;

	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
	const standardDeviation = Math.sqrt(variance);

	// Convert to consistency score (lower deviation = higher consistency)
	return Math.max(0, 100 - (standardDeviation / mean) * 100);
}

/**
 * Calculate next review date using spaced repetition principles
 */
function calculateNextReviewDate(
	mastery: number,
	trend: 'improving' | 'stable' | 'declining',
	_lastReview: Date
): Date {
	const now = new Date();

	// Base intervals based on mastery level
	let intervalHours: number;
	if (mastery >= 80) {
		intervalHours = 7 * 24; // 1 week
	} else if (mastery >= 60) {
		intervalHours = 3 * 24; // 3 days
	} else if (mastery >= 40) {
		intervalHours = 24; // 1 day
	} else {
		intervalHours = 12; // 12 hours
	}

	// Adjust based on trend
	if (trend === 'declining') {
		intervalHours *= 0.5; // Review sooner
	} else if (trend === 'improving') {
		intervalHours *= 1.5; // Review later
	}

	// Don't review too soon (minimum 4 hours)
	intervalHours = Math.max(4, intervalHours);

	return new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
}

/**
 * Validate and normalize learning preferences
 */
export function validateLearningPreferences(
	prefs: Partial<LearningPreferences>
): LearningPreferences {
	return {
		userId: prefs.userId || '',
		preferredDifficulty: prefs.preferredDifficulty || 'medium',
		learningStyle: prefs.learningStyle || 'visual',
		preferredPace: prefs.preferredPace || 'moderate',
		sessionDuration: Math.max(15, Math.min(180, prefs.sessionDuration || 30)), // 15-180 minutes
		preferredSubjects: prefs.preferredSubjects || [],
		contentTypes: prefs.contentTypes || ['text', 'visual'],
		avoidedTopics: prefs.avoidedTopics || [],
		createdAt: prefs.createdAt || new Date(),
		updatedAt: prefs.updatedAt || new Date(),
	};
}

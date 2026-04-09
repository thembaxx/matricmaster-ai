import type {
	AdaptiveLearningMetrics,
	DifficultyRecommendation,
	UserLearningProfile,
} from '../../types/personalization';

// ============================================================================
// DIFFICULTY ADJUSTMENT ENGINE
// ============================================================================

export class DifficultyAdjustmentEngine {
	private readonly adjustmentCooldown = 5 * 60 * 1000; // 5 minutes between adjustments
	private readonly minSampleSize = 3;
	private readonly confidenceThreshold = 70;

	/**
	 * Determine optimal difficulty for next question based on performance
	 */
	calculateOptimalDifficulty(
		recentResults: AdaptiveLearningMetrics[],
		currentDifficulty: 'easy' | 'medium' | 'hard',
		userProfile?: UserLearningProfile,
		lastAdjustment?: Date
	): {
		currentDifficulty: 'easy' | 'medium' | 'hard';
		recommendedDifficulty: 'easy' | 'medium' | 'hard';
		reason: string;
		confidence: number;
		shouldAdjust: boolean;
	} {
		// Check cooldown
		if (lastAdjustment && Date.now() - lastAdjustment.getTime() < this.adjustmentCooldown) {
			return {
				currentDifficulty,
				recommendedDifficulty: currentDifficulty,
				reason: 'Too soon for difficulty adjustment',
				confidence: 100,
				shouldAdjust: false,
			};
		}

		// Need minimum sample size
		if (recentResults.length < this.minSampleSize) {
			return {
				currentDifficulty,
				recommendedDifficulty: currentDifficulty,
				reason: 'Insufficient data for difficulty adjustment',
				confidence: 50,
				shouldAdjust: false,
			};
		}

		// Calculate average performance
		const avgPerformance =
			recentResults.reduce((sum, r) => sum + r.performanceScore, 0) / recentResults.length;

		// Calculate consistency
		const performances = recentResults.map((r) => r.performanceScore);
		const consistency = this.calculateConsistency(performances);

		// Consider user's difficulty response pattern
		const difficultyResponse = userProfile?.responseToDifficulty || {
			easy: 70,
			medium: 70,
			hard: 70,
		};

		// Determine recommended difficulty
		const recommendation = this.determineDifficultyRecommendation(
			avgPerformance,
			consistency,
			currentDifficulty,
			difficultyResponse
		);

		// Check if adjustment is needed
		const shouldAdjust =
			recommendation.recommendedDifficulty !== currentDifficulty &&
			recommendation.confidence >= this.confidenceThreshold;

		return {
			...recommendation,
			currentDifficulty,
			shouldAdjust,
		};
	}

	/**
	 * Adjust difficulty for a specific topic based on topic performance
	 */
	adjustTopicDifficulty(
		_topic: string,
		topicResults: AdaptiveLearningMetrics[],
		currentDifficulty: 'easy' | 'medium' | 'hard',
		userProfile?: UserLearningProfile
	): DifficultyRecommendation {
		if (topicResults.length < this.minSampleSize) {
			return {
				currentDifficulty,
				recommendedDifficulty: currentDifficulty,
				reason: 'Insufficient topic-specific data',
				confidence: 50,
				alternativeOptions: [],
			};
		}

		const topicPerformances = topicResults.map((r) => r.performanceScore);
		const avgPerformance =
			topicPerformances.reduce((sum, p) => sum + p, 0) / topicPerformances.length;
		const consistency = this.calculateConsistency(topicPerformances);

		const recommendation = this.determineDifficultyRecommendation(
			avgPerformance,
			consistency,
			currentDifficulty,
			userProfile?.responseToDifficulty || { easy: 70, medium: 70, hard: 70 }
		);

		// Generate alternative options
		const alternatives: DifficultyRecommendation[] = [];

		if (recommendation.recommendedDifficulty !== 'easy') {
			alternatives.push({
				currentDifficulty,
				recommendedDifficulty: 'easy',
				reason: 'Start with easier questions to build confidence',
				confidence: 90,
				alternativeOptions: [],
			});
		}

		if (recommendation.recommendedDifficulty !== 'medium') {
			alternatives.push({
				currentDifficulty,
				recommendedDifficulty: 'medium',
				reason: 'Balanced difficulty for steady progress',
				confidence: 85,
				alternativeOptions: [],
			});
		}

		if (recommendation.recommendedDifficulty !== 'hard') {
			alternatives.push({
				currentDifficulty,
				recommendedDifficulty: 'hard',
				reason: 'Challenge yourself with harder questions',
				confidence: avgPerformance >= 75 ? 80 : 60,
				alternativeOptions: [],
			});
		}

		return {
			...recommendation,
			currentDifficulty,
			alternativeOptions: alternatives,
		};
	}

	/**
	 * Predict user performance on different difficulty levels
	 */
	predictPerformance(
		_userId: string,
		difficulty: 'easy' | 'medium' | 'hard',
		recentResults: AdaptiveLearningMetrics[],
		_userProfile?: UserLearningProfile
	): {
		predictedScore: number;
		confidence: number;
		basedOnHistory: number;
	} {
		// Get results for this difficulty level
		const difficultyResults = recentResults.filter((r) => r.difficulty === difficulty);

		if (difficultyResults.length === 0) {
			// Use general performance and difficulty response pattern
			const generalAvg =
				recentResults.length > 0
					? recentResults.reduce((sum, r) => sum + r.performanceScore, 0) / recentResults.length
					: 70;

			// Adjust based on difficulty response
			const adjustment = difficulty === 'easy' ? -5 : difficulty === 'hard' ? 5 : 0;

			const predictedScore = Math.max(0, Math.min(100, generalAvg + adjustment));
			const confidence = Math.min(60, recentResults.length * 10); // Lower confidence with less data

			return {
				predictedScore,
				confidence,
				basedOnHistory: recentResults.length,
			};
		}

		// Calculate based on actual difficulty-specific performance
		const scores = difficultyResults.map((r) => r.performanceScore);
		const predictedScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
		const confidence = Math.min(90, difficultyResults.length * 15);

		return {
			predictedScore,
			confidence,
			basedOnHistory: difficultyResults.length,
		};
	}

	/**
	 * Get difficulty progression path for a user
	 */
	getDifficultyProgression(
		_userId: string,
		currentDifficulty: 'easy' | 'medium' | 'hard',
		recentResults: AdaptiveLearningMetrics[],
		targetDifficulty?: 'easy' | 'medium' | 'hard'
	): {
		currentLevel: 'easy' | 'medium' | 'hard';
		targetLevel: 'easy' | 'medium' | 'hard';
		progressToNext: number; // 0-100
		steps: Array<{
			difficulty: 'easy' | 'medium' | 'hard';
			estimatedTime: number; // sessions needed
			requirements: string[];
		}>;
	} {
		const target = targetDifficulty || this.getNextDifficulty(currentDifficulty);

		// Calculate progress to next level
		const progressToNext = this.calculateProgressToNextLevel(
			recentResults,
			currentDifficulty,
			target
		);

		// Generate progression steps
		const steps = this.generateProgressionSteps(currentDifficulty, target);

		return {
			currentLevel: currentDifficulty,
			targetLevel: target,
			progressToNext,
			steps,
		};
	}

	// ============================================================================
	// PRIVATE METHODS
	// ============================================================================

	private determineDifficultyRecommendation(
		avgPerformance: number,
		consistency: number,
		currentDifficulty: 'easy' | 'medium' | 'hard',
		difficultyResponse: Record<string, number>
	): {
		recommendedDifficulty: 'easy' | 'medium' | 'hard';
		reason: string;
		confidence: number;
	} {
		// Combine performance and consistency for decision
		const combinedScore = avgPerformance * 0.7 + consistency * 0.3;

		let recommendedDifficulty = currentDifficulty;
		let reason = '';
		let confidence = Math.min(100, consistency); // Confidence based on consistency

		// Difficulty adjustment logic
		if (combinedScore >= 85) {
			// Performing very well - can handle harder content
			if (currentDifficulty === 'easy') {
				recommendedDifficulty = 'medium';
				reason = 'Consistently high performance suggests readiness for medium difficulty';
			} else if (currentDifficulty === 'medium') {
				recommendedDifficulty = 'hard';
				reason = 'Excellent performance indicates capability for challenging content';
			}
		} else if (combinedScore <= 60) {
			// Struggling - need easier content
			if (currentDifficulty === 'hard') {
				recommendedDifficulty = 'medium';
				reason = 'Low performance suggests need for medium difficulty';
			} else if (currentDifficulty === 'medium') {
				recommendedDifficulty = 'easy';
				reason = 'Struggling with medium difficulty - try easier content';
			}
		} else {
			// Performance is appropriate for current level
			reason = 'Performance is well-matched to current difficulty level';
			confidence = Math.min(100, confidence + 20);
		}

		// Consider user's historical response to difficulties
		const targetResponse = difficultyResponse[recommendedDifficulty];
		if (targetResponse && targetResponse < 60) {
			// User historically struggles with recommended difficulty
			recommendedDifficulty = currentDifficulty;
			reason = 'Maintaining current difficulty based on historical performance patterns';
		}

		return {
			recommendedDifficulty,
			reason,
			confidence,
		};
	}

	private calculateConsistency(performances: number[]): number {
		if (performances.length < 2) return 100;

		const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
		const variance =
			performances.reduce((sum, p) => sum + (p - mean) ** 2, 0) / performances.length;
		const standardDeviation = Math.sqrt(variance);

		// Return consistency as inverse of coefficient of variation
		const coefficientOfVariation = standardDeviation / mean;
		return Math.max(0, 100 - coefficientOfVariation * 100);
	}

	private getNextDifficulty(current: 'easy' | 'medium' | 'hard'): 'easy' | 'medium' | 'hard' {
		switch (current) {
			case 'easy':
				return 'medium';
			case 'medium':
				return 'hard';
			case 'hard':
				return 'hard'; // Stay at hard
		}
	}

	private calculateProgressToNextLevel(
		recentResults: AdaptiveLearningMetrics[],
		currentDifficulty: 'easy' | 'medium' | 'hard',
		targetDifficulty: 'easy' | 'medium' | 'hard'
	): number {
		if (currentDifficulty === targetDifficulty) return 100;

		// Get results for target difficulty
		const targetResults = recentResults.filter((r) => r.difficulty === targetDifficulty);
		if (targetResults.length === 0) return 0;

		const avgTargetPerformance =
			targetResults.reduce((sum, r) => sum + r.performanceScore, 0) / targetResults.length;

		// Progress is based on performance at target difficulty
		const threshold = targetDifficulty === 'hard' ? 70 : targetDifficulty === 'medium' ? 60 : 50;

		return Math.min(100, Math.max(0, ((avgTargetPerformance - 40) / (threshold - 40)) * 100));
	}

	private generateProgressionSteps(
		current: 'easy' | 'medium' | 'hard',
		target: 'easy' | 'medium' | 'hard'
	): Array<{
		difficulty: 'easy' | 'medium' | 'hard';
		estimatedTime: number;
		requirements: string[];
	}> {
		const steps: Array<{
			difficulty: 'easy' | 'medium' | 'hard';
			estimatedTime: number;
			requirements: string[];
		}> = [];

		const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
		const currentIndex = difficulties.indexOf(current);
		const targetIndex = difficulties.indexOf(target);

		if (currentIndex < targetIndex) {
			// Progressing to harder difficulties
			for (let i = currentIndex; i <= targetIndex; i++) {
				const diff = difficulties[i];
				steps.push({
					difficulty: diff,
					estimatedTime: diff === 'easy' ? 3 : diff === 'medium' ? 5 : 8,
					requirements: this.getDifficultyRequirements(diff),
				});
			}
		} else if (currentIndex > targetIndex) {
			// Regressing to easier difficulties
			for (let i = currentIndex; i >= targetIndex; i--) {
				const diff = difficulties[i];
				steps.push({
					difficulty: diff,
					estimatedTime: 2, // Faster for regression
					requirements: ['Build confidence', 'Review fundamentals'],
				});
			}
		}

		return steps;
	}

	private getDifficultyRequirements(difficulty: 'easy' | 'medium' | 'hard'): string[] {
		switch (difficulty) {
			case 'easy':
				return [
					'Consistent 70%+ accuracy on basic concepts',
					'Understanding of fundamental principles',
					'Comfortable with basic problem types',
				];
			case 'medium':
				return [
					'Consistent 75%+ accuracy on varied problems',
					'Application of concepts to different scenarios',
					'Recognition of common patterns and tricks',
				];
			case 'hard':
				return [
					'Consistent 80%+ accuracy on complex problems',
					'Integration of multiple concepts',
					'Creative problem-solving approaches',
				];
		}
	}
}

// Export singleton instance
export const difficultyAdjustmentEngine = new DifficultyAdjustmentEngine();

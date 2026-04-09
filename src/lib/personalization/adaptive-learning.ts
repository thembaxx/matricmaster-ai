import type {
	AdaptiveLearningMetrics,
	KnowledgeGap,
	LearningVelocity,
	MasteryCalculation,
	PersonalizedRecommendation,
	UserLearningProfile,
} from '../../types/personalization';
import type { QuizResult } from '../db/schema';
import {
	calculateLearningVelocity,
	calculateTopicMastery,
	identifyKnowledgeGaps,
	recommendDifficultyAdjustment,
} from './profile-utils';

// ============================================================================
// ADAPTIVE LEARNING ALGORITHM
// ============================================================================

export class AdaptiveLearningEngine {
	private readonly minSampleSize = 5;

	/**
	 * Analyze user performance and generate adaptive recommendations
	 */
	async analyzeUserPerformance(
		userId: string,
		recentResults: AdaptiveLearningMetrics[],
		quizHistory: QuizResult[],
		currentProfile?: UserLearningProfile
	): Promise<{
		masteryLevels: MasteryCalculation[];
		knowledgeGaps: KnowledgeGap[];
		learningVelocity: LearningVelocity;
		recommendations: PersonalizedRecommendation[];
	}> {
		// Calculate mastery levels for each topic
		const topicGroups = this.groupMetricsByTopic(recentResults);
		const masteryLevels = Object.values(topicGroups).map((metrics) =>
			calculateTopicMastery(metrics, this.minSampleSize)
		);

		// Identify knowledge gaps
		const knowledgeGaps = currentProfile
			? identifyKnowledgeGaps(currentProfile, recentResults)
			: [];

		// Calculate learning velocity
		const learningVelocity = calculateLearningVelocity(quizHistory);

		// Generate personalized recommendations
		const recommendations = await this.generateRecommendations(
			userId,
			masteryLevels,
			knowledgeGaps,
			learningVelocity,
			currentProfile
		);

		return {
			masteryLevels,
			knowledgeGaps,
			learningVelocity,
			recommendations,
		};
	}

	/**
	 * Generate next content recommendation based on current state
	 */
	async recommendNextContent(
		_userId: string,
		recentResults: AdaptiveLearningMetrics[],
		availableTopics: Array<{ subjectId: number; topic: string; difficulty: string }>,
		currentProfile?: UserLearningProfile
	): Promise<{
		recommendedTopic: string | null;
		recommendedDifficulty: 'easy' | 'medium' | 'hard';
		reason: string;
		alternatives: Array<{ topic: string; difficulty: string; reason: string }>;
	}> {
		if (availableTopics.length === 0) {
			return {
				recommendedTopic: null,
				recommendedDifficulty: 'medium',
				reason: 'No topics available',
				alternatives: [],
			};
		}

		// Get mastery levels
		const topicGroups = this.groupMetricsByTopic(recentResults);
		const masteryLevels = Object.values(topicGroups).map((metrics) =>
			calculateTopicMastery(metrics, this.minSampleSize)
		);

		// Calculate user's current difficulty preference
		const userDifficulty = this.calculateOptimalDifficulty(recentResults, masteryLevels);

		// Score available topics
		const topicScores = availableTopics.map((topic) => {
			const mastery = masteryLevels.find((m) => m.topic === topic.topic);
			const score = this.scoreTopic(topic, mastery, userDifficulty, currentProfile);
			return { ...topic, score, mastery };
		});

		// Sort by score and select best
		topicScores.sort((a, b) => b.score - a.score);
		const bestTopic = topicScores[0];

		if (!bestTopic) {
			return {
				recommendedTopic: null,
				recommendedDifficulty: userDifficulty,
				reason: 'Unable to determine suitable topic',
				alternatives: [],
			};
		}

		// Generate alternatives
		const alternatives = topicScores.slice(1, 4).map((topic) => ({
			topic: topic.topic,
			difficulty: topic.difficulty,
			reason: this.getRecommendationReason(topic, topic.mastery, userDifficulty),
		}));

		return {
			recommendedTopic: bestTopic.topic,
			recommendedDifficulty: bestTopic.difficulty as 'easy' | 'medium' | 'hard',
			reason: this.getRecommendationReason(bestTopic, bestTopic.mastery, userDifficulty),
			alternatives,
		};
	}

	/**
	 * Update user learning profile based on new performance data
	 */
	async updateLearningProfile(
		currentProfile: UserLearningProfile,
		newMetrics: AdaptiveLearningMetrics[],
		quizResults: QuizResult[]
	): Promise<UserLearningProfile> {
		const updatedProfile = { ...currentProfile };

		// Update subject mastery
		for (const metric of newMetrics) {
			if (metric.topic) {
				this.updateTopicMastery(updatedProfile, metric);
			}
		}

		// Update learning velocity and consistency
		const velocity = calculateLearningVelocity(quizResults);
		updatedProfile.learningVelocity = velocity.questionsPerMinute;
		updatedProfile.consistencyScore = velocity.consistencyScore;
		updatedProfile.riskOfBurnout = velocity.riskOfBurnout;

		// Update strength and weak areas
		this.updateStrengthWeakAreas(updatedProfile);

		// Update improvement rates
		this.updateImprovementRates(updatedProfile);

		// Update last personalization update
		updatedProfile.lastPersonalizationUpdate = new Date();

		return updatedProfile;
	}

	/**
	 * Detect when user needs intervention (burnout, struggling, etc.)
	 */
	detectInterventionNeeds(
		_recentMetrics: AdaptiveLearningMetrics[],
		learningVelocity: LearningVelocity,
		masteryLevels: MasteryCalculation[]
	): {
		needsIntervention: boolean;
		interventionType:
			| 'break'
			| 'difficulty_adjustment'
			| 'study_plan_review'
			| 'encouragement'
			| null;
		reason: string;
		urgency: 'low' | 'medium' | 'high';
	} {
		// Check for burnout signals
		if (learningVelocity.riskOfBurnout === 'high') {
			return {
				needsIntervention: true,
				interventionType: 'break',
				reason: 'High risk of burnout detected based on declining performance and low consistency',
				urgency: 'high',
			};
		}

		// Check for consistent struggling
		const lowMasteryTopics = masteryLevels.filter(
			(m) => m.currentMastery < 40 && m.confidence > 70
		);
		if (lowMasteryTopics.length >= 3) {
			return {
				needsIntervention: true,
				interventionType: 'difficulty_adjustment',
				reason: `Struggling with ${lowMasteryTopics.length} topics, consider easier difficulty`,
				urgency: 'medium',
			};
		}

		// Check for lack of progress
		const decliningTopics = masteryLevels.filter(
			(m) => m.trend === 'declining' && m.confidence > 70
		);
		if (decliningTopics.length >= 2) {
			return {
				needsIntervention: true,
				interventionType: 'study_plan_review',
				reason: 'Performance declining in multiple topics, study plan may need adjustment',
				urgency: 'medium',
			};
		}

		// Check for excellent progress (encouragement)
		const improvingTopics = masteryLevels.filter(
			(m) => m.trend === 'improving' && m.currentMastery > 80
		);
		if (improvingTopics.length >= 3 && learningVelocity.consistencyScore > 80) {
			return {
				needsIntervention: true,
				interventionType: 'encouragement',
				reason: 'Excellent progress across multiple topics, keep up the great work!',
				urgency: 'low',
			};
		}

		return {
			needsIntervention: false,
			interventionType: null,
			reason: 'No intervention needed at this time',
			urgency: 'low',
		};
	}

	// ============================================================================
	// PRIVATE METHODS
	// ============================================================================

	private groupMetricsByTopic(
		metrics: AdaptiveLearningMetrics[]
	): Record<string, AdaptiveLearningMetrics[]> {
		const groups: Record<string, AdaptiveLearningMetrics[]> = {};

		for (const metric of metrics) {
			if (metric.topic) {
				if (!groups[metric.topic]) {
					groups[metric.topic] = [];
				}
				groups[metric.topic].push(metric);
			}
		}

		return groups;
	}

	private calculateOptimalDifficulty(
		recentResults: AdaptiveLearningMetrics[],
		masteryLevels: MasteryCalculation[]
	): 'easy' | 'medium' | 'hard' {
		if (recentResults.length === 0) return 'medium';

		// Calculate average performance
		const avgPerformance =
			recentResults.reduce((sum, r) => sum + r.performanceScore, 0) / recentResults.length;

		// Consider mastery levels
		const avgMastery =
			masteryLevels.length > 0
				? masteryLevels.reduce((sum, m) => sum + m.currentMastery, 0) / masteryLevels.length
				: 50;

		const combinedScore = avgPerformance * 0.6 + avgMastery * 0.4;

		if (combinedScore >= 75) return 'hard';
		if (combinedScore >= 50) return 'medium';
		return 'easy';
	}

	private scoreTopic(
		topic: { subjectId: number; topic: string; difficulty: string },
		mastery: MasteryCalculation | undefined,
		userDifficulty: 'easy' | 'medium' | 'hard',
		profile?: UserLearningProfile
	): number {
		let score = 50; // Base score

		// Prefer topics user hasn't mastered yet
		if (!mastery || mastery.currentMastery < 70) {
			score += 20;
		}

		// Prefer topics at appropriate difficulty
		const difficultyMatch = this.getDifficultyMatchScore(topic.difficulty as any, userDifficulty);
		score += difficultyMatch;

		// Prefer topics user is interested in
		if (profile?.preferredSubjects.includes(topic.topic)) {
			score += 15;
		}

		// Avoid topics user wants to skip
		if (profile?.avoidedTopics?.includes(topic.topic)) {
			score -= 30;
		}

		// Prefer topics that need review (due for spaced repetition)
		if (mastery && mastery.nextReviewDate <= new Date()) {
			score += 10;
		}

		return Math.max(0, Math.min(100, score));
	}

	private getDifficultyMatchScore(
		topicDifficulty: 'easy' | 'medium' | 'hard',
		userDifficulty: 'easy' | 'medium' | 'hard'
	): number {
		if (topicDifficulty === userDifficulty) return 10;
		if (
			Math.abs(
				this.difficultyToNumber(topicDifficulty) - this.difficultyToNumber(userDifficulty)
			) === 1
		)
			return 5;
		return 0;
	}

	private difficultyToNumber(difficulty: 'easy' | 'medium' | 'hard'): number {
		switch (difficulty) {
			case 'easy':
				return 1;
			case 'medium':
				return 2;
			case 'hard':
				return 3;
			default:
				return 2;
		}
	}

	private getRecommendationReason(
		topic: any,
		mastery: MasteryCalculation | undefined,
		userDifficulty: 'easy' | 'medium' | 'hard'
	): string {
		const reasons: string[] = [];

		if (!mastery || mastery.currentMastery < 70) {
			reasons.push('needs practice');
		}

		if (topic.difficulty === userDifficulty) {
			reasons.push('matches your preferred difficulty');
		}

		if (mastery?.nextReviewDate && mastery.nextReviewDate <= new Date()) {
			reasons.push('due for review');
		}

		return reasons.length > 0 ? reasons.join(', ') : 'recommended for balanced learning';
	}

	private async generateRecommendations(
		userId: string,
		masteryLevels: MasteryCalculation[],
		knowledgeGaps: KnowledgeGap[],
		learningVelocity: LearningVelocity,
		profile?: UserLearningProfile
	): Promise<PersonalizedRecommendation[]> {
		const recommendations: PersonalizedRecommendation[] = [];

		// Generate recommendations based on knowledge gaps
		for (const gap of knowledgeGaps.slice(0, 3)) {
			recommendations.push({
				id: `gap-${gap.topic}-${Date.now()}`,
				userId,
				type: 'content',
				priority: gap.severity === 'high' ? 'high' : 'medium',
				title: `Focus on ${gap.topic}`,
				description: `You need more practice with ${gap.topic}. Estimated time: ${gap.estimatedTimeToFix} minutes.`,
				actionUrl: `/study/${gap.topic}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				isDismissed: false,
				createdAt: new Date(),
			});
		}

		// Generate recommendations based on learning velocity
		if (learningVelocity.recommendedAdjustments.length > 0) {
			recommendations.push({
				id: `velocity-${Date.now()}`,
				userId,
				type: learningVelocity.riskOfBurnout === 'high' ? 'break' : 'study_plan_review',
				priority: learningVelocity.riskOfBurnout === 'high' ? 'high' : 'medium',
				title: learningVelocity.riskOfBurnout === 'high' ? 'Take a Break' : 'Adjust Study Pace',
				description: learningVelocity.recommendedAdjustments.join('. '),
				isDismissed: false,
				createdAt: new Date(),
			});
		}

		// Generate difficulty adjustment recommendations
		if (profile && masteryLevels.length >= 3) {
			const recentPerformances = masteryLevels.map((m) => m.currentMastery);
			const difficultyRec = recommendDifficultyAdjustment(
				profile.preferredDifficulty,
				recentPerformances,
				{}
			);

			if (difficultyRec.recommendedDifficulty !== profile.preferredDifficulty) {
				recommendations.push({
					id: `difficulty-${Date.now()}`,
					userId,
					type: 'difficulty_adjustment',
					priority: 'medium',
					title: 'Consider Adjusting Difficulty',
					description: difficultyRec.reason,
					isDismissed: false,
					createdAt: new Date(),
				});
			}
		}

		return recommendations.slice(0, 5); // Limit to 5 recommendations
	}

	private updateTopicMastery(profile: UserLearningProfile, metric: AdaptiveLearningMetrics): void {
		const subjectKey = metric.subjectId?.toString() || 'unknown';
		if (!profile.subjectMastery[subjectKey]) {
			profile.subjectMastery[subjectKey] = {
				overallScore: 0,
				topicScores: {},
				attempts: 0,
				lastAttempted: new Date(),
			};
		}

		const subjectData = profile.subjectMastery[subjectKey];
		if (metric.topic) {
			subjectData.topicScores[metric.topic] = metric.performanceScore;
		}
		subjectData.attempts += metric.totalQuestions;
		subjectData.lastAttempted = metric.createdAt;

		// Recalculate overall score
		const topicScores = Object.values(subjectData.topicScores);
		subjectData.overallScore =
			topicScores.reduce((sum, score) => sum + score, 0) / topicScores.length;
	}

	private updateStrengthWeakAreas(profile: UserLearningProfile): void {
		const topicScores: Array<{ topic: string; score: number }> = [];

		for (const subject of Object.values(profile.subjectMastery)) {
			for (const [topic, score] of Object.entries(subject.topicScores)) {
				topicScores.push({ topic, score });
			}
		}

		topicScores.sort((a, b) => b.score - a.score);

		profile.strengthAreas = topicScores
			.filter((t) => t.score >= 80)
			.map((t) => t.topic)
			.slice(0, 5);
		profile.weakAreas = topicScores
			.filter((t) => t.score < 60)
			.map((t) => t.topic)
			.slice(0, 5);
	}

	private updateImprovementRates(profile: UserLearningProfile): void {
		// This would require historical data to calculate improvement rates
		// For now, initialize with current performance
		for (const subjectKey of Object.keys(profile.subjectMastery)) {
			profile.improvementRate[subjectKey] = profile.subjectMastery[subjectKey].overallScore / 10; // Simple approximation
		}
	}
}

// Export singleton instance
export const adaptiveLearningEngine = new AdaptiveLearningEngine();

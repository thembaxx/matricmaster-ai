import type {
	AdaptiveLearningMetrics,
	KnowledgeGap,
	MasteryCalculation,
	PersonalizedRecommendation,
	RecommendationAction,
	UserLearningProfile,
} from '../../types/personalization';

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

export class RecommendationEngine {
	private readonly maxRecommendations = 5;
	private readonly recommendationCooldown = 24 * 60 * 60 * 1000; // 24 hours

	/**
	 * Generate personalized recommendations based on user state
	 */
	async generateRecommendations(
		userId: string,
		masteryLevels: MasteryCalculation[],
		knowledgeGaps: KnowledgeGap[],
		recentActivity: AdaptiveLearningMetrics[],
		existingRecommendations: PersonalizedRecommendation[],
		profile?: UserLearningProfile
	): Promise<PersonalizedRecommendation[]> {
		const recommendations: PersonalizedRecommendation[] = [];

		// Filter out recently shown recommendations
		const activeRecommendations = existingRecommendations.filter(
			(rec) =>
				!rec.isDismissed &&
				(!rec.expiresAt || rec.expiresAt > new Date()) &&
				Date.now() - rec.createdAt.getTime() > this.recommendationCooldown
		);

		// Generate knowledge gap recommendations
		const gapRecommendations = this.generateGapRecommendations(userId, knowledgeGaps);
		recommendations.push(...gapRecommendations);

		// Generate mastery-based recommendations
		const masteryRecommendations = this.generateMasteryRecommendations(userId, masteryLevels);
		recommendations.push(...masteryRecommendations);

		// Generate activity-based recommendations
		const activityRecommendations = this.generateActivityRecommendations(
			userId,
			recentActivity,
			profile
		);
		recommendations.push(...activityRecommendations);

		// Generate motivational recommendations
		const motivationalRecommendations = this.generateMotivationalRecommendations(
			userId,
			masteryLevels
		);
		recommendations.push(...motivationalRecommendations);

		// Prioritize and limit recommendations
		const prioritized = this.prioritizeRecommendations(recommendations, activeRecommendations);

		return prioritized.slice(0, this.maxRecommendations);
	}

	/**
	 * Get recommended actions for a specific topic
	 */
	getTopicRecommendations(
		topic: string,
		mastery: MasteryCalculation,
		knowledgeGaps: KnowledgeGap[]
	): RecommendationAction[] {
		const actions: RecommendationAction[] = [];

		// Check if topic has knowledge gap
		const gap = knowledgeGaps.find((g) => g.topic === topic);
		if (gap) {
			actions.push({
				type: 'review_topic',
				priority: gap.severity === 'high' ? 'high' : 'medium',
				target: topic,
				reason: `Knowledge gap identified: ${gap.estimatedTimeToFix} minutes needed`,
			});
		}

		// Based on mastery level
		if (mastery.currentMastery < 50) {
			actions.push({
				type: 'practice_more',
				priority: 'high',
				target: topic,
				reason: 'Low mastery - more practice recommended',
			});
		} else if (mastery.currentMastery > 85) {
			actions.push({
				type: 'change_difficulty',
				priority: 'low',
				target: topic,
				reason: 'High mastery - try harder questions',
			});
		}

		// Based on trend
		if (mastery.trend === 'declining') {
			actions.push({
				type: 'review_topic',
				priority: 'medium',
				target: topic,
				reason: 'Performance declining - review needed',
			});
		}

		// Spaced repetition
		if (mastery.nextReviewDate <= new Date()) {
			actions.push({
				type: 'review_topic',
				priority: 'medium',
				target: topic,
				reason: 'Due for spaced repetition review',
			});
		}

		return actions.sort((a, b) => {
			const priorityOrder = { high: 3, medium: 2, low: 1 };
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		});
	}

	/**
	 * Analyze recommendation effectiveness
	 */
	analyzeRecommendationEffectiveness(
		recommendations: PersonalizedRecommendation[],
		userActions: Array<{ recommendationId: string; action: string; timestamp: Date }>
	): {
		effectiveRecommendations: string[];
		ineffectiveRecommendations: string[];
		effectiveness: Record<string, number>;
	} {
		const effectiveness: Record<string, number> = {};
		const effective: string[] = [];
		const ineffective: string[] = [];

		for (const rec of recommendations) {
			const actions = userActions.filter((a) => a.recommendationId === rec.id);
			if (actions.length === 0) continue;

			// Calculate effectiveness based on time to action and action type
			let score = 0;
			const timeToAction = actions[0].timestamp.getTime() - rec.createdAt.getTime();
			const hoursToAction = timeToAction / (1000 * 60 * 60);

			// Faster action = higher effectiveness
			if (hoursToAction < 1) score += 30;
			else if (hoursToAction < 24) score += 20;
			else if (hoursToAction < 72) score += 10;

			// Action type affects score
			const action = actions[0].action;
			if (action === 'completed' || action === 'followed') score += 40;
			else if (action === 'viewed') score += 20;

			effectiveness[rec.id] = Math.min(100, score);

			if (score >= 50) {
				effective.push(rec.id);
			} else {
				ineffective.push(rec.id);
			}
		}

		return {
			effectiveRecommendations: effective,
			ineffectiveRecommendations: ineffective,
			effectiveness,
		};
	}

	// ============================================================================
	// PRIVATE METHODS
	// ============================================================================

	private generateGapRecommendations(
		userId: string,
		knowledgeGaps: KnowledgeGap[]
	): PersonalizedRecommendation[] {
		return knowledgeGaps.slice(0, 2).map((gap) => ({
			id: `gap-${gap.topic}-${Date.now()}`,
			userId,
			type: 'content' as const,
			priority: gap.severity === 'high' ? ('high' as const) : ('medium' as const),
			title: `Focus on ${gap.topic}`,
			description: `Address this knowledge gap to improve your understanding. Estimated time: ${gap.estimatedTimeToFix} minutes.`,
			actionUrl: `/study/${gap.topic}`,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			isDismissed: false,
			createdAt: new Date(),
		}));
	}

	private generateMasteryRecommendations(
		userId: string,
		masteryLevels: MasteryCalculation[]
	): PersonalizedRecommendation[] {
		const recommendations: PersonalizedRecommendation[] = [];

		// Find topics due for review
		const dueForReview = masteryLevels.filter(
			(m) => m.nextReviewDate <= new Date() && m.confidence > 70
		);

		for (const mastery of dueForReview.slice(0, 2)) {
			recommendations.push({
				id: `review-${mastery.topic}-${Date.now()}`,
				userId,
				type: 'content',
				priority: 'medium',
				title: `Review ${mastery.topic}`,
				description: 'This topic is due for a spaced repetition review to maintain your knowledge.',
				actionUrl: `/quiz/${mastery.topic}`,
				expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
				isDismissed: false,
				createdAt: new Date(),
			});
		}

		// Find struggling topics
		const struggling = masteryLevels.filter(
			(m) => m.currentMastery < 50 && m.confidence > 70 && m.trend !== 'improving'
		);

		for (const mastery of struggling.slice(0, 1)) {
			recommendations.push({
				id: `struggle-${mastery.topic}-${Date.now()}`,
				userId,
				type: 'content',
				priority: 'high',
				title: `Extra Practice: ${mastery.topic}`,
				description:
					"You're finding this topic challenging. Let's build your confidence with more practice.",
				actionUrl: `/practice/${mastery.topic}`,
				expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
				isDismissed: false,
				createdAt: new Date(),
			});
		}

		return recommendations;
	}

	private generateActivityRecommendations(
		userId: string,
		recentActivity: AdaptiveLearningMetrics[],
		profile?: UserLearningProfile
	): PersonalizedRecommendation[] {
		const recommendations: PersonalizedRecommendation[] = [];

		// Analyze recent performance trends
		if (recentActivity.length >= 5) {
			const recentScores = recentActivity.slice(-5).map((a) => a.performanceScore);
			const trend = this.calculateTrend(recentScores);

			if (trend === 'improving') {
				recommendations.push({
					id: `improvement-${Date.now()}`,
					userId,
					type: 'learning_style',
					priority: 'low',
					title: 'Great Progress!',
					description: "You're showing consistent improvement. Consider trying harder challenges.",
					isDismissed: false,
					createdAt: new Date(),
				});
			} else if (trend === 'declining') {
				recommendations.push({
					id: `decline-${Date.now()}`,
					userId,
					type: 'study_plan_review',
					priority: 'medium',
					title: 'Adjust Your Study Approach',
					description:
						'Your recent performance suggests you might benefit from a different study strategy.',
					actionUrl: '/settings/learning',
					expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
					isDismissed: false,
					createdAt: new Date(),
				});
			}
		}

		// Time-based recommendations
		const now = new Date();
		const hour = now.getHours();

		if (profile?.sessionDuration) {
			if (hour >= 22 || hour <= 6) {
				recommendations.push({
					id: `late-night-${Date.now()}`,
					userId,
					type: 'break',
					priority: 'medium',
					title: 'Consider Rest',
					description: 'Late night studying might not be as effective. Consider getting some rest.',
					isDismissed: false,
					createdAt: new Date(),
				});
			}
		}

		return recommendations;
	}

	private generateMotivationalRecommendations(
		userId: string,
		masteryLevels: MasteryCalculation[]
	): PersonalizedRecommendation[] {
		const recommendations: PersonalizedRecommendation[] = [];

		// Calculate overall progress
		if (masteryLevels.length > 0) {
			const avgMastery =
				masteryLevels.reduce((sum, m) => sum + m.currentMastery, 0) / masteryLevels.length;
			const highPerformers = masteryLevels.filter((m) => m.currentMastery >= 80).length;

			if (avgMastery >= 75 && highPerformers >= 3) {
				recommendations.push({
					id: `excellent-${Date.now()}`,
					userId,
					type: 'learning_style',
					priority: 'low',
					title: 'Outstanding Performance!',
					description: "You're excelling across multiple topics. Keep up the excellent work!",
					isDismissed: false,
					createdAt: new Date(),
				});
			} else if (avgMastery >= 60 && masteryLevels.some((m) => m.trend === 'improving')) {
				recommendations.push({
					id: `steady-${Date.now()}`,
					userId,
					type: 'learning_style',
					priority: 'low',
					title: 'Steady Progress',
					description: "You're making good progress. Consistency is key to success!",
					isDismissed: false,
					createdAt: new Date(),
				});
			}
		}

		// Streak-based motivation
		const recentActivity = masteryLevels.filter(
			(m) => m.lastPracticed && Date.now() - m.lastPracticed.getTime() < 7 * 24 * 60 * 60 * 1000
		);

		if (recentActivity.length >= 5) {
			recommendations.push({
				id: `consistency-${Date.now()}`,
				userId,
				type: 'learning_style',
				priority: 'low',
				title: 'Building Good Habits',
				description: "You've been consistently studying. This habit will lead to great results!",
				isDismissed: false,
				createdAt: new Date(),
			});
		}

		return recommendations;
	}

	private prioritizeRecommendations(
		newRecommendations: PersonalizedRecommendation[],
		activeRecommendations: PersonalizedRecommendation[]
	): PersonalizedRecommendation[] {
		// Remove duplicates based on type and title similarity
		const filtered = newRecommendations.filter(
			(newRec) =>
				!activeRecommendations.some(
					(activeRec) =>
						activeRec.type === newRec.type && this.similarity(activeRec.title, newRec.title) > 0.8
				)
		);

		// Sort by priority
		const priorityOrder = { high: 3, medium: 2, low: 1 };
		return filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
	}

	private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
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

	private similarity(str1: string, str2: string): number {
		const longer = str1.length > str2.length ? str1 : str2;
		const shorter = str1.length > str2.length ? str2 : str1;

		if (longer.length === 0) return 1.0;

		const distance = this.levenshteinDistance(longer, shorter);
		return (longer.length - distance) / longer.length;
	}

	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
		for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1,
					matrix[j - 1][i] + 1,
					matrix[j - 1][i - 1] + indicator
				);
			}
		}

		return matrix[str2.length][str1.length];
	}
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();

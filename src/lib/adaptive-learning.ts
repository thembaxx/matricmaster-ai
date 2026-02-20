/**
 * Adaptive Learning System
 *
 * Provides personalized learning recommendations based on user performance
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TopicPerformance {
	topic: string;
	subjectId: number;
	questionsAttempted: number;
	questionsCorrect: number;
	accuracy: number;
	averageTimeSeconds: number;
	lastPracticed: Date | null;
	consecutiveCorrect: number;
}

export interface AdaptiveRecommendation {
	subjectId: number;
	topic: string;
	recommendedDifficulty: Difficulty;
	priority: 'high' | 'medium' | 'low';
	reason: string;
	questionCount: number;
}

export interface LearningStats {
	totalQuestions: number;
	totalCorrect: number;
	overallAccuracy: number;
	weakTopics: TopicPerformance[];
	strongTopics: TopicPerformance[];
	improvingTopics: TopicPerformance[];
	needsReview: TopicPerformance[];
}

const MASTERY_LEVELS = {
	beginner: { min: 0, max: 30 },
	learning: { min: 30, max: 60 },
	practiced: { min: 60, max: 80 },
	mastered: { min: 80, max: 100 },
};

export function calculateRecommendedDifficulty(
	accuracy: number,
	consecutiveCorrect: number,
	averageTimeSeconds: number
): Difficulty {
	if (accuracy < 50) {
		return 'easy';
	}

	if (accuracy > 80 && consecutiveCorrect >= 3) {
		return 'hard';
	}

	if (accuracy > 80 && averageTimeSeconds < 30) {
		return 'hard';
	}

	return 'medium';
}

export function categorizeTopicPerformance(
	topic: TopicPerformance
): 'weak' | 'strong' | 'improving' | 'needs_review' {
	if (topic.questionsAttempted < 3) {
		return 'needs_review';
	}

	if (topic.accuracy < 50) {
		return 'weak';
	}

	if (topic.accuracy > 80 && topic.consecutiveCorrect >= 3) {
		return 'strong';
	}

	if (topic.consecutiveCorrect >= 2) {
		return 'improving';
	}

	return 'weak';
}

export function calculateMasteryLevel(performance: TopicPerformance): number {
	if (performance.questionsAttempted === 0) {
		return 0;
	}

	const accuracyWeight = 0.5;
	const consistencyWeight = 0.3;
	const recencyWeight = 0.2;

	const accuracyScore = performance.accuracy;

	let consistencyScore = 0;
	if (performance.questionsAttempted > 0) {
		consistencyScore = Math.min(
			(performance.consecutiveCorrect / performance.questionsAttempted) * 100,
			100
		);
	}

	let recencyScore = 50;
	if (performance.lastPracticed) {
		const daysSinceLastPractice = Math.floor(
			(Date.now() - new Date(performance.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
		);
		if (daysSinceLastPractice <= 1) {
			recencyScore = 100;
		} else if (daysSinceLastPractice <= 3) {
			recencyScore = 80;
		} else if (daysSinceLastPractice <= 7) {
			recencyScore = 60;
		} else if (daysSinceLastPractice <= 14) {
			recencyScore = 40;
		} else {
			recencyScore = 20;
		}
	}

	return Math.round(
		accuracyScore * accuracyWeight +
			consistencyScore * consistencyWeight +
			recencyScore * recencyWeight
	);
}

export function prioritizeTopics(topicPerformances: TopicPerformance[]): AdaptiveRecommendation[] {
	const recommendations: AdaptiveRecommendation[] = [];

	const categorized = topicPerformances.map((tp) => ({
		...tp,
		category: categorizeTopicPerformance(tp),
		mastery: calculateMasteryLevel(tp),
	}));

	const weakTopics = categorized.filter((t) => t.category === 'weak');
	const needsReview = categorized.filter((t) => t.category === 'needs_review');
	const improving = categorized.filter((t) => t.category === 'improving');

	weakTopics.sort((a, b) => a.accuracy - b.accuracy);
	needsReview.sort((a, b) => {
		if (!a.lastPracticed) return -1;
		if (!b.lastPracticed) return 1;
		return new Date(a.lastPracticed).getTime() - new Date(b.lastPracticed).getTime();
	});

	for (const topic of weakTopics.slice(0, 3)) {
		recommendations.push({
			subjectId: topic.subjectId,
			topic: topic.topic,
			recommendedDifficulty: 'easy',
			priority: 'high',
			reason: `Low accuracy (${Math.round(topic.accuracy)}%). Start with easier questions to build understanding.`,
			questionCount: 5,
		});
	}

	for (const topic of needsReview.slice(0, 2)) {
		recommendations.push({
			subjectId: topic.subjectId,
			topic: topic.topic,
			recommendedDifficulty: 'medium',
			priority: 'medium',
			reason: 'Topic needs more practice to determine your level.',
			questionCount: 3,
		});
	}

	for (const topic of improving.slice(0, 2)) {
		recommendations.push({
			subjectId: topic.subjectId,
			topic: topic.topic,
			recommendedDifficulty: calculateRecommendedDifficulty(
				topic.accuracy,
				topic.consecutiveCorrect,
				topic.averageTimeSeconds
			),
			priority: 'low',
			reason: 'Good progress! Keep practicing to master this topic.',
			questionCount: 3,
		});
	}

	return recommendations;
}

export function generateStudyPlan(
	recommendations: AdaptiveRecommendation[],
	totalQuestions = 10
): AdaptiveRecommendation[] {
	const plan: AdaptiveRecommendation[] = [];
	let remainingQuestions = totalQuestions;

	const highPriority = recommendations.filter((r) => r.priority === 'high');
	const mediumPriority = recommendations.filter((r) => r.priority === 'medium');
	const lowPriority = recommendations.filter((r) => r.priority === 'low');

	for (const rec of highPriority) {
		if (remainingQuestions <= 0) break;
		const questionsToAssign = Math.min(rec.questionCount, remainingQuestions);
		plan.push({ ...rec, questionCount: questionsToAssign });
		remainingQuestions -= questionsToAssign;
	}

	for (const rec of mediumPriority) {
		if (remainingQuestions <= 0) break;
		const questionsToAssign = Math.min(rec.questionCount, remainingQuestions);
		plan.push({ ...rec, questionCount: questionsToAssign });
		remainingQuestions -= questionsToAssign;
	}

	for (const rec of lowPriority) {
		if (remainingQuestions <= 0) break;
		const questionsToAssign = Math.min(rec.questionCount, remainingQuestions);
		plan.push({ ...rec, questionCount: questionsToAssign });
		remainingQuestions -= questionsToAssign;
	}

	return plan;
}

export function calculateLearningVelocity(
	recentSessions: { date: Date; questionsCorrect: number; questionsAttempted: number }[]
): number {
	if (recentSessions.length < 2) {
		return 0;
	}

	const sorted = [...recentSessions].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	if (sorted.length < 2) return 0;

	const midPoint = Math.floor(sorted.length / 2);
	const firstHalf = sorted.slice(0, midPoint);
	const secondHalf = sorted.slice(midPoint);

	const firstAccuracy =
		firstHalf.reduce((sum, s) => sum + s.questionsCorrect, 0) /
		Math.max(
			firstHalf.reduce((sum, s) => sum + s.questionsAttempted, 0),
			1
		);

	const secondAccuracy =
		secondHalf.reduce((sum, s) => sum + s.questionsCorrect, 0) /
		Math.max(
			secondHalf.reduce((sum, s) => sum + s.questionsAttempted, 0),
			1
		);

	return Math.round((secondAccuracy - firstAccuracy) * 100);
}

export function shouldAdjustDifficulty(
	currentDifficulty: Difficulty,
	recentAccuracy: number,
	streakLength: number
): { adjust: boolean; newDifficulty?: Difficulty; reason: string } {
	if (recentAccuracy < 40 && currentDifficulty !== 'easy') {
		return {
			adjust: true,
			newDifficulty: 'easy',
			reason: 'Struggling with current difficulty. Switching to easier questions.',
		};
	}

	if (recentAccuracy > 90 && streakLength >= 5 && currentDifficulty !== 'hard') {
		return {
			adjust: true,
			newDifficulty: 'hard',
			reason: 'Excellent performance! Challenging you with harder questions.',
		};
	}

	return { adjust: false, reason: '' };
}

export function getMasteryLabel(masteryLevel: number): string {
	if (masteryLevel < MASTERY_LEVELS.beginner.max) return 'Beginner';
	if (masteryLevel < MASTERY_LEVELS.learning.max) return 'Learning';
	if (masteryLevel < MASTERY_LEVELS.practiced.max) return 'Practiced';
	return 'Mastered';
}

export function estimateTimeToMastery(
	currentMastery: number,
	averageDailyQuestions: number
): number {
	if (currentMastery >= 80) return 0;

	const remainingProgress = 80 - currentMastery;
	const questionsPerPercent = 5;
	const totalQuestionsNeeded = remainingProgress * questionsPerPercent;

	if (averageDailyQuestions <= 0) return -1;

	return Math.ceil(totalQuestionsNeeded / averageDailyQuestions);
}

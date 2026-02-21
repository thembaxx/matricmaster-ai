import { describe, expect, it } from 'vitest';
import {
	calculateLearningVelocity,
	calculateMasteryLevel,
	calculateRecommendedDifficulty,
	categorizeTopicPerformance,
	estimateTimeToMastery,
	generateStudyPlan,
	getMasteryLabel,
	prioritizeTopics,
	shouldAdjustDifficulty,
	type TopicPerformance,
} from '@/lib/adaptive-learning';

describe('adaptive-learning', () => {
	describe('calculateRecommendedDifficulty', () => {
		it('should return easy for low accuracy', () => {
			expect(calculateRecommendedDifficulty(40, 0, 60)).toBe('easy');
		});

		it('should return hard for high accuracy with good streak', () => {
			expect(calculateRecommendedDifficulty(85, 5, 30)).toBe('hard');
		});

		it('should return hard for high accuracy with fast time', () => {
			expect(calculateRecommendedDifficulty(85, 2, 20)).toBe('hard');
		});

		it('should return medium for moderate accuracy', () => {
			expect(calculateRecommendedDifficulty(65, 2, 45)).toBe('medium');
		});
	});

	describe('categorizeTopicPerformance', () => {
		const createTopic = (overrides: Partial<TopicPerformance> = {}): TopicPerformance => ({
			topic: 'Test Topic',
			subjectId: 1,
			questionsAttempted: 10,
			questionsCorrect: 7,
			accuracy: 70,
			averageTimeSeconds: 30,
			lastPracticed: new Date(),
			consecutiveCorrect: 2,
			...overrides,
		});

		it('should categorize as needs_review for few attempts', () => {
			const topic = createTopic({ questionsAttempted: 2 });
			expect(categorizeTopicPerformance(topic)).toBe('needs_review');
		});

		it('should categorize as weak for low accuracy', () => {
			const topic = createTopic({ accuracy: 40, questionsAttempted: 5 });
			expect(categorizeTopicPerformance(topic)).toBe('weak');
		});

		it('should categorize as strong for high accuracy and streak', () => {
			const topic = createTopic({ accuracy: 85, consecutiveCorrect: 4, questionsAttempted: 10 });
			expect(categorizeTopicPerformance(topic)).toBe('strong');
		});

		it('should categorize as improving for moderate progress', () => {
			const topic = createTopic({ accuracy: 60, consecutiveCorrect: 3, questionsAttempted: 5 });
			expect(categorizeTopicPerformance(topic)).toBe('improving');
		});
	});

	describe('calculateMasteryLevel', () => {
		const createTopic = (overrides: Partial<TopicPerformance> = {}): TopicPerformance => ({
			topic: 'Test Topic',
			subjectId: 1,
			questionsAttempted: 10,
			questionsCorrect: 8,
			accuracy: 80,
			averageTimeSeconds: 30,
			lastPracticed: new Date(),
			consecutiveCorrect: 3,
			...overrides,
		});

		it('should return 0 for no attempts', () => {
			const topic = createTopic({ questionsAttempted: 0 });
			expect(calculateMasteryLevel(topic)).toBe(0);
		});

		it('should give higher score for recent practice', () => {
			const recentTopic = createTopic({ lastPracticed: new Date() });
			const oldTopic = createTopic({
				lastPracticed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			});

			expect(calculateMasteryLevel(recentTopic)).toBeGreaterThan(calculateMasteryLevel(oldTopic));
		});

		it('should give higher score for better accuracy', () => {
			const highAccuracy = createTopic({ accuracy: 90 });
			const lowAccuracy = createTopic({ accuracy: 50 });

			expect(calculateMasteryLevel(highAccuracy)).toBeGreaterThan(
				calculateMasteryLevel(lowAccuracy)
			);
		});
	});

	describe('prioritizeTopics', () => {
		const createTopics = (): TopicPerformance[] => [
			{
				topic: 'Weak Topic 1',
				subjectId: 1,
				questionsAttempted: 10,
				questionsCorrect: 3,
				accuracy: 30,
				averageTimeSeconds: 60,
				lastPracticed: new Date(),
				consecutiveCorrect: 0,
			},
			{
				topic: 'Needs Review',
				subjectId: 1,
				questionsAttempted: 2,
				questionsCorrect: 1,
				accuracy: 50,
				averageTimeSeconds: 45,
				lastPracticed: null,
				consecutiveCorrect: 0,
			},
			{
				topic: 'Improving',
				subjectId: 1,
				questionsAttempted: 5,
				questionsCorrect: 4,
				accuracy: 80,
				averageTimeSeconds: 30,
				lastPracticed: new Date(),
				consecutiveCorrect: 2,
			},
		];

		it('should prioritize weak topics first', () => {
			const recommendations = prioritizeTopics(createTopics());
			expect(recommendations[0].priority).toBe('high');
			expect(recommendations[0].topic).toBe('Weak Topic 1');
		});

		it('should recommend easy difficulty for weak topics', () => {
			const recommendations = prioritizeTopics(createTopics());
			const weakTopicRec = recommendations.find((r) => r.topic === 'Weak Topic 1');
			expect(weakTopicRec?.recommendedDifficulty).toBe('easy');
		});

		it('should include reason for each recommendation', () => {
			const recommendations = prioritizeTopics(createTopics());
			for (const rec of recommendations) {
				expect(rec.reason).toBeTruthy();
				expect(typeof rec.reason).toBe('string');
			}
		});
	});

	describe('generateStudyPlan', () => {
		it('should distribute questions across recommendations', () => {
			const recommendations = [
				{
					subjectId: 1,
					topic: 'A',
					recommendedDifficulty: 'easy' as const,
					priority: 'high' as const,
					reason: '',
					questionCount: 5,
				},
				{
					subjectId: 1,
					topic: 'B',
					recommendedDifficulty: 'medium' as const,
					priority: 'medium' as const,
					reason: '',
					questionCount: 5,
				},
			];

			const plan = generateStudyPlan(recommendations, 8);
			const totalQuestions = plan.reduce((sum, r) => sum + r.questionCount, 0);
			expect(totalQuestions).toBe(8);
		});

		it('should prioritize high priority items', () => {
			const recommendations = [
				{
					subjectId: 1,
					topic: 'High',
					recommendedDifficulty: 'easy' as const,
					priority: 'high' as const,
					reason: '',
					questionCount: 10,
				},
				{
					subjectId: 1,
					topic: 'Low',
					recommendedDifficulty: 'medium' as const,
					priority: 'low' as const,
					reason: '',
					questionCount: 10,
				},
			];

			const plan = generateStudyPlan(recommendations, 5);
			expect(plan[0].topic).toBe('High');
		});
	});

	describe('calculateLearningVelocity', () => {
		it('should return 0 for less than 2 sessions', () => {
			expect(calculateLearningVelocity([])).toBe(0);
			expect(
				calculateLearningVelocity([
					{ date: new Date(), questionsCorrect: 5, questionsAttempted: 10 },
				])
			).toBe(0);
		});

		it('should calculate positive velocity for improving accuracy', () => {
			const sessions = [
				{ date: new Date('2024-01-01'), questionsCorrect: 3, questionsAttempted: 10 },
				{ date: new Date('2024-01-02'), questionsCorrect: 4, questionsAttempted: 10 },
				{ date: new Date('2024-01-03'), questionsCorrect: 7, questionsAttempted: 10 },
				{ date: new Date('2024-01-04'), questionsCorrect: 8, questionsAttempted: 10 },
			];

			const velocity = calculateLearningVelocity(sessions);
			expect(velocity).toBeGreaterThan(0);
		});
	});

	describe('shouldAdjustDifficulty', () => {
		it('should suggest easier for low accuracy', () => {
			const result = shouldAdjustDifficulty('hard', 35, 2);
			expect(result.adjust).toBe(true);
			expect(result.newDifficulty).toBe('easy');
		});

		it('should suggest harder for excellent performance', () => {
			const result = shouldAdjustDifficulty('easy', 95, 6);
			expect(result.adjust).toBe(true);
			expect(result.newDifficulty).toBe('hard');
		});

		it('should not adjust for moderate performance', () => {
			const result = shouldAdjustDifficulty('medium', 70, 3);
			expect(result.adjust).toBe(false);
		});
	});

	describe('getMasteryLabel', () => {
		it('should return correct labels', () => {
			expect(getMasteryLabel(10)).toBe('Beginner');
			expect(getMasteryLabel(45)).toBe('Learning');
			expect(getMasteryLabel(70)).toBe('Practiced');
			expect(getMasteryLabel(90)).toBe('Mastered');
		});
	});

	describe('estimateTimeToMastery', () => {
		it('should return 0 for already mastered', () => {
			expect(estimateTimeToMastery(85, 10)).toBe(0);
		});

		it('should estimate days based on daily questions', () => {
			const days = estimateTimeToMastery(50, 10);
			expect(days).toBeGreaterThan(0);
		});

		it('should return -1 for no daily questions', () => {
			expect(estimateTimeToMastery(50, 0)).toBe(-1);
		});
	});
});

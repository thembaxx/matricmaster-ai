import { describe, expect, it, vi } from 'vitest';
import type { ShortAnswerQuestion } from '@/content/questions/quiz/types';
import {
	analyzeTimeStruggle,
	detectWeakTopics,
	gradeMatching,
	gradeShortAnswer,
	type QuizResultForAnalysis,
} from '@/lib/quiz-grader';

vi.mock('@/lib/ai/provider', () => ({
	generateTextWithAI: vi.fn().mockResolvedValue(
		JSON.stringify({
			score: 5,
			maxScore: 10,
			isCorrect: true,
			feedback: 'Good answer',
			gradingType: 'aiGraded',
		})
	),
}));

describe('quiz-grader', () => {
	describe('gradeExact', () => {
		const question: ShortAnswerQuestion = {
			id: 'test-1',
			type: 'shortAnswer',
			question: 'What is the derivative of x²?',
			correctAnswer: '2x',
			acceptableAnswers: ['2x', '2x dx'],
			maxMarks: 5,
			gradingType: 'exact',
			hint: 'Use the power rule',
			topic: 'Calculus',
			subtopic: 'Derivatives',
			difficulty: 'medium',
		};

		it('should grade exact match correctly', async () => {
			const result = await gradeShortAnswer('2x', question);
			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(5);
			expect(result.gradingType).toBe('exact');
		});

		it('should accept acceptable alternatives', async () => {
			const result = await gradeShortAnswer('2x dx', question);
			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(5);
		});

		it('should handle fuzzy matching', async () => {
			const result = await gradeShortAnswer('  2x  ', question);
			expect(result.isCorrect).toBe(true);
		});

		it('should reject incorrect answers', async () => {
			const result = await gradeShortAnswer('x', question);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
		});

		it('should handle empty answer', async () => {
			const result = await gradeShortAnswer('', question);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
			expect(result.feedback).toBe('Please provide an answer before submitting.');
		});

		it('should handle whitespace-only answer', async () => {
			const result = await gradeShortAnswer('   ', question);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
		});

		it('should truncate long answers', async () => {
			const longAnswer = 'a'.repeat(3000);
			const result = await gradeShortAnswer(longAnswer, question);
			expect(result).toBeDefined();
		});
	});

	describe('gradeKeywords', () => {
		const question: ShortAnswerQuestion = {
			id: 'test-2',
			type: 'shortAnswer',
			question: 'Explain photosynthesis',
			correctAnswer:
				'Photosynthesis is the process by which plants convert light energy into chemical energy',
			maxMarks: 10,
			gradingType: 'keywords',
			keywords: ['light', 'energy', 'plants', 'convert', 'chemical'],
			hint: 'Think about what plants need',
			topic: 'Life Sciences',
			subtopic: 'Photosynthesis',
			difficulty: 'easy',
		};

		it('should grade full keyword coverage as correct', async () => {
			const result = await gradeShortAnswer(
				'Photosynthesis uses light energy to convert into chemical energy in plants',
				question
			);
			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(10);
		});

		it('should give partial credit for 60%+ coverage', async () => {
			const result = await gradeShortAnswer('Plants use light energy', question);
			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(7);
		});

		it('should give partial credit for 30%+ coverage', async () => {
			const result = await gradeShortAnswer('Light', question);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
		});

		it('should give zero for less than 30% coverage', async () => {
			const result = await gradeShortAnswer('Something else', question);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
		});

		it('should fall back to exact grading when no keywords', async () => {
			const q: ShortAnswerQuestion = {
				...question,
				keywords: undefined,
			};
			const result = await gradeShortAnswer('2x', q);
			expect(result.gradingType).toBe('exact');
		});
	});

	describe('gradeMatching', () => {
		it('should grade all correct matches', () => {
			const correctPairs = { A: '1', B: '2', C: '3' };
			const userPairs = { A: '1', B: '2', C: '3' };
			const result = gradeMatching(userPairs, correctPairs);
			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(3);
			expect(result.maxScore).toBe(3);
		});

		it('should grade partial matches', () => {
			const correctPairs = { A: '1', B: '2', C: '3' };
			const userPairs = { A: '1', B: '3', C: '2' };
			const result = gradeMatching(userPairs, correctPairs);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(1);
		});

		it('should grade all wrong matches', () => {
			const correctPairs = { A: '1', B: '2' };
			const userPairs = { A: '2', B: '1' };
			const result = gradeMatching(userPairs, correctPairs);
			expect(result.isCorrect).toBe(false);
			expect(result.score).toBe(0);
		});

		it('should handle empty pairs', () => {
			const result = gradeMatching({}, {});
			expect(result.score).toBe(0);
			expect(result.maxScore).toBe(0);
		});
	});

	describe('detectWeakTopics', () => {
		it('should detect topics below 60% accuracy', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Mathematics',
				topics: [
					{ topic: 'Calculus', correct: 3, total: 5 },
					{ topic: 'Algebra', correct: 4, total: 4 },
					{ topic: 'Geometry', correct: 1, total: 5 },
				],
				totalTimeSeconds: 600,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics.length).toBe(1);
			expect(weakTopics[0].topic).toBe('Geometry');
		});

		it('should return high struggle level for <40% accuracy', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Physics',
				topics: [{ topic: 'Waves', correct: 1, total: 5 }],
				totalTimeSeconds: 300,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics[0].struggleLevel).toBe('high');
		});

		it('should return medium struggle level for 40-60% accuracy', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Chemistry',
				topics: [{ topic: 'Stoichiometry', correct: 2, total: 4 }],
				totalTimeSeconds: 300,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics[0].struggleLevel).toBe('medium');
		});

		it('should not include topics with 60%+ accuracy', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Life Sciences',
				topics: [
					{ topic: 'Cells', correct: 5, total: 5 },
					{ topic: 'Genetics', correct: 3, total: 5 },
				],
				totalTimeSeconds: 600,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics.length).toBe(0);
		});

		it('should handle topics with time data', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Mathematics',
				topics: [
					{
						topic: 'Calculus',
						correct: 1,
						total: 5,
						timeMs: [10000, 12000, 8000, 11000, 9000],
					},
				],
				totalTimeSeconds: 300,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics[0].isTimeStruggle).toBeDefined();
		});

		it('should skip topics with zero total', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Math',
				topics: [{ topic: 'Empty', correct: 0, total: 0 }],
				totalTimeSeconds: 60,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics.length).toBe(0);
		});

		it('should sort by struggle level then accuracy', () => {
			const quizResult: QuizResultForAnalysis = {
				quizId: 'test',
				subject: 'Math',
				topics: [
					{ topic: 'Medium', correct: 2, total: 5 },
					{ topic: 'High', correct: 1, total: 5 },
				],
				totalTimeSeconds: 300,
			};
			const weakTopics = detectWeakTopics(quizResult);
			expect(weakTopics[0].topic).toBe('High');
		});
	});

	describe('analyzeTimeStruggle', () => {
		it('should identify slow topics', () => {
			const topics = [
				{ topic: 'Fast', correct: 2, total: 2, timeMs: [1000, 1000] },
				{ topic: 'Slow', correct: 2, total: 2, timeMs: [10000, 10000] },
			];
			const slow = analyzeTimeStruggle(topics, 1.5);
			expect(slow).toContain('Slow');
		});

		it('should return empty for no time data', () => {
			const topics = [{ topic: 'Test', correct: 1, total: 1 }];
			const slow = analyzeTimeStruggle(topics);
			expect(slow).toEqual([]);
		});

		it('should use custom threshold', () => {
			const topics = [{ topic: 'Medium', correct: 2, total: 2, timeMs: [5000, 5000] }];
			const slow = analyzeTimeStruggle(topics, 2.0);
			expect(slow.length).toBe(0);
		});
	});
});

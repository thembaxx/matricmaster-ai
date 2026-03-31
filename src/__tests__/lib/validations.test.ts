import { describe, expect, it } from 'vitest';
import {
	bookmarkSchema,
	chatMessageSchema,
	feedbackSchema,
	flashcardGenerationSchema,
	practiceProblemSchema,
	profileUpdateSchema,
	quizAnswerSchema,
	searchSchema,
	studyPlanSchema,
} from '@/lib/validations';

describe('validations', () => {
	describe('chatMessageSchema', () => {
		it('should validate valid chat message', () => {
			const result = chatMessageSchema.safeParse({
				message: 'Hello, help me with math',
			});
			expect(result.success).toBe(true);
		});

		it('should validate chat message with subject', () => {
			const result = chatMessageSchema.safeParse({
				message: 'Help with calculus',
				subject: 'Mathematics',
			});
			expect(result.success).toBe(true);
		});

		it('should validate chat message with history', () => {
			const result = chatMessageSchema.safeParse({
				message: 'Tell me more',
				history: [
					{ role: 'user', content: 'What is calculus?' },
					{ role: 'assistant', content: 'Calculus is...' },
				],
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty message', () => {
			const result = chatMessageSchema.safeParse({
				message: '',
			});
			expect(result.success).toBe(false);
		});

		it('should reject message over 2000 characters', () => {
			const result = chatMessageSchema.safeParse({
				message: 'a'.repeat(2001),
			});
			expect(result.success).toBe(false);
		});
	});

	describe('practiceProblemSchema', () => {
		it('should validate valid practice problem request', () => {
			const result = practiceProblemSchema.safeParse({
				context: 'Solve for x',
				subject: 'Mathematics',
				difficulty: 'medium',
				count: 5,
			});
			expect(result.success).toBe(true);
		});

		it('should use defaults for optional fields', () => {
			const result = practiceProblemSchema.parse({
				context: 'Test problem',
			});
			expect(result.difficulty).toBeUndefined();
			expect(result.count).toBeUndefined();
		});

		it('should reject invalid difficulty', () => {
			const result = practiceProblemSchema.safeParse({
				context: 'Test',
				difficulty: 'invalid',
			});
			expect(result.success).toBe(false);
		});

		it('should reject count over 10', () => {
			const result = practiceProblemSchema.safeParse({
				context: 'Test',
				count: 11,
			});
			expect(result.success).toBe(false);
		});

		it('should reject count less than 1', () => {
			const result = practiceProblemSchema.safeParse({
				context: 'Test',
				count: 0,
			});
			expect(result.success).toBe(false);
		});
	});

	describe('flashcardGenerationSchema', () => {
		it('should validate valid flashcard generation request', () => {
			const result = flashcardGenerationSchema.safeParse({
				context: 'Photosynthesis process',
				subject: 'Life Sciences',
				count: 10,
			});
			expect(result.success).toBe(true);
		});

		it('should reject count over 20', () => {
			const result = flashcardGenerationSchema.safeParse({
				context: 'Test',
				count: 21,
			});
			expect(result.success).toBe(false);
		});
	});

	describe('studyPlanSchema', () => {
		it('should validate valid study plan', () => {
			const result = studyPlanSchema.safeParse({
				subjects: ['Mathematics', 'Physics'],
				weeklyHours: 10,
				targetExamDate: '2024-11-01',
				goal: 'Pass matric',
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty subjects', () => {
			const result = studyPlanSchema.safeParse({
				subjects: [],
				weeklyHours: 5,
			});
			expect(result.success).toBe(false);
		});

		it('should reject weekly hours over 40', () => {
			const result = studyPlanSchema.safeParse({
				subjects: ['Math'],
				weeklyHours: 41,
			});
			expect(result.success).toBe(false);
		});

		it('should reject weekly hours under 1', () => {
			const result = studyPlanSchema.safeParse({
				subjects: ['Math'],
				weeklyHours: 0,
			});
			expect(result.success).toBe(false);
		});
	});

	describe('quizAnswerSchema', () => {
		it('should validate valid quiz answer', () => {
			const result = quizAnswerSchema.safeParse({
				questionId: 'q1',
				answer: '2x',
				timeSpent: 30000,
			});
			expect(result.success).toBe(true);
		});

		it('should accept answer without timeSpent', () => {
			const result = quizAnswerSchema.safeParse({
				questionId: 'q1',
				answer: 'answer',
			});
			expect(result.success).toBe(true);
		});
	});

	describe('bookmarkSchema', () => {
		it('should validate valid bookmark', () => {
			const result = bookmarkSchema.safeParse({
				referenceId: 'ref123',
				bookmarkType: 'question',
			});
			expect(result.success).toBe(true);
		});

		it('should validate bookmark with note', () => {
			const result = bookmarkSchema.safeParse({
				referenceId: 'ref123',
				bookmarkType: 'flashcard',
				note: 'Important concept',
			});
			expect(result.success).toBe(true);
		});

		it('should reject invalid bookmark type', () => {
			const result = bookmarkSchema.safeParse({
				referenceId: 'ref123',
				bookmarkType: 'invalid',
			});
			expect(result.success).toBe(false);
		});
	});

	describe('profileUpdateSchema', () => {
		it('should validate valid profile update', () => {
			const result = profileUpdateSchema.safeParse({
				name: 'John Doe',
				bio: 'Student',
				preferredSubjects: ['Math', 'Physics'],
				studyGoals: 'Get into university',
			});
			expect(result.success).toBe(true);
		});

		it('should accept empty object', () => {
			const result = profileUpdateSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it('should reject name over 100 characters', () => {
			const result = profileUpdateSchema.safeParse({
				name: 'a'.repeat(101),
			});
			expect(result.success).toBe(false);
		});

		it('should reject bio over 500 characters', () => {
			const result = profileUpdateSchema.safeParse({
				bio: 'a'.repeat(501),
			});
			expect(result.success).toBe(false);
		});
	});

	describe('searchSchema', () => {
		it('should validate valid search', () => {
			const result = searchSchema.safeParse({
				query: 'calculus derivatives',
				subject: 'Mathematics',
				difficulty: 'medium',
				type: 'question',
				page: 1,
				limit: 20,
			});
			expect(result.success).toBe(true);
		});

		it('should reject empty query', () => {
			const result = searchSchema.safeParse({
				query: '',
			});
			expect(result.success).toBe(false);
		});

		it('should reject query over 200 characters', () => {
			const result = searchSchema.safeParse({
				query: 'a'.repeat(201),
			});
			expect(result.success).toBe(false);
		});

		it('should reject limit over 50', () => {
			const result = searchSchema.safeParse({
				query: 'test',
				limit: 51,
			});
			expect(result.success).toBe(false);
		});
	});

	describe('feedbackSchema', () => {
		it('should validate valid feedback', () => {
			const result = feedbackSchema.safeParse({
				type: 'bug',
				title: 'Login issue',
				description: 'Cannot login with Google',
				email: 'test@example.com',
			});
			expect(result.success).toBe(true);
		});

		it('should reject invalid feedback type', () => {
			const result = feedbackSchema.safeParse({
				type: 'invalid',
				title: 'Test',
				description: 'Test description',
			});
			expect(result.success).toBe(false);
		});

		it('should reject empty title', () => {
			const result = feedbackSchema.safeParse({
				type: 'bug',
				title: '',
				description: 'Description',
			});
			expect(result.success).toBe(false);
		});

		it('should reject title over 200 characters', () => {
			const result = feedbackSchema.safeParse({
				type: 'bug',
				title: 'a'.repeat(201),
				description: 'Desc',
			});
			expect(result.success).toBe(false);
		});

		it('should reject description over 2000 characters', () => {
			const result = feedbackSchema.safeParse({
				type: 'bug',
				title: 'Title',
				description: 'a'.repeat(2001),
			});
			expect(result.success).toBe(false);
		});

		it('should accept feedback without email', () => {
			const result = feedbackSchema.safeParse({
				type: 'feature',
				title: 'New feature',
				description: 'Add dark mode',
			});
			expect(result.success).toBe(true);
		});
	});
});

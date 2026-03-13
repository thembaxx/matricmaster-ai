import { z } from 'zod';

export const chatMessageSchema = z.object({
	message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
	subject: z.string().optional(),
	history: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string(),
			})
		)
		.optional(),
	includeSuggestions: z.boolean().optional(),
	stream: z.boolean().optional(),
});

export const practiceProblemSchema = z.object({
	context: z.string().min(1, 'Context is required'),
	subject: z.string().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	count: z.number().int().min(1).max(10).optional(),
});

export const flashcardGenerationSchema = z.object({
	context: z.string().min(1, 'Context is required'),
	subject: z.string().optional(),
	count: z.number().int().min(1).max(20).optional(),
});

export const studyPlanSchema = z.object({
	subjects: z.array(z.string()).min(1, 'At least one subject is required'),
	weeklyHours: z.number().int().min(1).max(40),
	targetExamDate: z.string().optional(),
	goal: z.string().optional(),
});

export const quizAnswerSchema = z.object({
	questionId: z.string(),
	answer: z.string(),
	timeSpent: z.number().int().optional(),
});

export const bookmarkSchema = z.object({
	referenceId: z.string(),
	bookmarkType: z.enum(['question', 'past_paper', 'study_note', 'flashcard']),
	note: z.string().optional(),
});

export const profileUpdateSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	bio: z.string().max(500).optional(),
	preferredSubjects: z.array(z.string()).optional(),
	studyGoals: z.string().max(1000).optional(),
});

export const searchSchema = z.object({
	query: z.string().min(1, 'Search query is required').max(200),
	filters: z
		.object({
			subject: z.string().optional(),
			difficulty: z.string().optional(),
			type: z.string().optional(),
		})
		.optional(),
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().max(50).optional(),
});

export const feedbackSchema = z.object({
	type: z.enum(['bug', 'feature', 'improvement', 'other']),
	title: z.string().min(1, 'Title is required').max(200),
	description: z.string().min(1, 'Description is required').max(2000),
	email: z.string().email().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type PracticeProblemInput = z.infer<typeof practiceProblemSchema>;
export type FlashcardGenerationInput = z.infer<typeof flashcardGenerationSchema>;
export type StudyPlanInput = z.infer<typeof studyPlanSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

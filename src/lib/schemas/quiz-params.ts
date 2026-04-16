import { z } from 'zod';

export const SubjectEnum = z.enum([
	'mathematics',
	'physics',
	'chemistry',
	'life-sciences',
	'english',
	'afrikaans',
	'geography',
	'history',
	'accounting',
	'economics',
	'lo',
	'business-studies',
]);

export const DifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);

export const QuizParamsSchema = z.object({
	subject: SubjectEnum.optional(),
	category: z.string().optional(),
	difficulty: DifficultyEnum.optional(),
	limit: z.coerce.number().min(1).max(100).default(10),
	offset: z.coerce.number().min(0).default(0),
	sessionId: z.string().uuid().optional(),
});

export type QuizParams = z.infer<typeof QuizParamsSchema>;
export type Subject = z.infer<typeof SubjectEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;

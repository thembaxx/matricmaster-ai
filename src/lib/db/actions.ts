'use server';

import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type DbType, dbManager } from './index';
import type {
	NewOption,
	NewQuestion,
	NewSubject,
	Option,
	Question,
	SearchHistory,
	Subject,
} from './schema';
import { options, questions, searchHistory, subjects } from './schema';

const createSubjectSchema = z.object({
	name: z.string().min(1).max(50),
	description: z.string().max(500).optional(),
	curriculumCode: z.string().min(1).max(20),
	isActive: z.boolean().optional(),
});

const createQuestionSchema = z.object({
	subjectId: z.number().int().positive(),
	questionText: z.string().min(1).max(2000),
	imageUrl: z.string().url().max(500).optional().nullable(),
	gradeLevel: z.number().int().min(1).max(12),
	topic: z.string().min(1).max(100),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	marks: z.number().int().min(1).max(100).optional(),
	hint: z.string().max(500).optional().nullable(),
});

const createOptionSchema = z.object({
	optionText: z.string().min(1).max(1000),
	isCorrect: z.boolean(),
	optionLetter: z.string().length(1),
	explanation: z.string().max(1000).optional().nullable(),
});

const userIdSchema = z.string().min(1);
const querySchema = z.string().min(1).max(500);

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

const mockSubjects: Subject[] = [
	{
		id: 1,
		name: 'Mathematics',
		description: 'Core mathematics curriculum',
		curriculumCode: 'MAT',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 2,
		name: 'Physical Sciences',
		description: 'Physics and Chemistry',
		curriculumCode: 'PHY',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 3,
		name: 'Life Sciences',
		description: 'Biology and related sciences',
		curriculumCode: 'BIO',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 4,
		name: 'English',
		description: 'First Additional Language',
		curriculumCode: 'ENG',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 5,
		name: 'Geography',
		description: 'Earth science and social studies',
		curriculumCode: 'GEO',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockQuestions: Question[] = [
	{
		id: '1',
		subjectId: 1,
		questionText: 'Solve for x: 2x + 5 = 15',
		imageUrl: null,
		gradeLevel: 12,
		topic: 'Algebra',
		difficulty: 'easy',
		marks: 2,
		hint: 'Subtract 5 from both sides',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		subjectId: 1,
		questionText: 'Find the derivative of f(x) = x² + 3x + 2',
		imageUrl: null,
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'medium',
		marks: 3,
		hint: 'Use the power rule',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockOptions: Option[] = [
	{
		id: '1a',
		questionId: '1',
		optionText: 'x = 5',
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct!',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '1b',
		questionId: '1',
		optionText: 'x = 10',
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2a',
		questionId: '2',
		optionText: "f'(x) = 2x + 3",
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct!',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2b',
		questionId: '2',
		optionText: "f'(x) = x + 3",
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect',
		isActive: true,
		createdAt: new Date(),
	},
];

export async function createSubjectAction(data: NewSubject): Promise<Subject> {
	const validated = createSubjectSchema.parse(data);
	const db = await getDb();
	const [subject] = await db
		.insert(subjects)
		.values(validated as NewSubject)
		.returning();
	return subject;
}

export async function getSubjectsAction(): Promise<Subject[]> {
	try {
		const db = await getDb();
		return db
			.select()
			.from(subjects)
			.where(eq(subjects.isActive, true))
			.orderBy(asc(subjects.name));
	} catch {
		return mockSubjects;
	}
}

export async function getSubjectByIdAction(id: number): Promise<Subject | null> {
	try {
		const db = await getDb();
		const [subject] = await db
			.select()
			.from(subjects)
			.where(and(eq(subjects.id, id), eq(subjects.isActive, true)))
			.limit(1);
		return subject ?? null;
	} catch {
		return mockSubjects.find((s) => s.id === id) ?? null;
	}
}

export async function updateSubjectAction(
	id: number,
	data: Partial<NewSubject>
): Promise<Subject | null> {
	const db = await getDb();
	const [subject] = await db
		.update(subjects)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return subject ?? null;
}

export async function softDeleteSubjectAction(id: number): Promise<boolean> {
	const db = await getDb();
	const result = await db
		.update(subjects)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteSubjectAction(id: number): Promise<boolean> {
	const db = await getDb();
	const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return result.length > 0;
}

export interface QuestionFilters {
	subjectId?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	gradeLevel?: number;
	topic?: string;
	isActive?: boolean;
}

export async function createQuestionAction(
	questionData: NewQuestion,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
	const validatedQuestion = createQuestionSchema.parse(questionData);
	const validatedOptions = z.array(createOptionSchema).min(2).parse(optionsData);
	const db = await getDb();

	return db.transaction(async (tx) => {
		const [question] = await tx
			.insert(questions)
			.values(validatedQuestion as NewQuestion)
			.returning();
		const insertedOptions = await Promise.all(
			validatedOptions.map((opt) =>
				tx
					.insert(options)
					.values({ ...opt, questionId: question.id } as NewOption)
					.returning()
			)
		);
		return { ...question, options: insertedOptions.flat() };
	});
}

export async function getQuestionsAction(filters: QuestionFilters = {}): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [];

		if (filters.subjectId !== undefined)
			conditions.push(eq(questions.subjectId, filters.subjectId));
		if (filters.difficulty !== undefined)
			conditions.push(eq(questions.difficulty, filters.difficulty));
		if (filters.gradeLevel !== undefined)
			conditions.push(eq(questions.gradeLevel, filters.gradeLevel));
		if (filters.topic !== undefined) conditions.push(eq(questions.topic, filters.topic));
		conditions.push(eq(questions.isActive, filters.isActive ?? true));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(desc(questions.createdAt));
	} catch {
		return [];
	}
}

export async function getQuestionWithOptionsAction(
	id: string
): Promise<(Question & { options: Option[] }) | null> {
	try {
		const db = await getDb();
		const [question] = await db
			.select()
			.from(questions)
			.where(and(eq(questions.id, id), eq(questions.isActive, true)))
			.limit(1);

		if (!question) return null;

		const opts = await db
			.select()
			.from(options)
			.where(and(eq(options.questionId, id), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));

		return { ...question, options: opts };
	} catch {
		const mockQuestion = mockQuestions.find((q) => q.id === id);
		if (!mockQuestion) return null;
		return { ...mockQuestion, options: mockOptions.filter((o) => o.questionId === id) };
	}
}

export async function getRandomQuestionsAction(
	subjectId: number,
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [eq(questions.subjectId, subjectId), eq(questions.isActive, true)];
		if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(sql`random()`)
			.limit(count);
	} catch {
		let filtered = mockQuestions.filter((q) => q.subjectId === subjectId);
		if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
		return filtered.slice(0, count);
	}
}

export async function getRandomQuestionsFromMultipleSubjectsAction(
	subjectIds: number[],
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [eq(questions.isActive, true)];
		if (subjectIds.length > 0) {
			conditions.push(inArray(questions.subjectId, subjectIds));
		}
		if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

		return db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(sql`random()`)
			.limit(count);
	} catch {
		let filtered = mockQuestions.filter((q) => subjectIds.includes(q.subjectId));
		if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
		return filtered.slice(0, count);
	}
}

export async function updateQuestionAction(
	id: string,
	data: Partial<NewQuestion>
): Promise<Question | null> {
	const db = await getDb();
	const [question] = await db
		.update(questions)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(questions.id, id))
		.returning();
	return question ?? null;
}

export async function softDeleteQuestionAction(id: string): Promise<boolean> {
	const db = await getDb();
	await db.transaction(async (tx) => {
		await tx
			.update(questions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(questions.id, id));
		await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
	});
	return true;
}

export async function hardDeleteQuestionAction(id: string): Promise<boolean> {
	const db = await getDb();
	const result = await db.delete(questions).where(eq(questions.id, id)).returning();
	return result.length > 0;
}

export async function getOptionsByQuestionIdAction(questionId: string): Promise<Option[]> {
	try {
		const db = await getDb();
		return db
			.select()
			.from(options)
			.where(and(eq(options.questionId, questionId), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));
	} catch {
		return mockOptions.filter((o) => o.questionId === questionId);
	}
}

export async function addSearchHistoryAction(
	userId: string,
	query: string
): Promise<SearchHistory> {
	const validUserId = userIdSchema.parse(userId);
	const validQuery = querySchema.parse(query);
	const db = await getDb();

	const existing = await db
		.select()
		.from(searchHistory)
		.where(and(eq(searchHistory.userId, validUserId), eq(searchHistory.query, validQuery)))
		.limit(1);

	if (existing.length > 0) {
		await db
			.delete(searchHistory)
			.where(and(eq(searchHistory.userId, validUserId), eq(searchHistory.query, validQuery)));
	}

	const [newSearch] = await db
		.insert(searchHistory)
		.values({ userId: validUserId, query: validQuery })
		.returning();

	const allSearches = await db
		.select()
		.from(searchHistory)
		.where(eq(searchHistory.userId, validUserId))
		.orderBy(desc(searchHistory.createdAt));

	if (allSearches.length > 5) {
		await Promise.all(
			allSearches
				.slice(5)
				.map((search) => db.delete(searchHistory).where(eq(searchHistory.id, search.id)))
		);
	}

	return newSearch;
}

export async function getSearchHistoryAction(userId: string): Promise<SearchHistory[]> {
	const validUserId = userIdSchema.parse(userId);
	try {
		const db = await getDb();
		return db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, validUserId))
			.orderBy(desc(searchHistory.createdAt))
			.limit(5);
	} catch {
		return [];
	}
}

export async function deleteSearchHistoryItemAction(id: string, userId: string): Promise<boolean> {
	const db = await getDb();
	const result = await db
		.delete(searchHistory)
		.where(and(eq(searchHistory.id, id), eq(searchHistory.userId, userId)))
		.returning();
	return result.length > 0;
}

export async function clearSearchHistoryAction(userId: string): Promise<boolean> {
	const db = await getDb();
	const result = await db.delete(searchHistory).where(eq(searchHistory.userId, userId)).returning();
	return result.length > 0;
}

export async function seedDatabaseAction(): Promise<{ success: boolean; message: string }> {
	try {
		const { seedDatabase } = await import('./seed/index');
		await seedDatabase();
		return { success: true, message: 'Database seeded successfully!' };
	} catch (error) {
		console.error('Seed action error:', error);
		return { success: false, message: error instanceof Error ? error.message : 'Seeding failed' };
	}
}

'use server';

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { dbManager } from './index';
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

async function getConnectedDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		console.warn('⚠️ Database connection failed, using mock data');
		return null;
	}
	return dbManager.getDb();
}

// Mock data for when database is unavailable
const mockSubjects: Subject[] = [
	{
		id: 1,
		name: 'Mathematics',
		description: 'Core mathematics curriculum for Grade 12',
		curriculumCode: 'MAT',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 2,
		name: 'Physical Sciences',
		description: 'Physics and Chemistry combined',
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

export async function createSubjectAction(data: NewSubject): Promise<Subject> {
	const db = await getConnectedDb();
	if (!db) {
		throw new Error('Database not available');
	}
	const [subject] = await db.insert(subjects).values(data).returning();
	return subject;
}

export async function getSubjectsAction(): Promise<Subject[]> {
	const db = await getConnectedDb();
	if (!db) {
		return mockSubjects;
	}
	return db.select().from(subjects).where(eq(subjects.isActive, true)).orderBy(asc(subjects.name));
}

export async function getSubjectByIdAction(id: number): Promise<Subject | null> {
	const db = await getConnectedDb();
	if (!db) {
		return mockSubjects.find((subject) => subject.id === id) || null;
	}
	const [subject] = await db
		.select()
		.from(subjects)
		.where(and(eq(subjects.id, id), eq(subjects.isActive, true)))
		.limit(1);
	return subject || null;
}

export async function updateSubjectAction(
	id: number,
	data: Partial<NewSubject>
): Promise<Subject | null> {
	const db = await getConnectedDb();
	if (!db) {
		return null;
	}
	const [subject] = await db
		.update(subjects)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return subject || null;
}

export async function softDeleteSubjectAction(id: number): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db
		.update(subjects)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteSubjectAction(id: number): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return result.length > 0;
}

export async function createQuestionAction(
	questionData: NewQuestion,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
	const db = await getConnectedDb();
	if (!db) {
		throw new Error('Database not available');
	}
	return await db.transaction(async (tx) => {
		const [question] = await tx.insert(questions).values(questionData).returning();

		const opts = await Promise.all(
			optionsData.map((opt) =>
				tx
					.insert(options)
					.values({ ...opt, questionId: question.id })
					.returning()
			)
		);

		return {
			...question,
			options: opts.flat(),
		};
	});
}

export interface QuestionFilters {
	subjectId?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	gradeLevel?: number;
	topic?: string;
	isActive?: boolean;
}

export async function getQuestionsAction(filters: QuestionFilters = {}): Promise<Question[]> {
	const db = await getConnectedDb();
	if (!db) {
		return [];
	}
	const conditions = [];

	if (filters.subjectId !== undefined) {
		conditions.push(eq(questions.subjectId, filters.subjectId));
	}

	if (filters.difficulty !== undefined) {
		conditions.push(eq(questions.difficulty, filters.difficulty));
	}

	if (filters.gradeLevel !== undefined) {
		conditions.push(eq(questions.gradeLevel, filters.gradeLevel));
	}

	if (filters.topic !== undefined) {
		conditions.push(eq(questions.topic, filters.topic));
	}

	conditions.push(eq(questions.isActive, filters.isActive ?? true));

	return db
		.select()
		.from(questions)
		.where(and(...conditions))
		.orderBy(desc(questions.createdAt));
}

export async function getQuestionWithOptionsAction(
	id: string
): Promise<(Question & { options: Option[] }) | null> {
	const db = await getConnectedDb();
	if (!db) {
		// Check mock data for the question
		const mockQuestion = mockQuestions.find((q) => q.id === id);
		if (!mockQuestion) return null;

		const mockOpts = mockOptions.filter((option) => option.questionId === id);
		return {
			...mockQuestion,
			options: mockOpts,
		};
	}
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

	return {
		...question,
		options: opts,
	};
}

// Mock questions data
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
		hint: 'Subtract 5 from both sides first',
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
		hint: 'Use the power rule for differentiation',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

// Mock options data
const mockOptions: Option[] = [
	{
		id: '1a',
		questionId: '1',
		optionText: 'x = 5',
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct! 2x + 5 = 15 → 2x = 10 → x = 5',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '1b',
		questionId: '1',
		optionText: 'x = 10',
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect. You need to subtract 5 first.',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2a',
		questionId: '2',
		optionText: "f'(x) = 2x + 3",
		isCorrect: true,
		optionLetter: 'A',
		explanation: 'Correct! Using the power rule: d/dx(x²) = 2x and d/dx(3x) = 3',
		isActive: true,
		createdAt: new Date(),
	},
	{
		id: '2b',
		questionId: '2',
		optionText: "f'(x) = x + 3",
		isCorrect: false,
		optionLetter: 'B',
		explanation: 'Incorrect. The derivative of x² is 2x, not x.',
		isActive: true,
		createdAt: new Date(),
	},
];

export async function getRandomQuestionsAction(
	subjectId: number,
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
	const db = await getConnectedDb();
	if (!db) {
		// Filter mock questions by subject and difficulty
		let filteredQuestions = mockQuestions.filter((q) => q.subjectId === subjectId);
		if (difficulty) {
			filteredQuestions = filteredQuestions.filter((q) => q.difficulty === difficulty);
		}
		// Return limited number of questions
		return filteredQuestions.slice(0, count);
	}

	const conditions = [eq(questions.subjectId, subjectId), eq(questions.isActive, true)];

	if (difficulty) {
		conditions.push(eq(questions.difficulty, difficulty));
	}

	return db
		.select()
		.from(questions)
		.where(and(...conditions))
		.orderBy(sql`random()`)
		.limit(count);
}

export async function updateQuestionAction(
	id: string,
	data: Partial<NewQuestion>
): Promise<Question | null> {
	const db = await getConnectedDb();
	if (!db) {
		return null;
	}
	const [question] = await db
		.update(questions)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(questions.id, id))
		.returning();
	return question || null;
}

export async function softDeleteQuestionAction(id: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	await db.transaction(async (tx) => {
		await tx
			.update(questions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(questions.id, id));

		await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
	});
	return true;
}

export async function getRandomQuestionsFromMultipleSubjectsAction(
	subjectIds: number[],
	totalCount: number
): Promise<Question[]> {
	const db = await getConnectedDb();
	if (!db) {
		// Return mock questions from the specified subjects
		const mockQuestionsFiltered = mockQuestions.filter((q) => subjectIds.includes(q.subjectId));
		return mockQuestionsFiltered.sort(() => Math.random() - 0.5).slice(0, totalCount);
	}
	// For simplicity, we'll get questions from each subject proportionally
	const questionsPerSubject = Math.ceil(totalCount / subjectIds.length);
	const allQuestions: Question[] = [];

	for (const subjectId of subjectIds) {
		const subjectQuestions = await db
			.select()
			.from(questions)
			.where(and(eq(questions.subjectId, subjectId), eq(questions.isActive, true)))
			.orderBy(sql`random()`)
			.limit(questionsPerSubject);

		allQuestions.push(...subjectQuestions);
	}

	// Shuffle and limit to totalCount
	return allQuestions.sort(() => Math.random() - 0.5).slice(0, totalCount);
}

export async function hardDeleteQuestionAction(id: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db.delete(questions).where(eq(questions.id, id)).returning();
	return result.length > 0;
}

export async function createOptionsAction(
	questionId: string,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Option[]> {
	const db = await getConnectedDb();
	if (!db) {
		throw new Error('Database not available');
	}
	const opts = await Promise.all(
		optionsData.map((opt) =>
			db
				.insert(options)
				.values({ ...opt, questionId })
				.returning()
		)
	);
	return opts.flat();
}

export async function getOptionsByQuestionIdAction(questionId: string): Promise<Option[]> {
	const db = await getConnectedDb();
	if (!db) {
		return mockOptions.filter((option) => option.questionId === questionId);
	}
	return db
		.select()
		.from(options)
		.where(and(eq(options.questionId, questionId), eq(options.isActive, true)))
		.orderBy(asc(options.optionLetter));
}

export async function updateOptionAction(
	id: string,
	data: Partial<NewOption>
): Promise<Option | null> {
	const db = await getConnectedDb();
	if (!db) {
		return null;
	}
	const [option] = await db.update(options).set(data).where(eq(options.id, id)).returning();
	return option || null;
}

export async function softDeleteOptionAction(id: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db
		.update(options)
		.set({ isActive: false })
		.where(eq(options.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteOptionAction(id: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db.delete(options).where(eq(options.id, id)).returning();
	return result.length > 0;
}

export async function getSubjectWithQuestionsAction(
	subjectId: number,
	includeInactive = false
): Promise<Subject & { questions: (Question & { options: Option[] })[] }> {
	const db = await getConnectedDb();
	if (!db) {
		// Return mock data
		const mockSubject = mockSubjects.find((s) => s.id === subjectId);
		if (!mockSubject) throw new Error('Subject not found');

		const mockQuestionsForSubject = mockQuestions.filter((q) => q.subjectId === subjectId);
		const questionsWithOptions = mockQuestionsForSubject.map((q) => ({
			...q,
			options: mockOptions.filter((opt) => opt.questionId === q.id),
		}));

		return {
			...mockSubject,
			questions: questionsWithOptions,
		};
	}
	const [subject] = await db
		.select()
		.from(subjects)
		.where(
			includeInactive
				? eq(subjects.id, subjectId)
				: and(eq(subjects.id, subjectId), eq(subjects.isActive, true))
		)
		.limit(1);

	if (!subject) throw new Error('Subject not found');

	const questionList = await db
		.select()
		.from(questions)
		.where(
			and(
				eq(questions.subjectId, subjectId),
				includeInactive ? undefined : eq(questions.isActive, true)
			)
		);

	const questionsWithOptions = await Promise.all(
		questionList.map(async (q) => {
			const opts = await getOptionsByQuestionIdAction(q.id);
			return { ...q, options: opts };
		})
	);

	return {
		...subject,
		questions: questionsWithOptions,
	};
}

export async function cloneQuestionAction(
	questionId: string,
	modifications?: Partial<NewQuestion>
): Promise<Question & { options: Option[] }> {
	const original = await getQuestionWithOptionsAction(questionId);
	if (!original) throw new Error('Question not found');

	const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...questionData } = original;

	return createQuestionAction(
		{ ...questionData, ...modifications },
		original.options.map(({ id, questionId, createdAt, ...opt }) => opt)
	);
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

// ============================================================================
// SEARCH HISTORY ACTIONS
// ============================================================================

export async function addSearchHistoryAction(
	userId: string,
	query: string
): Promise<SearchHistory> {
	const db = await getConnectedDb();
	if (!db) {
		throw new Error('Database not available');
	}
	// Check if the exact same query already exists for this user
	const existing = await db
		.select()
		.from(searchHistory)
		.where(and(eq(searchHistory.userId, userId), eq(searchHistory.query, query)))
		.limit(1);

	// If exists, delete it first (so we can re-add it as most recent)
	if (existing.length > 0) {
		await db
			.delete(searchHistory)
			.where(and(eq(searchHistory.userId, userId), eq(searchHistory.query, query)));
	}

	// Add the new search history entry
	const [newSearch] = await db.insert(searchHistory).values({ userId, query }).returning();

	// Keep only the 5 most recent searches
	const allSearches = await db
		.select()
		.from(searchHistory)
		.where(eq(searchHistory.userId, userId))
		.orderBy(desc(searchHistory.createdAt));

	// If more than 5, delete the oldest ones
	if (allSearches.length > 5) {
		const toDelete = allSearches.slice(5);
		await Promise.all(
			toDelete.map((search) => db.delete(searchHistory).where(eq(searchHistory.id, search.id)))
		);
	}

	return newSearch;
}

export async function getSearchHistoryAction(userId: string): Promise<SearchHistory[]> {
	const db = await getConnectedDb();
	if (!db) {
		return [];
	}
	return db
		.select()
		.from(searchHistory)
		.where(eq(searchHistory.userId, userId))
		.orderBy(desc(searchHistory.createdAt))
		.limit(5);
}

export async function deleteSearchHistoryItemAction(id: string, userId: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db
		.delete(searchHistory)
		.where(and(eq(searchHistory.id, id), eq(searchHistory.userId, userId)))
		.returning();
	return result.length > 0;
}

export async function clearSearchHistoryAction(userId: string): Promise<boolean> {
	const db = await getConnectedDb();
	if (!db) {
		return false;
	}
	const result = await db.delete(searchHistory).where(eq(searchHistory.userId, userId)).returning();
	return result.length > 0;
}

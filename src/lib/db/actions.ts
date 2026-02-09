'use server';

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
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

export async function createSubjectAction(data: NewSubject): Promise<Subject> {
	const [subject] = await db.insert(subjects).values(data).returning();
	return subject;
}

export async function getSubjectsAction(): Promise<Subject[]> {
	return db.select().from(subjects).where(eq(subjects.isActive, true)).orderBy(asc(subjects.name));
}

export async function getSubjectByIdAction(id: number): Promise<Subject | null> {
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
	const [subject] = await db
		.update(subjects)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return subject || null;
}

export async function softDeleteSubjectAction(id: number): Promise<boolean> {
	const result = await db
		.update(subjects)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteSubjectAction(id: number): Promise<boolean> {
	const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return result.length > 0;
}

export async function createQuestionAction(
	questionData: NewQuestion,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
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

export async function getRandomQuestionsAction(
	subjectId: number,
	count: number,
	difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
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
	const [question] = await db
		.update(questions)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(questions.id, id))
		.returning();
	return question || null;
}

export async function softDeleteQuestionAction(id: string): Promise<boolean> {
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
	const result = await db.delete(questions).where(eq(questions.id, id)).returning();
	return result.length > 0;
}

export async function createOptionsAction(
	questionId: string,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Option[]> {
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
	const [option] = await db.update(options).set(data).where(eq(options.id, id)).returning();
	return option || null;
}

export async function softDeleteOptionAction(id: string): Promise<boolean> {
	const result = await db
		.update(options)
		.set({ isActive: false })
		.where(eq(options.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteOptionAction(id: string): Promise<boolean> {
	const result = await db.delete(options).where(eq(options.id, id)).returning();
	return result.length > 0;
}

export async function getSubjectWithQuestionsAction(
	subjectId: number,
	includeInactive = false
): Promise<Subject & { questions: (Question & { options: Option[] })[] }> {
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

	const { id, createdAt, updatedAt, ...questionData } = original;

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
	return db
		.select()
		.from(searchHistory)
		.where(eq(searchHistory.userId, userId))
		.orderBy(desc(searchHistory.createdAt))
		.limit(5);
}

export async function deleteSearchHistoryItemAction(id: string, userId: string): Promise<boolean> {
	const result = await db
		.delete(searchHistory)
		.where(and(eq(searchHistory.id, id), eq(searchHistory.userId, userId)))
		.returning();
	return result.length > 0;
}

export async function clearSearchHistoryAction(userId: string): Promise<boolean> {
	const result = await db.delete(searchHistory).where(eq(searchHistory.userId, userId)).returning();
	return result.length > 0;
}

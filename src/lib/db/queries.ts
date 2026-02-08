import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import type { NewOption, NewQuestion, NewSubject, Option, Question, Subject } from './schema';
import { options, questions, subjects } from './schema';

// ============================================================================
// SUBJECT OPERATIONS
// ============================================================================

export async function createSubject(data: NewSubject): Promise<Subject> {
	const [subject] = await db.insert(subjects).values(data).returning();
	return subject;
}

export async function getSubjects(): Promise<Subject[]> {
	return db.select().from(subjects).where(eq(subjects.isActive, true)).orderBy(asc(subjects.name));
}

export async function getSubjectById(id: number): Promise<Subject | null> {
	const [subject] = await db
		.select()
		.from(subjects)
		.where(and(eq(subjects.id, id), eq(subjects.isActive, true)))
		.limit(1);
	return subject || null;
}

export async function updateSubject(
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

export async function softDeleteSubject(id: number): Promise<boolean> {
	const result = await db
		.update(subjects)
		.set({ isActive: false, updatedAt: new Date() })
		.where(eq(subjects.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteSubject(id: number): Promise<boolean> {
	const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
	return result.length > 0;
}

// ============================================================================
// QUESTION OPERATIONS
// ============================================================================

export interface QuestionFilters {
	subjectId?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	gradeLevel?: number;
	topic?: string;
	isActive?: boolean;
}

export async function createQuestion(
	questionData: NewQuestion,
	optionsData: Omit<NewOption, 'questionId'>[]
): Promise<Question & { options: Option[] }> {
	return await db.transaction(async (tx) => {
		// Insert question
		const [question] = await tx.insert(questions).values(questionData).returning();

		// Insert options
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

export async function getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
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

	// Default to active questions only
	conditions.push(eq(questions.isActive, filters.isActive ?? true));

	return db
		.select()
		.from(questions)
		.where(and(...conditions))
		.orderBy(desc(questions.createdAt));
}

export async function getQuestionWithOptions(
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

export async function getRandomQuestions(
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

export async function updateQuestion(
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

export async function softDeleteQuestion(id: string): Promise<boolean> {
	await db.transaction(async (tx) => {
		// Soft delete question
		await tx
			.update(questions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(questions.id, id));

		// Soft delete associated options
		await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
	});
	return true;
}

export async function hardDeleteQuestion(id: string): Promise<boolean> {
	// Cascade delete will handle options
	const result = await db.delete(questions).where(eq(questions.id, id)).returning();
	return result.length > 0;
}

// ============================================================================
// OPTION OPERATIONS
// ============================================================================

export async function createOptions(
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

export async function getOptionsByQuestionId(questionId: string): Promise<Option[]> {
	return db
		.select()
		.from(options)
		.where(and(eq(options.questionId, questionId), eq(options.isActive, true)))
		.orderBy(asc(options.optionLetter));
}

export async function updateOption(id: string, data: Partial<NewOption>): Promise<Option | null> {
	const [option] = await db.update(options).set(data).where(eq(options.id, id)).returning();
	return option || null;
}

export async function softDeleteOption(id: string): Promise<boolean> {
	const result = await db
		.update(options)
		.set({ isActive: false })
		.where(eq(options.id, id))
		.returning();
	return result.length > 0;
}

export async function hardDeleteOption(id: string): Promise<boolean> {
	const result = await db.delete(options).where(eq(options.id, id)).returning();
	return result.length > 0;
}

// ============================================================================
// COMPOSITE OPERATIONS
// ============================================================================

export async function getSubjectWithQuestions(
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
			const opts = await getOptionsByQuestionId(q.id);
			return { ...q, options: opts };
		})
	);

	return {
		...subject,
		questions: questionsWithOptions,
	};
}

export async function cloneQuestion(
	questionId: string,
	modifications?: Partial<NewQuestion>
): Promise<Question & { options: Option[] }> {
	const original = await getQuestionWithOptions(questionId);
	if (!original) throw new Error('Question not found');

	const { id, createdAt, updatedAt, ...questionData } = original;

	return createQuestion(
		{ ...questionData, ...modifications },
		original.options.map(({ id, questionId, createdAt, ...opt }) => opt)
	);
}

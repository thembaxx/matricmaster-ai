import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';
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

export interface QuestionFilters {
	subjectId?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	gradeLevel?: number;
	topic?: string;
	isActive?: boolean;
}

export class DatabaseRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async createSubject(data: NewSubject): Promise<Subject> {
		const [subject] = await this.db.insert(subjects).values(data).returning();
		return subject;
	}

	async getSubjects(activeOnly = true): Promise<Subject[]> {
		const conditions = activeOnly ? [eq(subjects.isActive, true)] : [];
		return this.db
			.select()
			.from(subjects)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(subjects.name));
	}

	async getSubjectById(id: number, activeOnly = true): Promise<Subject | null> {
		const conditions = [eq(subjects.id, id)];
		if (activeOnly) conditions.push(eq(subjects.isActive, true));

		const [subject] = await this.db
			.select()
			.from(subjects)
			.where(and(...conditions))
			.limit(1);
		return subject ?? null;
	}

	async updateSubject(id: number, data: Partial<NewSubject>): Promise<Subject | null> {
		const [subject] = await this.db
			.update(subjects)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(subjects.id, id))
			.returning();
		return subject ?? null;
	}

	async softDeleteSubject(id: number): Promise<boolean> {
		const result = await this.db
			.update(subjects)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(subjects.id, id))
			.returning();
		return result.length > 0;
	}

	async hardDeleteSubject(id: number): Promise<boolean> {
		const result = await this.db.delete(subjects).where(eq(subjects.id, id)).returning();
		return result.length > 0;
	}

	async createQuestion(
		questionData: NewQuestion,
		optionsData: Omit<NewOption, 'questionId'>[]
	): Promise<Question & { options: Option[] }> {
		return this.db.transaction(async (tx) => {
			const [question] = await tx.insert(questions).values(questionData).returning();

			const insertedOptions = await Promise.all(
				optionsData.map((opt) =>
					tx
						.insert(options)
						.values({ ...opt, questionId: question.id })
						.returning()
				)
			);

			return { ...question, options: insertedOptions.flat() };
		});
	}

	async getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
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

		return this.db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(desc(questions.createdAt));
	}

	async getQuestionWithOptions(id: string): Promise<(Question & { options: Option[] }) | null> {
		const [question] = await this.db
			.select()
			.from(questions)
			.where(and(eq(questions.id, id), eq(questions.isActive, true)))
			.limit(1);

		if (!question) return null;

		const opts = await this.db
			.select()
			.from(options)
			.where(and(eq(options.questionId, id), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));

		return { ...question, options: opts };
	}

	async getRandomQuestions(
		subjectId: number,
		count: number,
		difficulty?: 'easy' | 'medium' | 'hard'
	): Promise<Question[]> {
		const conditions = [eq(questions.subjectId, subjectId), eq(questions.isActive, true)];
		if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

		return this.db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(sql`random()`)
			.limit(count);
	}

	async updateQuestion(id: string, data: Partial<NewQuestion>): Promise<Question | null> {
		const [question] = await this.db
			.update(questions)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(questions.id, id))
			.returning();
		return question ?? null;
	}

	async softDeleteQuestion(id: string): Promise<boolean> {
		await this.db.transaction(async (tx) => {
			await tx
				.update(questions)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(questions.id, id));
			await tx.update(options).set({ isActive: false }).where(eq(options.questionId, id));
		});
		return true;
	}

	async hardDeleteQuestion(id: string): Promise<boolean> {
		const result = await this.db.delete(questions).where(eq(questions.id, id)).returning();
		return result.length > 0;
	}

	async getOptionsByQuestionId(questionId: string): Promise<Option[]> {
		return this.db
			.select()
			.from(options)
			.where(and(eq(options.questionId, questionId), eq(options.isActive, true)))
			.orderBy(asc(options.optionLetter));
	}

	async addSearchHistory(userId: string, query: string): Promise<SearchHistory> {
		const existing = await this.db
			.select()
			.from(searchHistory)
			.where(and(eq(searchHistory.userId, userId), eq(searchHistory.query, query)))
			.limit(1);

		if (existing.length > 0) {
			await this.db
				.delete(searchHistory)
				.where(and(eq(searchHistory.userId, userId), eq(searchHistory.query, query)));
		}

		const [newSearch] = await this.db.insert(searchHistory).values({ userId, query }).returning();

		const allSearches = await this.db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId))
			.orderBy(desc(searchHistory.createdAt));

		if (allSearches.length > 5) {
			await Promise.all(
				allSearches
					.slice(5)
					.map((search) => this.db.delete(searchHistory).where(eq(searchHistory.id, search.id)))
			);
		}

		return newSearch;
	}

	async getSearchHistory(userId: string, limit = 5): Promise<SearchHistory[]> {
		return this.db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId))
			.orderBy(desc(searchHistory.createdAt))
			.limit(limit);
	}

	async deleteSearchHistoryItem(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.delete(searchHistory)
			.where(and(eq(searchHistory.id, id), eq(searchHistory.userId, userId)))
			.returning();
		return result.length > 0;
	}

	async clearSearchHistory(userId: string): Promise<boolean> {
		const result = await this.db
			.delete(searchHistory)
			.where(eq(searchHistory.userId, userId))
			.returning();
		return result.length > 0;
	}
}

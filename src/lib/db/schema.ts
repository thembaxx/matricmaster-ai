import { relations } from 'drizzle-orm';
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

// Import better-auth schema for consistency
import {
	accounts,
	accountsRelations,
	sessions,
	sessionsRelations,
	users,
	usersRelations,
	verifications,
} from './better-auth-schema';

// Export better-auth tables with consistent naming
export { users as user, sessions as session, accounts as account, verifications as verification };
export { usersRelations, sessionsRelations, accountsRelations };

// Anonymous users table for better-auth anonymous plugin
export const anonymous_users = pgTable('anonymous_users', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// QUIZ SYSTEM TABLES
// ============================================================================

export const subjects = pgTable('subjects', {
	id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	description: text('description'),
	curriculumCode: varchar('curriculum_code', { length: 20 }).notNull(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const questions = pgTable(
	'questions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		subjectId: integer('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' }),
		questionText: text('question_text').notNull(),
		imageUrl: text('image_url'),
		gradeLevel: integer('grade_level').notNull(),
		topic: varchar('topic', { length: 100 }).notNull(),
		difficulty: varchar('difficulty', { length: 20 }).notNull().default('medium'),
		marks: integer('marks').notNull().default(2),
		hint: text('hint'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		subjectIdIdx: index('questions_subject_id_idx').on(table.subjectId),
		gradeLevelIdx: index('questions_grade_level_idx').on(table.gradeLevel),
		topicIdx: index('questions_topic_idx').on(table.topic),
		difficultyIdx: index('questions_difficulty_idx').on(table.difficulty),
		isActiveIdx: index('questions_is_active_idx').on(table.isActive),
		subjectActiveIdx: index('questions_subject_active_idx').on(table.subjectId, table.isActive),
	})
);

export const options = pgTable('options', {
	id: uuid('id').defaultRandom().primaryKey(),
	questionId: uuid('question_id')
		.notNull()
		.references(() => questions.id, { onDelete: 'cascade' }),
	optionText: text('option_text').notNull(),
	isCorrect: boolean('is_correct').notNull().default(false),
	optionLetter: varchar('option_letter', { length: 1 }).notNull(),
	explanation: text('explanation'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const subjectsRelations = relations(subjects, ({ many }) => ({
	questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [questions.subjectId],
		references: [subjects.id],
	}),
	options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
	question: one(questions, {
		fields: [options.questionId],
		references: [questions.id],
	}),
}));

// ============================================================================
// SEARCH HISTORY TABLE
// ============================================================================

export const searchHistory = pgTable(
	'search_history',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		query: text('query').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('search_history_user_id_idx').on(table.userId),
		createdAtIdx: index('search_history_created_at_idx').on(table.createdAt),
	})
);

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
	user: one(users, {
		fields: [searchHistory.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert & {
	hint?: string | null;
};

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;

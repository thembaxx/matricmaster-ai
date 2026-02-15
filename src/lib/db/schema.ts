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

// ============================================================================
// PAST PAPERS TABLE (AI-extracted questions from PDFs)
// ============================================================================

export const pastPapers = pgTable(
	'past_papers',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		paperId: varchar('paper_id', { length: 100 }).notNull().unique(),
		originalPdfUrl: text('original_pdf_url').notNull(),
		storedPdfUrl: text('stored_pdf_url'),
		subject: varchar('subject', { length: 100 }).notNull(),
		paper: varchar('paper', { length: 20 }).notNull(),
		year: integer('year').notNull(),
		month: varchar('month', { length: 20 }).notNull(),
		isExtracted: boolean('is_extracted').notNull().default(false),
		extractedQuestions: text('extracted_questions'),
		instructions: text('instructions'),
		totalMarks: integer('total_marks'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		paperIdIdx: index('past_papers_paper_id_idx').on(table.paperId),
		isExtractedIdx: index('past_papers_is_extracted_idx').on(table.isExtracted),
		subjectIdx: index('past_papers_subject_idx').on(table.subject),
		yearIdx: index('past_papers_year_idx').on(table.year),
	})
);

// ============================================================================
// USER PROGRESS TABLE (Track learning progress)
// ============================================================================

export const userProgress = pgTable(
	'user_progress',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
		topic: varchar('topic', { length: 100 }),
		totalQuestionsAttempted: integer('total_questions_attempted').notNull().default(0),
		totalCorrect: integer('total_correct').notNull().default(0),
		totalMarksEarned: integer('total_marks_earned').notNull().default(0),
		streakDays: integer('streak_days').notNull().default(0),
		lastActivityAt: timestamp('last_activity_at').defaultNow(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('user_progress_user_id_idx').on(table.userId),
		subjectIdIdx: index('user_progress_subject_id_idx').on(table.subjectId),
		topicIdx: index('user_progress_topic_idx').on(table.topic),
	})
);

// ============================================================================
// USER ACHIEVEMENTS TABLE
// ============================================================================

export const userAchievements = pgTable(
	'user_achievements',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		achievementId: varchar('achievement_id', { length: 50 }).notNull(),
		title: varchar('title', { length: 100 }).notNull(),
		description: text('description'),
		icon: varchar('icon', { length: 50 }),
		unlockedAt: timestamp('unlocked_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('user_achievements_user_id_idx').on(table.userId),
		uniqueAchievement: {
			name: 'user_achievement_unique',
			columns: [table.userId, table.achievementId],
		},
	})
);

// ============================================================================
// STUDY SESSIONS TABLE
// ============================================================================

export const studySessions = pgTable(
	'study_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
		sessionType: varchar('session_type', { length: 20 }).notNull(),
		durationMinutes: integer('duration_minutes'),
		questionsAttempted: integer('questions_attempted').notNull().default(0),
		correctAnswers: integer('correct_answers').notNull().default(0),
		marksEarned: integer('marks_earned').notNull().default(0),
		startedAt: timestamp('started_at').defaultNow(),
		completedAt: timestamp('completed_at'),
	},
	(table) => ({
		userIdIdx: index('study_sessions_user_id_idx').on(table.userId),
		subjectIdIdx: index('study_sessions_subject_id_idx').on(table.subjectId),
		startedAtIdx: index('study_sessions_started_at_idx').on(table.startedAt),
	})
);

// ============================================================================
// STUDY PLANS TABLE
// ============================================================================

export const studyPlans = pgTable(
	'study_plans',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		targetExamDate: timestamp('target_exam_date'),
		focusAreas: text('focus_areas'),
		weeklyGoals: text('weekly_goals'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('study_plans_user_id_idx').on(table.userId),
		isActiveIdx: index('study_plans_is_active_idx').on(table.isActive),
	})
);

// ============================================================================
// BOOKMARKS TABLE
// ============================================================================

export const bookmarks = pgTable(
	'bookmarks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		bookmarkType: varchar('bookmark_type', { length: 20 }).notNull(),
		referenceId: text('reference_id').notNull(),
		note: text('note'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('bookmarks_user_id_idx').on(table.userId),
		bookmarkTypeIdx: index('bookmarks_type_idx').on(table.bookmarkType),
		referenceIdIdx: index('bookmarks_reference_id_idx').on(table.referenceId),
	})
);

// ============================================================================
// LEADERBOARD ENTRIES TABLE
// ============================================================================

export const leaderboardEntries = pgTable(
	'leaderboard_entries',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		periodType: varchar('period_type', { length: 20 }).notNull(),
		periodStart: timestamp('period_start').notNull(),
		totalPoints: integer('total_points').notNull().default(0),
		rank: integer('rank'),
		questionsCompleted: integer('questions_completed').notNull().default(0),
		accuracyPercentage: integer('accuracy_percentage'),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('leaderboard_user_id_idx').on(table.userId),
		periodIdx: index('leaderboard_period_idx').on(table.periodType, table.periodStart),
		uniqueEntry: {
			name: 'leaderboard_unique_entry',
			columns: [table.userId, table.periodType, table.periodStart],
		},
	})
);

// ============================================================================
// CHANNELS (STUDY GROUPS) TABLE
// ============================================================================

export const channels = pgTable(
	'channels',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
		createdBy: text('created_by')
			.notNull()
			.references(() => users.id),
		isPublic: boolean('is_public').notNull().default(true),
		memberCount: integer('member_count').notNull().default(1),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		subjectIdIdx: index('channels_subject_id_idx').on(table.subjectId),
		createdByIdx: index('channels_created_by_idx').on(table.createdBy),
	})
);

// ============================================================================
// CHANNEL MEMBERS TABLE
// ============================================================================

export const channelMembers = pgTable(
	'channel_members',
	{
		channelId: uuid('channel_id')
			.notNull()
			.references(() => channels.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: varchar('role', { length: 20 }).notNull().default('member'),
		joinedAt: timestamp('joined_at').defaultNow(),
	},
	(table) => ({
		pk: { columns: [table.channelId, table.userId] },
		userIdIdx: index('channel_members_user_id_idx').on(table.userId),
	})
);

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

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
	user: one(users, {
		fields: [searchHistory.userId],
		references: [users.id],
	}),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
	user: one(users, {
		fields: [userProgress.userId],
		references: [users.id],
	}),
	subject: one(subjects, {
		fields: [userProgress.subjectId],
		references: [subjects.id],
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
	user: one(users, {
		fields: [userAchievements.userId],
		references: [users.id],
	}),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
	user: one(users, {
		fields: [studySessions.userId],
		references: [users.id],
	}),
	subject: one(subjects, {
		fields: [studySessions.subjectId],
		references: [subjects.id],
	}),
}));

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
	user: one(users, {
		fields: [studyPlans.userId],
		references: [users.id],
	}),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	user: one(users, {
		fields: [bookmarks.userId],
		references: [users.id],
	}),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
	user: one(users, {
		fields: [leaderboardEntries.userId],
		references: [users.id],
	}),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [channels.subjectId],
		references: [subjects.id],
	}),
	creator: one(users, {
		fields: [channels.createdBy],
		references: [users.id],
	}),
	members: many(channelMembers),
}));

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
	channel: one(channels, {
		fields: [channelMembers.channelId],
		references: [channels.id],
	}),
	user: one(users, {
		fields: [channelMembers.userId],
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

export type PastPaper = typeof pastPapers.$inferSelect;
export type NewPastPaper = typeof pastPapers.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;

export type StudySession = typeof studySessions.$inferSelect;
export type NewStudySession = typeof studySessions.$inferInsert;

export type StudyPlan = typeof studyPlans.$inferSelect;
export type NewStudyPlan = typeof studyPlans.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type NewLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;

export type ChannelMember = typeof channelMembers.$inferSelect;
export type NewChannelMember = typeof channelMembers.$inferInsert;

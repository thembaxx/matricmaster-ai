import { relations } from 'drizzle-orm';
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

// Import better-auth schema for consistency
import {
	accounts,
	accountsRelations,
	users as authUsers,
	sessions,
	sessionsRelations,
	usersRelations,
	verifications,
} from './better-auth-schema';

// Re-export better-auth tables with consistent naming
export {
	authUsers as user,
	sessions as session,
	accounts as account,
	verifications as verification,
};
export { usersRelations, sessionsRelations, accountsRelations };

// Also export users directly for schema references
export const users = authUsers;

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
		uniqueAchievement: uniqueIndex('user_achievement_unique').on(table.userId, table.achievementId),
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
		uniqueEntry: uniqueIndex('leaderboard_unique_entry').on(
			table.userId,
			table.periodType,
			table.periodStart
		),
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
			.references(() => users.id, { onDelete: 'set null' }),
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
		pk: primaryKey({ columns: [table.channelId, table.userId] }),
		userIdIdx: index('channel_members_user_id_idx').on(table.userId),
	})
);

// ============================================================================
// AI CONVERSATIONS TABLE (Saved AI Tutor conversations)
// ============================================================================

export const aiConversations = pgTable(
	'ai_conversations',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		subject: varchar('subject', { length: 50 }),
		messages: text('messages').notNull(),
		messageCount: integer('message_count').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('ai_conversations_user_id_idx').on(table.userId),
		createdAtIdx: index('ai_conversations_created_at_idx').on(table.createdAt),
	})
);

// ============================================================================
// BUDDY REQUESTS TABLE (Study buddy requests)
// ============================================================================

export const buddyRequests = pgTable(
	'buddy_requests',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		fromUserId: text('from_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		toUserId: text('to_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		message: text('message'),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		createdAt: timestamp('created_at').defaultNow(),
		respondedAt: timestamp('responded_at'),
	},
	(table) => ({
		fromUserIdIdx: index('buddy_requests_from_user_id_idx').on(table.fromUserId),
		toUserIdIdx: index('buddy_requests_to_user_id_idx').on(table.toUserId),
		statusIdx: index('buddy_requests_status_idx').on(table.status),
		uniqueRequest: uniqueIndex('buddy_requests_unique').on(table.fromUserId, table.toUserId),
	})
);

// ============================================================================
// CONTENT FLAGS TABLE (Moderation system)
// ============================================================================

export const contentFlags = pgTable(
	'content_flags',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		reporterId: text('reporter_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		contentType: varchar('content_type', { length: 20 }).notNull(),
		contentId: text('content_id').notNull(),
		contentPreview: text('content_preview'),
		flagReason: varchar('flag_reason', { length: 50 }).notNull(),
		flagDetails: text('flag_details'),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
		reviewedAt: timestamp('reviewed_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		reporterIdIdx: index('content_flags_reporter_id_idx').on(table.reporterId),
		contentTypeIdx: index('content_flags_content_type_idx').on(table.contentType),
		contentIdIdx: index('content_flags_content_id_idx').on(table.contentId),
		statusIdx: index('content_flags_status_idx').on(table.status),
		createdAtIdx: index('content_flags_created_at_idx').on(table.createdAt),
	})
);

// ============================================================================
// COMMENTS TABLES (from migration 0005)
// ============================================================================

// Define comments table first to avoid circular reference
export const comments = pgTable(
	'comments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		resourceType: varchar('resource_type', { length: 50 }).notNull(),
		resourceId: text('resource_id').notNull(),
		parentId: uuid('parent_id'),
		isEdited: boolean('is_edited').notNull().default(false),
		isFlagged: boolean('is_flagged').notNull().default(false),
		flagReason: text('flag_reason'),
		upvotes: integer('upvotes').notNull().default(0),
		downvotes: integer('downvotes').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		resourceIdx: index('comments_resource_idx').on(table.resourceType, table.resourceId),
		userIdIdx: index('comments_user_id_idx').on(table.userId),
		parentIdIdx: index('comments_parent_id_idx').on(table.parentId),
	})
);

export const commentVotes = pgTable(
	'comment_votes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		commentId: uuid('comment_id')
			.notNull()
			.references(() => comments.id, { onDelete: 'cascade' }),
		voteType: varchar('vote_type', { length: 10 }).notNull(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		commentIdIdx: index('comment_votes_comment_id_idx').on(table.commentId),
		uniqueVote: uniqueIndex('comment_votes_unique').on(table.userId, table.commentId),
	})
);

// ============================================================================
// NOTIFICATIONS TABLE (from migration 0005)
// ============================================================================

export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: varchar('type', { length: 30 }).notNull(),
		title: varchar('title', { length: 200 }).notNull(),
		message: text('message').notNull(),
		data: text('data'),
		isRead: boolean('is_read').notNull().default(false),
		readAt: timestamp('read_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('notifications_user_id_idx').on(table.userId),
		isReadIdx: index('notifications_is_read_idx').on(table.isRead),
		createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
	})
);

// ============================================================================
// CALENDAR EVENTS TABLE (from migration 0005)
// ============================================================================

export const calendarEvents = pgTable(
	'calendar_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description'),
		eventType: varchar('event_type', { length: 30 }).notNull(),
		subjectId: bigint('subject_id', { mode: 'number' }).references(() => subjects.id, {
			onDelete: 'set null',
		}),
		startTime: timestamp('start_time').notNull(),
		endTime: timestamp('end_time').notNull(),
		isAllDay: boolean('is_all_day').notNull().default(false),
		location: text('location'),
		reminderMinutes: text('reminder_minutes'),
		recurrenceRule: text('recurrence_rule'),
		examId: uuid('exam_id'),
		lessonId: bigint('lesson_id', { mode: 'number' }),
		studyPlanId: uuid('study_plan_id'),
		isCompleted: boolean('is_completed').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('calendar_events_user_id_idx').on(table.userId),
		startTimeIdx: index('calendar_events_start_time_idx').on(table.startTime),
	})
);

// ============================================================================
// STUDY BUDDY TABLES (from migration 0005)
// ============================================================================

export const studyBuddyProfiles = pgTable(
	'study_buddy_profiles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
			.unique(),
		bio: text('bio'),
		studyGoals: text('study_goals'),
		preferredSubjects: text('preferred_subjects'),
		studySchedule: text('study_schedule'),
		lookingFor: text('looking_for'),
		isVisible: boolean('is_visible').notNull().default(true),
		matchPreferences: text('match_preferences'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('study_buddy_profiles_user_id_idx').on(table.userId),
	})
);

export const studyBuddyRequests = pgTable(
	'study_buddy_requests',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		requesterId: text('requester_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		recipientId: text('recipient_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		message: text('message'),
		createdAt: timestamp('created_at').defaultNow(),
		respondedAt: timestamp('responded_at'),
	},
	(table) => ({
		requesterIdx: index('study_buddy_requests_requester_idx').on(table.requesterId),
		recipientIdx: index('study_buddy_requests_recipient_idx').on(table.recipientId),
		uniqueRequest: uniqueIndex('study_buddy_requests_unique').on(
			table.requesterId,
			table.recipientId
		),
	})
);

export const studyBuddies = pgTable(
	'study_buddies',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId1: text('user_id_1')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		userId2: text('user_id_2')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdx: index('study_buddies_user_idx').on(table.userId1, table.userId2),
		uniqueBuddy: uniqueIndex('study_buddies_unique').on(table.userId1, table.userId2),
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

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
	user: one(users, {
		fields: [aiConversations.userId],
		references: [users.id],
	}),
}));

export const buddyRequestsRelations = relations(buddyRequests, ({ one }) => ({
	fromUser: one(users, {
		fields: [buddyRequests.fromUserId],
		references: [users.id],
	}),
	toUser: one(users, {
		fields: [buddyRequests.toUserId],
		references: [users.id],
	}),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
	}),
	votes: many(commentVotes),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
	user: one(users, {
		fields: [commentVotes.userId],
		references: [users.id],
	}),
	comment: one(comments, {
		fields: [commentVotes.commentId],
		references: [comments.id],
	}),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id],
	}),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
	user: one(users, {
		fields: [calendarEvents.userId],
		references: [users.id],
	}),
	subject: one(subjects, {
		fields: [calendarEvents.subjectId],
		references: [subjects.id],
	}),
}));

export const studyBuddyProfilesRelations = relations(studyBuddyProfiles, ({ one }) => ({
	user: one(users, {
		fields: [studyBuddyProfiles.userId],
		references: [users.id],
	}),
}));

export const studyBuddyRequestsRelations = relations(studyBuddyRequests, ({ one }) => ({
	requester: one(users, {
		fields: [studyBuddyRequests.requesterId],
		references: [users.id],
	}),
	recipient: one(users, {
		fields: [studyBuddyRequests.recipientId],
		references: [users.id],
	}),
}));

export const studyBuddiesRelations = relations(studyBuddies, ({ one }) => ({
	user1: one(users, {
		fields: [studyBuddies.userId1],
		references: [users.id],
	}),
	user2: one(users, {
		fields: [studyBuddies.userId2],
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

export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;

export type BuddyRequest = typeof buddyRequests.$inferSelect;
export type NewBuddyRequest = typeof buddyRequests.$inferInsert;

export type ContentFlag = typeof contentFlags.$inferSelect;
export type NewContentFlag = typeof contentFlags.$inferInsert;

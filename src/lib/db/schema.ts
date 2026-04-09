import { relations } from 'drizzle-orm';
import {
	bigint,
	boolean,
	index,
	integer,
	numeric,
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
	accounts as account,
	accountsRelations,
	authUsers as user,
	sessions as session,
	sessionsRelations,
	usersRelations,
	verifications as verification,
};

// Also export users directly for schema references
export const users = authUsers;

// ============================================================================
// QUIZ SYSTEM TABLES
// ============================================================================

export const subjects = pgTable('subjects', {
	id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
	slug: varchar('slug', { length: 50 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	displayName: varchar('display_name', { length: 100 }).notNull(),
	description: text('description'),
	curriculumCode: varchar('curriculum_code', { length: 20 }).notNull(),
	emoji: varchar('emoji', { length: 10 }),
	fluentEmoji: varchar('fluent_emoji', { length: 50 }),
	imgSrc: text('img_src'),
	color: varchar('color', { length: 50 }),
	bgColor: varchar('bg_color', { length: 50 }),
	icon: varchar('icon', { length: 50 }),
	fontFamily: varchar('font_family', { length: 100 }),
	gradientPrimary: varchar('gradient_primary', { length: 20 }),
	gradientSecondary: varchar('gradient_secondary', { length: 20 }),
	gradientAccent: varchar('gradient_accent', { length: 20 }),
	isSupported: boolean('is_supported').notNull().default(true),
	displayOrder: integer('display_order').notNull().default(0),
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
		ageRating: varchar('age_rating', { length: 20 }).notNull().default('all'),
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

export const options = pgTable(
	'options',
	{
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
	},
	(table) => ({
		questionLetterUnique: uniqueIndex('options_question_letter_unique').on(
			table.questionId,
			table.optionLetter
		),
	})
);

// ============================================================================
// QUIZ RESULTS TABLE
// ============================================================================
export const quizResults = pgTable(
	'quiz_results',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		quizId: varchar('quiz_id', { length: 100 }).notNull(),
		subjectId: integer('subject_id'),
		topic: varchar('topic', { length: 100 }),
		score: integer('score').notNull(),
		totalQuestions: integer('total_questions').notNull(),
		percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),
		timeTaken: integer('time_taken').notNull(),
		completedAt: timestamp('completed_at').defaultNow().notNull(),
		questionResults: text('question_results'),
		source: varchar('source', { length: 20 }).default('quiz'),
		isReviewMode: boolean('is_review_mode').notNull().default(false),
	},
	(table) => ({
		uniqueUserQuiz: uniqueIndex('quiz_results_user_quiz_unique').on(table.userId, table.quizId),
	})
);

export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;

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
		markdownFileUrl: text('markdown_file_url'),
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
// PAST PAPER QUESTIONS TABLE (Individual questions from past papers)
// ============================================================================

export const pastPaperQuestions = pgTable(
	'past_paper_questions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		paperId: uuid('paper_id').references(() => pastPapers.id, { onDelete: 'cascade' }),
		questionText: text('question_text').notNull(),
		answerText: text('answer_text'),
		year: integer('year').notNull(),
		subject: varchar('subject', { length: 100 }).notNull(),
		paper: varchar('paper', { length: 20 }),
		month: varchar('month', { length: 20 }),
		topic: varchar('topic', { length: 200 }),
		marks: integer('marks'),
		questionNumber: integer('question_number'),
		contentLevel: varchar('content_level', { length: 20 }).notNull().default('grade12'),
		ageRating: varchar('age_rating', { length: 20 }).notNull().default('all'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		topicIdx: index('past_paper_questions_topic_idx').on(table.topic),
		subjectIdx: index('past_paper_questions_subject_idx').on(table.subject),
		yearIdx: index('past_paper_questions_year_idx').on(table.year),
	})
);

export type PastPaperQuestion = typeof pastPaperQuestions.$inferSelect;
export type NewPastPaperQuestion = typeof pastPaperQuestions.$inferInsert;

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
		bestStreak: integer('best_streak').notNull().default(0),
		streakFreezes: integer('streak_freezes').notNull().default(0),
		lastLoginBonusAt: timestamp('last_login_bonus_at'),
		consecutiveLoginDays: integer('consecutive_login_days').notNull().default(0),
		totalLoginBonusesClaimed: integer('total_login_bonuses_claimed').notNull().default(0),
		lastActivityAt: timestamp('last_activity_at').defaultNow(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('user_progress_user_id_idx').on(table.userId),
		subjectIdIdx: index('user_progress_subject_id_idx').on(table.subjectId),
		topicIdx: index('user_progress_topic_idx').on(table.topic),
		userSubjectTopic: uniqueIndex('user_progress_user_subject_topic').on(
			table.userId,
			table.subjectId,
			table.topic
		),
		userIdUnique: uniqueIndex('user_progress_user_id_unique').on(table.userId),
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
		topic: varchar('topic', { length: 200 }),
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
// FLASHCARD DECKS TABLE
// ============================================================================

export const flashcardDecks = pgTable(
	'flashcard_decks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 200 }).notNull(),
		description: text('description'),
		subjectId: bigint('subject_id', { mode: 'number' }).references(() => subjects.id, {
			onDelete: 'set null',
		}),
		cardCount: integer('card_count').notNull().default(0),
		isPublic: boolean('is_public').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('flashcard_decks_user_id_idx').on(table.userId),
		subjectIdIdx: index('flashcard_decks_subject_id_idx').on(table.subjectId),
	})
);

// ============================================================================
// FLASHCARDS TABLE (with Spaced Repetition fields)
// ============================================================================

export const flashcards = pgTable(
	'flashcards',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		deckId: uuid('deck_id')
			.notNull()
			.references(() => flashcardDecks.id, { onDelete: 'cascade' }),
		front: text('front').notNull(),
		back: text('back').notNull(),
		imageUrl: text('image_url'),
		difficulty: varchar('difficulty', { length: 20 }).notNull().default('medium'),
		timesReviewed: integer('times_reviewed').notNull().default(0),
		timesCorrect: integer('times_correct').notNull().default(0),
		easeFactor: numeric('ease_factor', { precision: 3, scale: 2 }).notNull().default('2.5'),
		intervalDays: integer('interval_days').notNull().default(1),
		repetitions: integer('repetitions').notNull().default(0),
		nextReview: timestamp('next_review'),
		lastReview: timestamp('last_review'),
		sourceType: varchar('source_type', { length: 20 }).notNull().default('manual'),
		sourceQuestionId: varchar('source_question_id', { length: 100 }),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		deckIdIdx: index('flashcards_deck_id_idx').on(table.deckId),
		nextReviewIdx: index('flashcards_next_review_idx').on(table.nextReview),
		sourceTypeIdx: index('flashcards_source_type_idx').on(table.sourceType),
		sourceQuestionIdIdx: index('flashcards_source_question_id_idx').on(table.sourceQuestionId),
	})
);

// ============================================================================
// FLASHCARD REVIEWS TABLE (for tracking review history)
// ============================================================================

export const flashcardReviews = pgTable(
	'flashcard_reviews',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		flashcardId: uuid('flashcard_id')
			.notNull()
			.references(() => flashcards.id, { onDelete: 'cascade' }),
		rating: integer('rating').notNull(),
		intervalBefore: integer('interval_before'),
		intervalAfter: integer('interval_after').notNull(),
		easeFactorBefore: numeric('ease_factor_before', { precision: 3, scale: 2 }),
		easeFactorAfter: numeric('ease_factor_after', { precision: 3, scale: 2 }).notNull(),
		reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('flashcard_reviews_user_id_idx').on(table.userId),
		flashcardIdIdx: index('flashcard_reviews_flashcard_id_idx').on(table.flashcardId),
		reviewedAtIdx: index('flashcard_reviews_reviewed_at_idx').on(table.reviewedAt),
	})
);

// ============================================================================
// TOPIC MASTERY TABLE (for adaptive learning)
// ============================================================================

export const topicMastery = pgTable(
	'topic_mastery',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' }),
		topic: varchar('topic', { length: 100 }).notNull(),
		masteryLevel: numeric('mastery_level', { precision: 5, scale: 2 }).notNull().default('0'),
		questionsAttempted: integer('questions_attempted').notNull().default(0),
		questionsCorrect: integer('questions_correct').notNull().default(0),
		averageTime: integer('average_time_seconds'),
		lastPracticed: timestamp('last_practiced'),
		nextReview: timestamp('next_review'),
		consecutiveCorrect: integer('consecutive_correct').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('topic_mastery_user_id_idx').on(table.userId),
		subjectIdIdx: index('topic_mastery_subject_id_idx').on(table.subjectId),
		nextReviewIdx: index('topic_mastery_next_review_idx').on(table.nextReview),
		userSubjectTopic: uniqueIndex('topic_mastery_user_subject_topic').on(
			table.userId,
			table.subjectId,
			table.topic
		),
	})
);

// ============================================================================
// USER LEARNING PREFERENCES TABLE (for personalization)
// ============================================================================

export const userLearningPreferences = pgTable('user_learning_preferences', {
	userId: text('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	preferredDifficulty: varchar('preferred_difficulty', { length: 20 }).notNull().default('medium'),
	learningStyle: varchar('learning_style', { length: 20 }).notNull().default('visual'),
	preferredPace: varchar('preferred_pace', { length: 20 }).notNull().default('moderate'),
	sessionDuration: integer('session_duration').notNull().default(30), // minutes
	preferredSubjects: text('preferred_subjects'), // JSON array
	contentTypes: text('content_types'), // JSON array of preferred content types
	avoidTopics: text('avoid_topics'), // JSON array of topics to avoid
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserLearningPreferences = typeof userLearningPreferences.$inferSelect;

// ============================================================================
// ADAPTIVE LEARNING METRICS TABLE
// ============================================================================

export const adaptiveLearningMetrics = pgTable(
	'adaptive_learning_metrics',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
		topic: varchar('topic', { length: 100 }),
		difficulty: varchar('difficulty', { length: 20 }).notNull(),
		performanceScore: numeric('performance_score', { precision: 5, scale: 2 }).notNull(),
		timeSpent: integer('time_spent').notNull(), // seconds
		correctAnswers: integer('correct_answers').notNull(),
		totalQuestions: integer('total_questions').notNull(),
		knowledgeGaps: text('knowledge_gaps'), // JSON array of identified gaps
		recommendedActions: text('recommended_actions'), // JSON array of recommendations
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('adaptive_metrics_user_id_idx').on(table.userId),
		subjectTopicIdx: index('adaptive_metrics_subject_topic_idx').on(table.subjectId, table.topic),
	})
);

export type AdaptiveLearningMetrics = typeof adaptiveLearningMetrics.$inferSelect;

// ============================================================================
// PERSONALIZED STUDY PLANS TABLE
// ============================================================================

export const personalizedStudyPlans = pgTable(
	'personalized_study_plans',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		planName: varchar('plan_name', { length: 100 }).notNull(),
		description: text('description'),
		targetDate: timestamp('target_date'),
		subjects: text('subjects'), // JSON array
		weeklySchedule: text('weekly_schedule'), // JSON schedule
		currentPhase: varchar('current_phase', { length: 50 }),
		progressPercentage: numeric('progress_percentage', { precision: 5, scale: 2 }).default('0'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('personalized_study_plans_user_id_idx').on(table.userId),
		activeIdx: index('personalized_study_plans_active_idx').on(table.isActive),
	})
);

export type PersonalizedStudyPlans = typeof personalizedStudyPlans.$inferSelect;

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
		uniqueReverse: uniqueIndex('buddy_requests_reverse_unique').on(
			table.toUserId,
			table.fromUserId
		),
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
		personality: varchar('personality', { length: 20 }).notNull().default('mentor'),
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
		uniqueBuddy1: uniqueIndex('study_buddies_unique_1').on(table.userId1, table.userId2),
		uniqueBuddy2: uniqueIndex('study_buddies_unique_2').on(table.userId2, table.userId1),
	})
);

// ============================================================================
// AI STUDY BUDDY - CONCEPT STRUGGLES (tracks repeated wrong answers)
// ============================================================================

export const conceptStruggles = pgTable(
	'concept_struggles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		concept: varchar('concept', { length: 200 }).notNull(),
		struggleCount: integer('struggle_count').notNull().default(1),
		lastStruggleAt: timestamp('last_struggle_at').defaultNow(),
		isResolved: boolean('is_resolved').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdConceptIdx: index('concept_struggles_user_concept_idx').on(table.userId, table.concept),
		userIdIdx: index('concept_struggles_user_id_idx').on(table.userId),
	})
);

export const conceptStrugglesRelations = relations(conceptStruggles, ({ one }) => ({
	user: one(users, {
		fields: [conceptStruggles.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// AI STUDY BUDDY - TOPIC CONFIDENCE (tracks confidence per topic)
// ============================================================================

export const topicConfidence = pgTable(
	'topic_confidence',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		topic: varchar('topic', { length: 200 }).notNull(),
		subject: varchar('subject', { length: 50 }).notNull(),
		confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 })
			.notNull()
			.default('0.5'),
		timesCorrect: integer('times_correct').notNull().default(0),
		timesAttempted: integer('times_attempted').notNull().default(0),
		lastAttemptAt: timestamp('last_attempt_at'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdTopicSubjectIdx: index('topic_confidence_uts_idx').on(
			table.userId,
			table.topic,
			table.subject
		),
		userIdIdx: index('topic_confidence_user_id_idx').on(table.userId),
	})
);

export const topicConfidenceRelations = relations(topicConfidence, ({ one }) => ({
	user: one(users, {
		fields: [topicConfidence.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// UNIVERSITY TARGETS - User's university admission goals
// ============================================================================

export const universityTargets = pgTable(
	'university_targets',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		universityName: varchar('university_name', { length: 100 }).notNull(),
		faculty: varchar('faculty', { length: 100 }).notNull(),
		targetAps: integer('target_aps').notNull(),
		requiredSubjects: text('required_subjects'),
		recommendedStudyPath: text('recommended_study_path'),
		roadMapGeneratedAt: timestamp('roadmap_generated_at'),
		lastMilestoneId: varchar('last_milestone_id', { length: 50 }),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('university_targets_user_id_idx').on(table.userId),
		userActiveIdx: index('university_targets_active_idx').on(table.userId, table.isActive),
	})
);

export const universityTargetsRelations = relations(universityTargets, ({ one }) => ({
	user: one(users, {
		fields: [universityTargets.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// USER APS SCORES - Track APS points per subject
// ============================================================================

export const userApsScores = pgTable(
	'user_aps_scores',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subject: varchar('subject', { length: 50 }).notNull(),
		currentGrade: varchar('current_grade', { length: 2 }).notNull(),
		apsPoints: integer('aps_points').notNull(),
		lastAssessmentType: varchar('last_assessment_type', { length: 20 }),
		lastAssessmentScore: integer('last_assessment_score'),
		lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('user_aps_scores_user_id_idx').on(table.userId),
		userSubjectIdx: index('user_aps_scores_user_subject_idx').on(table.userId, table.subject),
	})
);

export const userApsScoresRelations = relations(userApsScores, ({ one }) => ({
	user: one(users, {
		fields: [userApsScores.userId],
		references: [users.id],
	}),
}));

export type UserApsScore = typeof userApsScores.$inferSelect;
export type NewUserApsScore = typeof userApsScores.$inferInsert;

// ============================================================================
// APS MILESTONES - Study milestones tied to university goals
// ============================================================================

export const apsMilestones = pgTable(
	'aps_milestones',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		universityTargetId: uuid('university_target_id'),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description'),
		subject: varchar('subject', { length: 50 }),
		topic: varchar('topic', { length: 100 }),
		apsPotentialPoints: integer('aps_potential_points').notNull().default(1),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		completedAt: timestamp('completed_at'),
		dueDate: timestamp('due_date'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('aps_milestones_user_id_idx').on(table.userId),
		statusIdx: index('aps_milestones_status_idx').on(table.status),
	})
);

export const apsMilestonesRelations = relations(apsMilestones, ({ one }) => ({
	user: one(users, { fields: [apsMilestones.userId], references: [users.id] }),
	universityTarget: one(universityTargets, {
		fields: [apsMilestones.universityTargetId],
		references: [universityTargets.id],
	}),
}));

// ============================================================================
// TOPIC WEIGHTAGES - NSC exam weightings for prioritization
// ============================================================================

export const topicWeightages = pgTable(
	'topic_weightages',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		subject: varchar('subject', { length: 50 }).notNull(),
		topic: varchar('topic', { length: 100 }).notNull(),
		weightagePercent: integer('weightage_percent').notNull(),
		examPaper: varchar('exam_paper', { length: 20 }),
		lastUpdated: timestamp('last_updated').defaultNow(),
	},
	(table) => ({
		subjectTopicIdx: index('topic_weightages_subject_topic_idx').on(table.subject, table.topic),
	})
);

export const topicWeightagesRelations = relations(topicWeightages, () => ({}));

// ============================================================================
// QUESTION ATTEMPTS - For spaced repetition tracking
// ============================================================================

export const questionAttempts = pgTable(
	'question_attempts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		questionId: varchar('question_id', { length: 100 }).notNull(),
		topic: varchar('topic', { length: 200 }).notNull(),
		subject: varchar('subject', { length: 50 }).notNull().default(''),
		isCorrect: boolean('is_correct').notNull(),
		responseTimeMs: integer('response_time_ms'),
		nextReviewAt: timestamp('next_review_at'),
		intervalDays: integer('interval_days').notNull().default(1),
		easeFactor: numeric('ease_factor', { precision: 3, scale: 2 }).notNull().default('2.5'),
		attemptedAt: timestamp('attempted_at').defaultNow(),
		source: varchar('source', { length: 20 }).default('quiz'),
		pastPaperId: uuid('past_paper_id').references(() => pastPapers.id, {
			onDelete: 'set null',
		}),
		confidenceLevel: varchar('confidence_level', { length: 10 }),
	},
	(table) => ({
		userIdQuestionIdx: index('question_attempts_user_q_idx').on(table.userId, table.questionId),
		userIdIdx: index('question_attempts_user_id_idx').on(table.userId),
		nextReviewIdx: index('question_attempts_next_review_idx').on(table.nextReviewAt),
		sourceIdx: index('question_attempts_source_idx').on(table.source),
		pastPaperIdIdx: index('question_attempts_past_paper_id_idx').on(table.pastPaperId),
		subjectIdx: index('question_attempts_subject_idx').on(table.subject),
	})
);

export const questionAttemptsRelations = relations(questionAttempts, ({ one }) => ({
	user: one(users, {
		fields: [questionAttempts.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// USER SETTINGS TABLE
// ============================================================================

export const userSettings = pgTable(
	'user_settings',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		emailNotifications: boolean('email_notifications').notNull().default(true),
		pushNotifications: boolean('push_notifications').notNull().default(true),
		pushSubscription: text('push_subscription'),
		studyReminders: boolean('study_reminders').notNull().default(true),
		achievementAlerts: boolean('achievement_alerts').notNull().default(true),
		whatsappNotifications: boolean('whatsapp_notifications').notNull().default(false),
		profileVisibility: boolean('profile_visibility').notNull().default(true),
		showOnLeaderboard: boolean('show_on_leaderboard').notNull().default(true),
		analyticsTracking: boolean('analytics_tracking').notNull().default(true),
		language: varchar('language', { length: 10 }).notNull().default('en'),
		theme: varchar('theme', { length: 20 }).notNull().default('system'),
		curriculum: varchar('curriculum', { length: 10 }).notNull().default('NSC'),
		homeLanguage: varchar('home_language', { length: 20 }),
		preferredLanguage: varchar('preferred_language', { length: 20 }).notNull().default('en'),
		timezone: varchar('timezone', { length: 50 }).notNull().default('Africa/Johannesburg'),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('user_settings_user_id_idx').on(table.userId),
	})
);

// ============================================================================
// DEVICES TABLE (Multi-device sync)
// ============================================================================

export const devices = pgTable(
	'devices',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		deviceId: varchar('device_id', { length: 100 }).notNull(),
		deviceName: varchar('device_name', { length: 100 }).notNull(),
		deviceType: varchar('device_type', { length: 20 }).notNull().default('desktop'),
		lastActiveAt: timestamp('last_active_at').defaultNow(),
		isCurrentDevice: boolean('is_current_device').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('devices_user_id_idx').on(table.userId),
		deviceIdIdx: index('devices_device_id_idx').on(table.deviceId),
		uniqueDevice: uniqueIndex('devices_unique_user_device').on(table.userId, table.deviceId),
	})
);

// ============================================================================
// SYNC QUEUE TABLE (Pending changes for sync)
// ============================================================================

export const syncQueue = pgTable(
	'sync_queue',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		entityType: varchar('entity_type', { length: 30 }).notNull(),
		entityId: varchar('entity_id', { length: 100 }).notNull(),
		action: varchar('action', { length: 10 }).notNull(),
		data: text('data'),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		deviceId: varchar('device_id', { length: 100 }).notNull(),
		processed: boolean('processed').notNull().default(false),
		processedAt: timestamp('processed_at'),
	},
	(table) => ({
		userIdIdx: index('sync_queue_user_id_idx').on(table.userId),
		entityIdx: index('sync_queue_entity_idx').on(table.entityType, table.entityId),
		processedIdx: index('sync_queue_processed_idx').on(table.processed),
	})
);

// ============================================================================
// ACCESSIBILITY PREFERENCES TABLE
// ============================================================================

export const accessibilityPreferences = pgTable(
	'accessibility_preferences',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		highContrast: boolean('high_contrast').notNull().default(false),
		textSize: numeric('text_size', { precision: 3, scale: 2 }).notNull().default('1'),
		reducedMotion: boolean('reduced_motion').notNull().default(false),
		colorBlindMode: varchar('color_blind_mode', { length: 20 }).notNull().default('none'),
		simplifiedLanguage: boolean('simplified_language').notNull().default(false),
		ttsEnabled: boolean('tts_enabled').notNull().default(false),
		largerTargets: boolean('larger_targets').notNull().default(false),
		keyboardNavigation: boolean('keyboard_navigation').notNull().default(false),
		chunkedContent: boolean('chunked_content').notNull().default(false),
		progressBreadcrumbs: boolean('progress_breadcrumbs').notNull().default(true),
		oneThingAtATime: boolean('one_thing_at_a_time').notNull().default(false),
		skipLinks: boolean('skip_links').notNull().default(true),
		holdToClick: boolean('hold_to_click').notNull().default(false),
		focusIndicators: boolean('focus_indicators').notNull().default(true),
		visualSoundIndicators: boolean('visual_sound_indicators').notNull().default(true),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('accessibility_preferences_user_id_idx').on(table.userId),
	})
);

// ============================================================================
// CONTENT FILTER TABLES (Age-appropriate content system)
// ============================================================================

export const contentFilters = pgTable(
	'content_filters',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		childAge: integer('child_age'),
		allowedLevels: text('allowed_levels').notNull().default('grade10,grade11,grade12'),
		strictMode: boolean('strict_mode').notNull().default(false),
		showAdvancedOption: boolean('show_advanced_option').notNull().default(true),
		overrideEnabled: boolean('override_enabled').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('content_filters_user_id_idx').on(table.userId),
	})
);

export const contentFiltersRelations = relations(contentFilters, ({ one }) => ({
	user: one(users, {
		fields: [contentFilters.userId],
		references: [users.id],
	}),
}));

export type ContentFilter = typeof contentFilters.$inferSelect;
export type NewContentFilter = typeof contentFilters.$inferInsert;

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

export const flashcardDecksRelations = relations(flashcardDecks, ({ one, many }) => ({
	user: one(users, {
		fields: [flashcardDecks.userId],
		references: [users.id],
	}),
	subject: one(subjects, {
		fields: [flashcardDecks.subjectId],
		references: [subjects.id],
	}),
	flashcards: many(flashcards),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
	deck: one(flashcardDecks, {
		fields: [flashcards.deckId],
		references: [flashcardDecks.id],
	}),
}));

export const flashcardReviewsRelations = relations(flashcardReviews, ({ one }) => ({
	user: one(users, {
		fields: [flashcardReviews.userId],
		references: [users.id],
	}),
	flashcard: one(flashcards, {
		fields: [flashcardReviews.flashcardId],
		references: [flashcards.id],
	}),
}));

export const topicMasteryRelations = relations(topicMastery, ({ one }) => ({
	user: one(users, {
		fields: [topicMastery.userId],
		references: [users.id],
	}),
	subject: one(subjects, {
		fields: [topicMastery.subjectId],
		references: [subjects.id],
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

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id],
	}),
}));

export const accessibilityPreferencesRelations = relations(accessibilityPreferences, ({ one }) => ({
	user: one(users, {
		fields: [accessibilityPreferences.userId],
		references: [users.id],
	}),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
	user: one(users, {
		fields: [devices.userId],
		references: [users.id],
	}),
}));

export const syncQueueRelations = relations(syncQueue, ({ one }) => ({
	user: one(users, {
		fields: [syncQueue.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// WHATSAPP PREFERENCES TABLE
// ============================================================================

export const whatsappPreferences = pgTable(
	'whatsapp_preferences',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
		isVerified: boolean('is_verified').notNull().default(false),
		isOptedIn: boolean('is_opted_in').notNull().default(true),
		verificationCode: varchar('verification_code', { length: 10 }),
		verificationExpires: timestamp('verification_expires'),
		notificationTypes: text('notification_types').array().notNull().default([]),
		quietHoursStart: varchar('quiet_hours_start', { length: 5 }),
		quietHoursEnd: varchar('quiet_hours_end', { length: 5 }),
		reminderFrequency: varchar('reminder_frequency', { length: 20 }).notNull().default('daily'),
		reminderTime: varchar('reminder_time', { length: 5 }).notNull().default('09:00'),
		reminderDays: varchar('reminder_days', { length: 20 }),
		lastMessageAt: timestamp('last_message_at'),
		lastError: text('last_error'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		phoneUnique: uniqueIndex('whatsapp_preferences_phone_unique').on(table.phoneNumber),
		verifiedIdx: index('whatsapp_prefs_verified_idx').on(table.isVerified),
	})
);

export const whatsappPreferencesRelations = relations(whatsappPreferences, ({ one }) => ({
	user: one(users, {
		fields: [whatsappPreferences.userId],
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

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;

export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type NewFlashcardDeck = typeof flashcardDecks.$inferInsert;

export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;

export type FlashcardReview = typeof flashcardReviews.$inferSelect;
export type NewFlashcardReview = typeof flashcardReviews.$inferInsert;

export type TopicMastery = typeof topicMastery.$inferSelect;
export type NewTopicMastery = typeof topicMastery.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

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

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type AccessibilityPreferences = typeof accessibilityPreferences.$inferSelect;
export type NewAccessibilityPreferences = typeof accessibilityPreferences.$inferInsert;

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;

export type SyncQueueItem = typeof syncQueue.$inferSelect;
export type NewSyncQueueItem = typeof syncQueue.$inferInsert;

// ============================================================================
// OFFLINE BUNDLES TABLE
// ============================================================================

export const downloadedBundles = pgTable(
	'downloaded_bundles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		bundleId: varchar('bundle_id', { length: 100 }).notNull(),
		subject: varchar('subject', { length: 50 }).notNull(),
		version: varchar('version', { length: 20 }).notNull(),
		bundleType: varchar('bundle_type', { length: 30 }).notNull().default('questions_only'),
		questionCount: integer('question_count').notNull().default(0),
		sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull().default(0),
		topics: text('topics').array(),
		downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('downloaded_bundles_user_id_idx').on(table.userId),
		bundleIdIdx: index('downloaded_bundles_bundle_id_idx').on(table.bundleId),
		uniqueBundle: uniqueIndex('downloaded_bundles_unique').on(table.userId, table.bundleId),
	})
);

export type DownloadedBundle = typeof downloadedBundles.$inferSelect;
export type NewDownloadedBundle = typeof downloadedBundles.$inferInsert;

export type EnergySession = typeof energySessions.$inferSelect;
export type NewEnergySession = typeof energySessions.$inferInsert;

export type EnergyPattern = typeof energyPatterns.$inferSelect;
export type NewEnergyPattern = typeof energyPatterns.$inferInsert;

// ============================================================================
// ENERGY TRACKING TABLES
// ============================================================================

export const energySessions = pgTable(
	'energy_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		date: timestamp('date').notNull(),
		startTime: varchar('start_time', { length: 5 }).notNull(),
		endTime: varchar('end_time', { length: 5 }).notNull(),
		energyLevel: integer('energy_level').notNull(),
		correctAnswers: integer('correct_answers').notNull().default(0),
		totalQuestions: integer('total_questions').notNull().default(0),
		durationMinutes: integer('duration_minutes').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('energy_sessions_user_id_idx').on(table.userId),
		dateIdx: index('energy_sessions_date_idx').on(table.date),
		userDateUnique: uniqueIndex('energy_sessions_user_date_unique').on(table.userId, table.date),
	})
);

export const energyPatterns = pgTable(
	'energy_patterns',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		hour: integer('hour').notNull(),
		averageEnergy: numeric('average_energy', { precision: 5, scale: 2 }).notNull(),
		sampleSize: integer('sample_size').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdHourIdx: index('energy_patterns_user_hour_idx').on(table.userId, table.hour),
		uniqueUserHour: uniqueIndex('energy_patterns_unique').on(table.userId, table.hour),
	})
);

// ============================================================================
// SUBSCRIPTION TABLES
// ============================================================================

export const subscriptionPlans = pgTable('subscription_plans', {
	id: varchar('id', { length: 50 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	priceZar: numeric('price_zar', { precision: 10, scale: 2 }).notNull(),
	billingInterval: varchar('billing_interval', { length: 20 }).notNull().default('monthly'),
	features: text('features').array(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSubscriptions = pgTable(
	'user_subscriptions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		planId: varchar('plan_id', { length: 50 })
			.notNull()
			.references(() => subscriptionPlans.id),
		paystackCustomerCode: varchar('paystack_customer_code', { length: 100 }),
		paystackSubscriptionCode: varchar('paystack_subscription_code', { length: 100 }),
		paystackEmailToken: varchar('paystack_email_token', { length: 100 }),
		status: varchar('status', { length: 20 }).notNull().default('active'),
		currentPeriodStart: timestamp('current_period_start').notNull(),
		currentPeriodEnd: timestamp('current_period_end').notNull(),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
		isFreeTrial: boolean('is_free_trial').notNull().default(false),
		trialEndDate: timestamp('trial_end_date'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('user_subscriptions_user_id_idx').on(table.userId),
		statusIdx: index('user_subscriptions_status_idx').on(table.status),
		planIdIdx: index('user_subscriptions_plan_id_idx').on(table.planId),
	})
);

export const payments = pgTable(
	'payments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: varchar('user_id', { length: 255 })
			.notNull()
			.references(() => users.id),
		subscriptionId: uuid('subscription_id').references(() => userSubscriptions.id),
		amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
		currency: varchar('currency', { length: 3 }).notNull().default('ZAR'),
		paystackReference: varchar('paystack_reference', { length: 100 }).notNull().unique(),
		paystackTransactionId: varchar('paystack_transaction_id', { length: 100 }),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		paymentMethod: varchar('payment_method', { length: 20 }),
		metadata: text('metadata'),
		failureReason: text('failure_reason'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('payments_user_id_idx').on(table.userId),
		statusIdx: index('payments_status_idx').on(table.status),
		referenceIdx: index('payments_reference_idx').on(table.paystackReference),
	})
);

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
	userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
	plan: one(subscriptionPlans, {
		fields: [userSubscriptions.planId],
		references: [subscriptionPlans.id],
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	subscription: one(userSubscriptions, {
		fields: [payments.subscriptionId],
		references: [userSubscriptions.id],
	}),
}));

// Chat schema exports
export {
	chatMessages,
	chatMessagesRelations,
	outbox,
	userPresence,
	userPresenceRelations,
} from './schema-chat';

export type ChatMessage = import('./schema-chat').ChatMessage;
export type NewChatMessage = import('./schema-chat').NewChatMessage;
export type Outbox = import('./schema-chat').Outbox;
export type NewOutbox = import('./schema-chat').NewOutbox;
export type UserPresence = import('./schema-chat').UserPresence;
export type NewUserPresence = import('./schema-chat').NewUserPresence;

// AI Chat schema exports
export {
	aiChatMessages,
	aiChatMessagesRelations,
	aiChatSessions,
	aiChatSessionsRelations,
} from './schema-ai-chat';

export type AiChatSession = import('./schema-ai-chat').AiChatSession;
export type NewAiChatSession = import('./schema-ai-chat').NewAiChatSession;
export type AiChatMessage = import('./schema-ai-chat').AiChatMessage;
export type NewAiChatMessage = import('./schema-ai-chat').NewAiChatMessage;

// Subscription types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// Subscription plan IDs
export const PLAN_TIERS = {
	FREE: 'free',
	PRO: 'pro',
	PREMIUM: 'premium',
} as const;

export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];

// ============================================================================
// B2B SCHOOL TABLES
// ============================================================================

export const schools = pgTable(
	'schools',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: varchar('name', { length: 200 }).notNull(),
		emisNumber: varchar('emis_number', { length: 20 }).unique(),
		province: varchar('province', { length: 50 }),
		district: varchar('district', { length: 100 }),
		address: text('address'),
		contactName: varchar('contact_name', { length: 100 }),
		contactEmail: varchar('contact_email', { length: 100 }),
		contactPhone: varchar('contact_phone', { length: 20 }),
		website: varchar('website', { length: 200 }),
		totalLearners: integer('total_learners').default(0),
		totalTeachers: integer('total_teachers').default(0),
		subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
		licenseCount: integer('license_count').default(0),
		licenseExpiry: timestamp('license_expiry'),
		status: varchar('status', { length: 20 }).notNull().default('active'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		nameIdx: index('schools_name_idx').on(table.name),
		emisIdx: index('schools_emis_idx').on(table.emisNumber),
		statusIdx: index('schools_status_idx').on(table.status),
	})
);

export const schoolAdmins = pgTable(
	'school_admins',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schoolId: uuid('school_id')
			.notNull()
			.references(() => schools.id, { onDelete: 'cascade' }),
		userId: varchar('user_id', { length: 255 }).notNull(),
		role: varchar('role', { length: 50 }).notNull().default('admin'),
		isPrimary: boolean('is_primary').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		schoolIdIdx: index('school_admins_school_id_idx').on(table.schoolId),
		userIdIdx: index('school_admins_user_id_idx').on(table.userId),
	})
);

export const schoolLicenses = pgTable(
	'school_licenses',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schoolId: uuid('school_id')
			.notNull()
			.references(() => schools.id, { onDelete: 'cascade' }),
		licenseType: varchar('license_type', { length: 20 }).notNull().default('student'),
		licenseKey: varchar('license_key', { length: 100 }).notNull().unique(),
		assignedTo: varchar('assigned_to', { length: 255 }),
		assignedAt: timestamp('assigned_at'),
		status: varchar('status', { length: 20 }).notNull().default('active'),
		expiresAt: timestamp('expires_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		schoolIdIdx: index('school_licenses_school_id_idx').on(table.schoolId),
		licenseKeyIdx: index('school_licenses_key_idx').on(table.licenseKey),
		statusIdx: index('school_licenses_status_idx').on(table.status),
	})
);

export const schoolsRelations = relations(schools, ({ many }) => ({
	admins: many(schoolAdmins),
	licenses: many(schoolLicenses),
}));

export const schoolAdminsRelations = relations(schoolAdmins, ({ one }) => ({
	school: one(schools, {
		fields: [schoolAdmins.schoolId],
		references: [schools.id],
	}),
}));

export const schoolLicensesRelations = relations(schoolLicenses, ({ one }) => ({
	school: one(schools, {
		fields: [schoolLicenses.schoolId],
		references: [schools.id],
	}),
}));

// ============================================================================
// DAILY CHALLENGES TABLE
// ============================================================================

export const dailyChallenges = pgTable(
	'daily_challenges',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description').notNull(),
		challengeType: varchar('challenge_type', { length: 20 }).notNull(),
		target: integer('target').notNull(),
		currentProgress: integer('current_progress').notNull().default(0),
		xpReward: integer('xp_reward').notNull().default(50),
		badgeId: varchar('badge_id', { length: 50 }),
		expiresAt: timestamp('expires_at').notNull(),
		isCompleted: boolean('is_completed').notNull().default(false),
		isClaimed: boolean('is_claimed').notNull().default(false),
		completedAt: timestamp('completed_at'),
		claimedAt: timestamp('claimed_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('daily_challenges_user_id_idx').on(table.userId),
		expiresAtIdx: index('daily_challenges_expires_at_idx').on(table.expiresAt),
		userExpiresIdx: index('daily_challenges_user_expires_idx').on(table.userId, table.expiresAt),
	})
);

// ============================================================================
// TEAM GOALS TABLE
// ============================================================================

export const teamGoals = pgTable(
	'team_goals',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		creatorId: text('creator_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description'),
		goalType: varchar('goal_type', { length: 20 }).notNull(),
		target: integer('target').notNull(),
		currentProgress: integer('current_progress').notNull().default(0),
		xpReward: integer('xp_reward').notNull().default(100),
		maxMembers: integer('max_members').notNull().default(10),
		memberCount: integer('member_count').notNull().default(1),
		isActive: boolean('is_active').notNull().default(true),
		endDate: timestamp('end_date').notNull(),
		completedAt: timestamp('completed_at'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		creatorIdIdx: index('team_goals_creator_id_idx').on(table.creatorId),
		isActiveIdx: index('team_goals_is_active_idx').on(table.isActive),
		endDateIdx: index('team_goals_end_date_idx').on(table.endDate),
	})
);

// ============================================================================
// TEAM GOAL MEMBERS TABLE
// ============================================================================

export const teamGoalMembers = pgTable(
	'team_goal_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		goalId: uuid('goal_id')
			.notNull()
			.references(() => teamGoals.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		contribution: integer('contribution').notNull().default(0),
		hasClaimedReward: boolean('has_claimed_reward').notNull().default(false),
		joinedAt: timestamp('joined_at').defaultNow(),
	},
	(table) => ({
		goalIdIdx: index('team_goal_members_goal_id_idx').on(table.goalId),
		userIdIdx: index('team_goal_members_user_id_idx').on(table.userId),
		uniqueMember: uniqueIndex('team_goal_members_unique').on(table.goalId, table.userId),
	})
);

// ============================================================================
// CO-OP FOCUS SESSIONS (Leaderboard Multiplier)
// ============================================================================

export const coopFocusSessions = pgTable(
	'coop_focus_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		roomCode: varchar('room_code', { length: 20 }).notNull(),
		startedAt: timestamp('started_at').defaultNow().notNull(),
		endedAt: timestamp('ended_at'),
		memberCount: integer('member_count').notNull().default(1),
		totalMinutes: integer('total_minutes').notNull().default(0),
		multiplier: numeric('multiplier', { precision: 3, scale: 2 }).notNull().default('1.0'),
	},
	(table) => ({
		roomCodeIdx: index('coop_focus_sessions_room_code_idx').on(table.roomCode),
		startedAtIdx: index('coop_focus_sessions_started_at_idx').on(table.startedAt),
	})
);

export const coopSessionMembers = pgTable(
	'coop_session_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => coopFocusSessions.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		joinedAt: timestamp('joined_at').defaultNow().notNull(),
		minutesStudied: integer('minutes_studied').notNull().default(0),
		pointsEarned: integer('points_earned').notNull().default(0),
		multiplierApplied: numeric('multiplier_applied', { precision: 3, scale: 2 })
			.notNull()
			.default('1.0'),
	},
	(table) => ({
		sessionIdIdx: index('coop_session_members_session_idx').on(table.sessionId),
		userIdIdx: index('coop_session_members_user_idx').on(table.userId),
		uniqueMember: uniqueIndex('coop_session_members_unique').on(table.sessionId, table.userId),
	})
);

export const coopFocusSessionsRelations = relations(coopFocusSessions, ({ many }) => ({
	members: many(coopSessionMembers),
}));

export const coopSessionMembersRelations = relations(coopSessionMembers, ({ one }) => ({
	session: one(coopFocusSessions, {
		fields: [coopSessionMembers.sessionId],
		references: [coopFocusSessions.id],
	}),
	user: one(users, {
		fields: [coopSessionMembers.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// PARENT-STUDENT REWARD CONTRACTS
// ============================================================================

export const rewardContracts = pgTable(
	'reward_contracts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		parentId: text('parent_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		studentId: text('student_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description'),
		reward: varchar('reward', { length: 500 }).notNull(),
		targetStreakDays: integer('target_streak_days').notNull().default(0),
		targetQuizCount: integer('target_quiz_count').notNull().default(0),
		targetQuizPercentage: integer('target_quiz_percentage').notNull().default(0),
		currentStreakDays: integer('current_streak_days').notNull().default(0),
		currentQuizCount: integer('current_quiz_count').notNull().default(0),
		currentQuizPercentage: integer('current_quiz_percentage').notNull().default(0),
		status: varchar('status', { length: 20 }).notNull().default('active'),
		completedAt: timestamp('completed_at'),
		expiresAt: timestamp('expires_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		parentIdIdx: index('reward_contracts_parent_idx').on(table.parentId),
		studentIdIdx: index('reward_contracts_student_idx').on(table.studentId),
		statusIdx: index('reward_contracts_status_idx').on(table.status),
	})
);

export const rewardContractsRelations = relations(rewardContracts, ({ one }) => ({
	parent: one(users, {
		fields: [rewardContracts.parentId],
		references: [users.id],
	}),
	student: one(users, {
		fields: [rewardContracts.studentId],
		references: [users.id],
	}),
}));

// ============================================================================
// UNLOCKABLE AESTHETIC THEMES
// ============================================================================

export const userThemes = pgTable(
	'user_themes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		themeId: varchar('theme_id', { length: 50 }).notNull(),
		themeName: varchar('theme_name', { length: 100 }).notNull(),
		unlockedAt: timestamp('unlocked_at').defaultNow(),
		isActive: boolean('is_active').notNull().default(false),
	},
	(table) => ({
		userIdIdx: index('user_themes_user_idx').on(table.userId),
		uniqueTheme: uniqueIndex('user_themes_unique').on(table.userId, table.themeId),
	})
);

export const userThemesRelations = relations(userThemes, ({ one }) => ({
	user: one(users, {
		fields: [userThemes.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// CURRICULUM DATA TABLES (Data Consolidation Phase 1)
// ============================================================================

// subjectMetadata fields merged into subjects table above
// This alias kept for backward compatibility during migration
export const subjectMetadata = subjects;

export const gamificationConfig = pgTable('gamification_config', {
	key: varchar('key', { length: 50 }).primaryKey(),
	value: text('value').notNull(),
	description: text('description'),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const achievementDefinitions = pgTable('achievement_definitions', {
	id: varchar('id', { length: 50 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	icon: varchar('icon', { length: 50 }),
	iconBg: varchar('icon_bg', { length: 20 }),
	category: varchar('category', { length: 20 }).notNull(),
	requirementType: varchar('requirement_type', { length: 30 }).notNull(),
	requirementValue: integer('requirement_value').notNull(),
	requirementSubjectId: bigint('requirement_subject_id', { mode: 'number' }),
	points: integer('points').notNull(),
	displayOrder: integer('display_order').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow(),
});

// Type exports for curriculum tables
/** @deprecated Use Subject instead */
export type SubjectMetadata = Subject;
/** @deprecated Use NewSubject instead */
export type NewSubjectMetadata = NewSubject;
export type GamificationConfig = typeof gamificationConfig.$inferSelect;
export type NewGamificationConfig = typeof gamificationConfig.$inferInsert;
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type NewAchievementDefinition = typeof achievementDefinitions.$inferInsert;

// ============================================================================
// DAILY CHALLENGES & TEAM GOALS RELATIONS
// ============================================================================

export const dailyChallengesRelations = relations(dailyChallenges, ({ one }) => ({
	user: one(users, {
		fields: [dailyChallenges.userId],
		references: [users.id],
	}),
}));

export const teamGoalsRelations = relations(teamGoals, ({ one, many }) => ({
	creator: one(users, {
		fields: [teamGoals.creatorId],
		references: [users.id],
	}),
	members: many(teamGoalMembers),
}));

export const teamGoalMembersRelations = relations(teamGoalMembers, ({ one }) => ({
	goal: one(teamGoals, {
		fields: [teamGoalMembers.goalId],
		references: [teamGoals.id],
	}),
	user: one(users, {
		fields: [teamGoalMembers.userId],
		references: [users.id],
	}),
}));

// Daily challenges & team goals type exports
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type NewDailyChallenge = typeof dailyChallenges.$inferInsert;
export type TeamGoal = typeof teamGoals.$inferSelect;
export type NewTeamGoal = typeof teamGoals.$inferInsert;
export type TeamGoalMember = typeof teamGoalMembers.$inferSelect;
export type NewTeamGoalMember = typeof teamGoalMembers.$inferInsert;

// ============================================================================
// WELLNESS CHECK-INS TABLE
// ============================================================================

export const wellnessCheckIns = pgTable(
	'wellness_check_ins',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		moodBefore: integer('mood_before').notNull(),
		moodAfter: integer('mood_after'),
		sessionDuration: integer('session_duration').notNull(),
		suggestions: text('suggestions'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('wellness_check_ins_user_id_idx').on(table.userId),
		createdAtIdx: index('wellness_check_ins_created_at_idx').on(table.createdAt),
	})
);

export const wellnessCheckInsRelations = relations(wellnessCheckIns, ({ one }) => ({
	user: one(users, {
		fields: [wellnessCheckIns.userId],
		references: [users.id],
	}),
}));

export type WellnessCheckIn = typeof wellnessCheckIns.$inferSelect;
export type NewWellnessCheckIn = typeof wellnessCheckIns.$inferInsert;

// ============================================================================
// TUTORING MARKETPLACE TABLES
// ============================================================================

export const tutorProfiles = pgTable(
	'tutor_profiles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
			.unique(),
		bio: text('bio'),
		teachingStyle: text('teaching_style'),
		subjects: text('subjects').array().notNull().default([]),
		hourlyRateXP: integer('hourly_rate_xp').notNull().default(100),
		isAvailable: boolean('is_available').notNull().default(true),
		totalSessions: integer('total_sessions').notNull().default(0),
		rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
		totalRatings: integer('total_ratings').notNull().default(0),
		availabilitySchedule: text('availability_schedule'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('tutor_profiles_user_id_idx').on(table.userId),
		isAvailableIdx: index('tutor_profiles_available_idx').on(table.isAvailable),
		ratingIdx: index('tutor_profiles_rating_idx').on(table.rating),
	})
);

export const tutoringSessions = pgTable(
	'tutoring_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tutorId: text('tutor_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		studentId: text('student_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		subject: varchar('subject', { length: 100 }).notNull(),
		scheduledAt: timestamp('scheduled_at').notNull(),
		durationMinutes: integer('duration_minutes').notNull().default(60),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		xpPaid: integer('xp_paid').notNull().default(0),
		xpEarned: integer('xp_earned').notNull().default(0),
		roomUrl: text('room_url'),
		studentConfirmed: boolean('student_confirmed').notNull().default(false),
		tutorConfirmed: boolean('tutor_confirmed').notNull().default(false),
		completedAt: timestamp('completed_at'),
		cancelledAt: timestamp('cancelled_at'),
		cancellationReason: text('cancellation_reason'),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		tutorIdIdx: index('tutoring_sessions_tutor_idx').on(table.tutorId),
		studentIdIdx: index('tutoring_sessions_student_idx').on(table.studentId),
		scheduledAtIdx: index('tutoring_sessions_scheduled_idx').on(table.scheduledAt),
		statusIdx: index('tutoring_sessions_status_idx').on(table.status),
	})
);

export const tutorReviews = pgTable(
	'tutor_reviews',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => tutoringSessions.id, { onDelete: 'cascade' }),
		tutorId: text('tutor_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		studentId: text('student_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		rating: integer('rating').notNull(), // CHECK: rating >= 1 AND rating <= 5 — enforce in application logic
		comment: text('comment'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		sessionIdIdx: index('tutor_reviews_session_idx').on(table.sessionId),
		tutorIdIdx: index('tutor_reviews_tutor_idx').on(table.tutorId),
		studentIdIdx: index('tutor_reviews_student_idx').on(table.studentId),
	})
);

export const sessionReports = pgTable(
	'session_reports',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => tutoringSessions.id, { onDelete: 'cascade' }),
		reporterId: text('reporter_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		reason: varchar('reason', { length: 50 }).notNull(),
		details: text('details'),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		resolvedAt: timestamp('resolved_at'),
		resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		sessionIdIdx: index('session_reports_session_idx').on(table.sessionId),
		reporterIdIdx: index('session_reports_reporter_idx').on(table.reporterId),
		statusIdx: index('session_reports_status_idx').on(table.status),
	})
);

// ============================================================================
// RELATIONS FOR TUTORING MARKETPLACE
// ============================================================================

export const tutorProfilesRelations = relations(tutorProfiles, ({ one }) => ({
	user: one(users, {
		fields: [tutorProfiles.userId],
		references: [users.id],
	}),
}));

export const tutoringSessionsRelations = relations(tutoringSessions, ({ one }) => ({
	tutor: one(users, {
		fields: [tutoringSessions.tutorId],
		references: [users.id],
		relationName: 'tutor',
	}),
	student: one(users, {
		fields: [tutoringSessions.studentId],
		references: [users.id],
		relationName: 'student',
	}),
}));

export const tutorReviewsRelations = relations(tutorReviews, ({ one }) => ({
	session: one(tutoringSessions, {
		fields: [tutorReviews.sessionId],
		references: [tutoringSessions.id],
	}),
	tutor: one(users, {
		fields: [tutorReviews.tutorId],
		references: [users.id],
		relationName: 'tutor',
	}),
	student: one(users, {
		fields: [tutorReviews.studentId],
		references: [users.id],
		relationName: 'student',
	}),
}));

export const sessionReportsRelations = relations(sessionReports, ({ one }) => ({
	session: one(tutoringSessions, {
		fields: [sessionReports.sessionId],
		references: [tutoringSessions.id],
	}),
	reporter: one(users, {
		fields: [sessionReports.reporterId],
		references: [users.id],
		relationName: 'reporter',
	}),
	resolver: one(users, {
		fields: [sessionReports.resolvedBy],
		references: [users.id],
		relationName: 'resolver',
	}),
}));

// Type exports for tutoring marketplace
export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type NewTutorProfile = typeof tutorProfiles.$inferInsert;
export type TutoringSession = typeof tutoringSessions.$inferSelect;
export type NewTutoringSession = typeof tutoringSessions.$inferInsert;
export type TutorReview = typeof tutorReviews.$inferSelect;
export type NewTutorReview = typeof tutorReviews.$inferInsert;
export type SessionReport = typeof sessionReports.$inferSelect;
export type NewSessionReport = typeof sessionReports.$inferInsert;

// ============================================================================
// SUBSCRIPTION CHANGES TABLE (Proration Tracking)
// ============================================================================

export const subscriptionChanges = pgTable(
	'subscription_changes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		oldSubscriptionId: uuid('old_subscription_id').references(() => userSubscriptions.id, {
			onDelete: 'set null',
		}),
		newPlanId: varchar('new_plan_id', { length: 50 })
			.notNull()
			.references(() => subscriptionPlans.id),
		oldPlanId: varchar('old_plan_id', { length: 50 }).references(() => subscriptionPlans.id, {
			onDelete: 'set null',
		}),
		prorationCredit: integer('proration_credit').default(0), // in kobo/cents
		oldPlanPrice: numeric('old_plan_price', { precision: 10, scale: 2 }),
		newPlanPrice: numeric('new_plan_price', { precision: 10, scale: 2 }),
		remainingDays: integer('remaining_days').default(0),
		changeDate: timestamp('change_date').defaultNow().notNull(),
		processedAt: timestamp('processed_at'),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		metadata: text('metadata'),
	},
	(table) => ({
		userIdIdx: index('subscription_changes_user_id_idx').on(table.userId),
		statusIdx: index('subscription_changes_status_idx').on(table.status),
		oldSubscriptionIdIdx: index('subscription_changes_old_sub_id_idx').on(table.oldSubscriptionId),
	})
);

export const subscriptionChangesRelations = relations(subscriptionChanges, ({ one }) => ({
	user: one(users, {
		fields: [subscriptionChanges.userId],
		references: [users.id],
	}),
	oldSubscription: one(userSubscriptions, {
		fields: [subscriptionChanges.oldSubscriptionId],
		references: [userSubscriptions.id],
	}),
	newPlan: one(subscriptionPlans, {
		fields: [subscriptionChanges.newPlanId],
		references: [subscriptionPlans.id],
	}),
	oldPlan: one(subscriptionPlans, {
		fields: [subscriptionChanges.oldPlanId],
		references: [subscriptionPlans.id],
	}),
}));

export type SubscriptionChange = typeof subscriptionChanges.$inferSelect;
export type NewSubscriptionChange = typeof subscriptionChanges.$inferInsert;

// ============================================================================
// PAYMENT RETRIES TABLE (Retry Queue)
// ============================================================================

export const paymentRetries = pgTable(
	'payment_retries',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'set null' }),
		planId: varchar('plan_id', { length: 50 })
			.notNull()
			.references(() => subscriptionPlans.id),
		retryCount: integer('retry_count').notNull().default(0),
		maxRetries: integer('max_retries').notNull().default(3),
		nextRetryAt: timestamp('next_retry_at'),
		status: varchar('status', { length: 20 }).notNull().default('pending'),
		lastError: text('last_error'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow(),
		completedAt: timestamp('completed_at'),
	},
	(table) => ({
		userIdIdx: index('payment_retries_user_id_idx').on(table.userId),
		statusIdx: index('payment_retries_status_idx').on(table.status),
		nextRetryAtIdx: index('payment_retries_next_retry_at_idx').on(table.nextRetryAt),
	})
);

export const paymentRetriesRelations = relations(paymentRetries, ({ one }) => ({
	user: one(users, {
		fields: [paymentRetries.userId],
		references: [users.id],
	}),
	payment: one(payments, {
		fields: [paymentRetries.paymentId],
		references: [payments.id],
	}),
	plan: one(subscriptionPlans, {
		fields: [paymentRetries.planId],
		references: [subscriptionPlans.id],
	}),
}));

export type PaymentRetry = typeof paymentRetries.$inferSelect;
export type NewPaymentRetry = typeof paymentRetries.$inferInsert;

// WhatsApp type exports
export type WhatsAppPreference = typeof whatsappPreferences.$inferSelect;
export type NewWhatsAppPreference = typeof whatsappPreferences.$inferInsert;

// ============================================================================
// EDGE CASE EVENTS TABLE (Analytics & Support)
// ============================================================================

export const edgeCaseEvents = pgTable(
	'edge_case_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		edgeCaseType: varchar('edge_case_type', { length: 50 }).notNull(),
		severity: varchar('severity', { length: 20 }).notNull(),
		metadata: text('metadata'),
		context: text('context'),
		triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
		resolvedAt: timestamp('resolved_at'),
		resolution: text('resolution'),
		resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
		actionTaken: varchar('action_taken', { length: 100 }),
	},
	(table) => ({
		userIdIdx: index('edge_case_events_user_id_idx').on(table.userId),
		edgeCaseTypeIdx: index('edge_case_events_type_idx').on(table.edgeCaseType),
		severityIdx: index('edge_case_events_severity_idx').on(table.severity),
		triggeredAtIdx: index('edge_case_events_triggered_at_idx').on(table.triggeredAt),
		userTypeIdx: index('edge_case_events_user_type_idx').on(table.userId, table.edgeCaseType),
	})
);

export const edgeCaseEventsRelations = relations(edgeCaseEvents, ({ one }) => ({
	user: one(users, {
		fields: [edgeCaseEvents.userId],
		references: [users.id],
	}),
	resolvedByUser: one(users, {
		fields: [edgeCaseEvents.resolvedBy],
		references: [users.id],
	}),
}));

export type EdgeCaseEvent = typeof edgeCaseEvents.$inferSelect;
export type NewEdgeCaseEvent = typeof edgeCaseEvents.$inferInsert;

// ============================================================================
// EXAM PREDICTION TABLES
// ============================================================================

export const examPredictions = pgTable(
	'exam_predictions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		subject: varchar('subject', { length: 100 }).notNull(),
		topic: varchar('topic', { length: 200 }).notNull(),
		subtopic: varchar('subtopic', { length: 200 }),
		probability: numeric('probability', { precision: 5, scale: 2 }).notNull(),
		academicYear: integer('academic_year').notNull(),
		frequency: numeric('frequency', { precision: 5, scale: 2 }).notNull().default('0'),
		recency: numeric('recency', { precision: 5, scale: 2 }).notNull().default('0'),
		difficultyAlignment: numeric('difficulty_alignment', { precision: 5, scale: 2 })
			.notNull()
			.default('0'),
		markerBias: numeric('marker_bias', { precision: 5, scale: 2 }).notNull().default('0'),
		confidence: varchar('confidence', { length: 20 }).notNull().default('medium'),
		predictedQuestions: text('predicted_questions'),
		historicalAppearances: integer('historical_appearances').notNull().default(0),
		marksWeight: integer('marks_weight').notNull().default(0),
		isHotTopic: boolean('is_hot_topic').notNull().default(false),
		curriculumChangeWarning: boolean('curriculum_change_warning').notNull().default(false),
		lastUpdated: timestamp('last_updated').defaultNow(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		subjectAcademicIdx: index('exam_predictions_subject_year_idx').on(
			table.subject,
			table.academicYear
		),
		probabilityIdx: index('exam_predictions_probability_idx').on(table.probability),
		hotTopicIdx: index('exam_predictions_hot_topic_idx').on(table.isHotTopic),
	})
);

export const predictionAccuracy = pgTable(
	'prediction_accuracy',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
		subject: varchar('subject', { length: 100 }).notNull(),
		academicYear: integer('academic_year').notNull(),
		predictedTopics: text('predicted_topics').notNull(),
		actualTopics: text('actual_topics').notNull(),
		correctPredictions: integer('correct_predictions').notNull().default(0),
		totalPredictions: integer('total_predictions').notNull().default(0),
		accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
		predictedQuestionsCount: integer('predicted_questions_count').notNull().default(0),
		actualQuestionsCount: integer('actual_questions_count').notNull().default(0),
		feedback: text('feedback'),
		isVerified: boolean('is_verified').notNull().default(false),
		verifiedAt: timestamp('verified_at'),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('prediction_accuracy_user_id_idx').on(table.userId),
		subjectYearIdx: index('prediction_accuracy_subject_year_idx').on(
			table.subject,
			table.academicYear
		),
	})
);

export const topicFrequency = pgTable(
	'topic_frequency',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		subject: varchar('subject', { length: 100 }).notNull(),
		topic: varchar('topic', { length: 200 }).notNull(),
		year: integer('year').notNull(),
		appearanceCount: integer('appearance_count').notNull().default(1),
		totalMarks: integer('total_marks').notNull().default(0),
		difficultyDistribution: text('difficulty_distribution'),
		questionTypes: text('question_types'),
		questionPatterns: text('question_patterns'),
		lastUpdated: timestamp('last_updated').defaultNow(),
	},
	(table) => ({
		subjectTopicYearIdx: index('topic_frequency_subject_topic_year_idx').on(
			table.subject,
			table.topic,
			table.year
		),
		subjectYearIdx: index('topic_frequency_subject_year_idx').on(table.subject, table.year),
	})
);

export const classicQuestions = pgTable(
	'classic_questions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		subject: varchar('subject', { length: 100 }).notNull(),
		topic: varchar('topic', { length: 200 }).notNull(),
		questionPattern: text('question_pattern').notNull(),
		similarityScore: numeric('similarity_score', { precision: 5, scale: 2 }).notNull(),
		appearanceYears: text('appearance_years').notNull(),
		averageMarks: integer('average_marks').notNull().default(0),
		typicalDifficulty: varchar('typical_difficulty', { length: 20 }).notNull().default('medium'),
		variations: text('variations'),
		isCAPSValid: boolean('is_caps_valid').notNull().default(true),
		lastUpdated: timestamp('last_updated').defaultNow(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		subjectTopicIdx: index('classic_questions_subject_topic_idx').on(table.subject, table.topic),
		similarityIdx: index('classic_questions_similarity_idx').on(table.similarityScore),
	})
);

export type ExamPrediction = typeof examPredictions.$inferSelect;
export type NewExamPrediction = typeof examPredictions.$inferInsert;
export type PredictionAccuracyRecord = typeof predictionAccuracy.$inferSelect;
export type NewPredictionAccuracy = typeof predictionAccuracy.$inferInsert;
export type TopicFrequencyRecord = typeof topicFrequency.$inferSelect;
export type NewTopicFrequency = typeof topicFrequency.$inferInsert;
export type ClassicQuestion = typeof classicQuestions.$inferSelect;
export type NewClassicQuestion = typeof classicQuestions.$inferInsert;

export const examPredictionsRelations = relations(examPredictions, () => ({}));
export const predictionAccuracyRelations = relations(predictionAccuracy, ({ one }) => ({
	user: one(users, {
		fields: [predictionAccuracy.userId],
		references: [users.id],
	}),
}));
export const topicFrequencyRelations = relations(topicFrequency, () => ({}));

// ============================================================================
// RATE LIMITS TABLE (DB-backed rate limiting for serverless)
// ============================================================================

export const rateLimits = pgTable(
	'rate_limits',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		key: text('key').notNull(),
		count: integer('count').notNull().default(0),
		resetAt: timestamp('reset_at').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		keyIdx: index('rate_limits_key_idx').on(table.key),
		resetAtIdx: index('rate_limits_reset_at_idx').on(table.resetAt),
	})
);

export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;
export const classicQuestionsRelations = relations(classicQuestions, () => ({}));

// ============================================================================
// CALENDAR CONNECTIONS TABLE (Google Calendar OAuth)
// ============================================================================

export const calendarConnections = pgTable(
	'calendar_connections',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: varchar('provider', { length: 20 }).notNull().default('google'),
		accessTokenEncrypted: text('access_token_encrypted'),
		refreshTokenEncrypted: text('refresh_token_encrypted'),
		expiresAt: timestamp('expires_at'),
		calendarId: varchar('calendar_id', { length: 100 }),
		lastSyncAt: timestamp('last_sync_at'),
		syncEnabled: boolean('sync_enabled').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('calendar_connections_user_id_idx').on(table.userId),
		providerIdx: index('calendar_connections_provider_idx').on(table.provider),
		uniqueUserProvider: uniqueIndex('calendar_connections_user_provider').on(
			table.userId,
			table.provider
		),
	})
);

export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type NewCalendarConnection = typeof calendarConnections.$inferInsert;

// ============================================================================
// SYNCED EVENTS TABLE (Track sync state between MatricMaster and external calendars)
// ============================================================================

export const syncedEvents = pgTable(
	'synced_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		externalEventId: varchar('external_event_id', { length: 100 }),
		internalEventId: uuid('internal_event_id'),
		lastSyncedAt: timestamp('last_synced_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('synced_events_user_id_idx').on(table.userId),
		externalIdx: index('synced_events_external_idx').on(table.externalEventId),
		internalIdx: index('synced_events_internal_idx').on(table.internalEventId),
		userExternalUnique: uniqueIndex('synced_events_user_external').on(
			table.userId,
			table.externalEventId
		),
	})
);

export type SyncedEvent = typeof syncedEvents.$inferSelect;
export type NewSyncedEvent = typeof syncedEvents.$inferInsert;

// Relations
export const calendarConnectionsRelations = relations(calendarConnections, ({ one }) => ({
	user: one(users, {
		fields: [calendarConnections.userId],
		references: [users.id],
	}),
}));

export const syncedEventsRelations = relations(syncedEvents, ({ one }) => ({
	user: one(users, {
		fields: [syncedEvents.userId],
		references: [users.id],
	}),
}));

// ============================================================================
// PARENT NOTIFICATION PREFERENCES TABLE
// ============================================================================

export const parentNotificationPreferences = pgTable(
	'parent_notification_preferences',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		parentUserId: text('parent_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		childUserId: text('child_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		emailDigest: boolean('email_digest').notNull().default(true),
		digestFrequency: varchar('digest_frequency', { length: 20 }).notNull().default('weekly'),
		alertQuizThreshold: integer('alert_quiz_threshold').notNull().default(60),
		alertInactivityDays: integer('alert_inactivity_days').notNull().default(3),
		emailNotifications: boolean('email_notifications').notNull().default(true),
		pushNotifications: boolean('push_notifications').notNull().default(true),
		alertExamAlerts: boolean('alert_exam_alerts').notNull().default(true),
		alertLowScores: boolean('alert_low_scores').notNull().default(true),
		alertInactivity: boolean('alert_inactivity').notNull().default(true),
		alertStudyStreak: boolean('alert_study_streak').notNull().default(true),
		alertAchievements: boolean('alert_achievements').notNull().default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		parentUserIdIdx: index('parent_notif_prefs_parent_idx').on(table.parentUserId),
		childUserIdIdx: index('parent_notif_prefs_child_idx').on(table.childUserId),
		parentChildUnique: uniqueIndex('parent_notif_prefs_unique').on(
			table.parentUserId,
			table.childUserId
		),
	})
);

export const parentNotificationPreferencesRelations = relations(
	parentNotificationPreferences,
	({ one }) => ({
		parent: one(users, {
			fields: [parentNotificationPreferences.parentUserId],
			references: [users.id],
			relationName: 'parentPreferences',
		}),
		child: one(users, {
			fields: [parentNotificationPreferences.childUserId],
			references: [users.id],
			relationName: 'childPreferences',
		}),
	})
);

export type ParentNotificationPreferences = typeof parentNotificationPreferences.$inferSelect;
export type NewParentNotificationPreferences = typeof parentNotificationPreferences.$inferInsert;

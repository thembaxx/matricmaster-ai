import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ============================================================================
// SYNC METADATA TABLES
// ============================================================================

export const sqliteSyncMetadata = sqliteTable('sync_metadata', {
	tableName: text('table_name').primaryKey(),
	lastSyncTimestamp: integer('last_sync_timestamp'),
	lastSyncVersion: integer('last_sync_version'),
	syncDirection: text('sync_direction'),
	updatedAt: text('updated_at'),
});

export const sqliteSyncLog = sqliteTable('sync_log', {
	id: text('id').primaryKey(),
	tableName: text('table_name').notNull(),
	operation: text('operation').notNull(),
	recordId: text('record_id').notNull(),
	timestamp: integer('timestamp').notNull(),
	direction: text('direction').notNull(),
	status: text('status').notNull(),
	errorMessage: text('error_message'),
	localVersion: integer('local_version'),
	remoteVersion: integer('remote_version'),
});

export const sqliteSyncQueue = sqliteTable('sync_queue', {
	id: text('id').primaryKey(),
	tableName: text('table_name').notNull(),
	operation: text('operation').notNull(),
	recordId: text('record_id').notNull(),
	data: text('data').notNull(),
	timestamp: integer('timestamp').notNull(),
	retryCount: integer('retry_count').notNull().default(0),
	status: text('status').notNull().default('pending'),
});

// ============================================================================
// AUTH TABLES
// ============================================================================

export const sqliteUsers = sqliteTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	role: text('role').notNull().default('user'),
	isBlocked: integer('isBlocked', { mode: 'boolean' }).notNull().default(false),
	twoFactorEnabled: integer('twoFactorEnabled', { mode: 'boolean' }).notNull().default(false),
	hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' })
		.notNull()
		.default(false),
	school: text('school'),
	avatarId: text('avatar_id'),
	deletedAt: text('deleted_at'),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteSessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	expiresAt: text('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteAccounts = sqliteTable('accounts', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull(),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: text('accessTokenExpiresAt'),
	refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteVerifications = sqliteTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: text('expiresAt').notNull(),
	createdAt: text('created_at'),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// CORE CONTENT TABLES
// ============================================================================

export const sqliteSubjects = sqliteTable('subjects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	curriculumCode: text('curriculum_code').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteQuestions = sqliteTable('questions', {
	id: text('id').primaryKey(),
	subjectId: integer('subject_id').notNull(),
	questionText: text('question_text').notNull(),
	imageUrl: text('image_url'),
	gradeLevel: integer('grade_level').notNull(),
	topic: text('topic').notNull(),
	difficulty: text('difficulty').notNull().default('medium'),
	marks: integer('marks').notNull().default(2),
	hint: text('hint'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteOptions = sqliteTable('options', {
	id: text('id').primaryKey(),
	questionId: text('question_id').notNull(),
	optionText: text('option_text').notNull(),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
	optionLetter: text('option_letter').notNull(),
	explanation: text('explanation'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// QUIZ RESULTS TABLE
// ============================================================================

export const sqliteQuizResults = sqliteTable('quiz_results', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	quizId: text('quiz_id').notNull(),
	score: integer('score').notNull(),
	totalQuestions: integer('total_questions').notNull(),
	percentage: text('percentage').notNull(),
	timeTaken: integer('time_taken').notNull(),
	completedAt: text('completed_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// SEARCH HISTORY TABLE
// ============================================================================

export const sqliteSearchHistory = sqliteTable('search_history', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	query: text('query').notNull(),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// PAST PAPERS TABLES
// ============================================================================

export const sqlitePastPapers = sqliteTable('past_papers', {
	id: text('id').primaryKey(),
	paperId: text('paper_id').notNull().unique(),
	originalPdfUrl: text('original_pdf_url').notNull(),
	storedPdfUrl: text('stored_pdf_url'),
	markdownFileUrl: text('markdown_file_url'),
	subject: text('subject').notNull(),
	paper: text('paper').notNull(),
	year: integer('year').notNull(),
	month: text('month').notNull(),
	isExtracted: integer('is_extracted', { mode: 'boolean' }).notNull().default(false),
	extractedQuestions: text('extracted_questions'),
	instructions: text('instructions'),
	totalMarks: integer('total_marks'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqlitePastPaperQuestions = sqliteTable('past_paper_questions', {
	id: text('id').primaryKey(),
	paperId: text('paper_id'),
	questionText: text('question_text').notNull(),
	answerText: text('answer_text'),
	year: integer('year').notNull(),
	subject: text('subject').notNull(),
	paper: text('paper'),
	month: text('month'),
	topic: text('topic'),
	marks: integer('marks'),
	questionNumber: integer('question_number'),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// USER DATA TABLES
// ============================================================================

export const sqliteUserProgress = sqliteTable('user_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	subjectId: integer('subject_id'),
	topic: text('topic'),
	totalQuestionsAttempted: integer('total_questions_attempted').notNull().default(0),
	totalCorrect: integer('total_correct').notNull().default(0),
	totalMarksEarned: integer('total_marks_earned').notNull().default(0),
	streakDays: integer('streak_days').notNull().default(0),
	bestStreak: integer('best_streak').notNull().default(0),
	streakFreezes: integer('streak_freezes').notNull().default(0),
	lastLoginBonusAt: text('last_login_bonus_at'),
	consecutiveLoginDays: integer('consecutive_login_days').notNull().default(0),
	totalLoginBonusesClaimed: integer('total_login_bonuses_claimed').notNull().default(0),
	lastActivityAt: text('last_activity_at').notNull(),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteUserAchievements = sqliteTable('user_achievements', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	achievementId: text('achievement_id').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	icon: text('icon'),
	unlockedAt: text('unlocked_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteUserSettings = sqliteTable('user_settings', {
	userId: text('user_id').primaryKey(),
	emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
	pushNotifications: integer('push_notifications', { mode: 'boolean' }).notNull().default(true),
	pushSubscription: text('push_subscription'),
	studyReminders: integer('study_reminders', { mode: 'boolean' }).notNull().default(true),
	achievementAlerts: integer('achievement_alerts', { mode: 'boolean' }).notNull().default(true),
	whatsappNotifications: integer('whatsapp_notifications', { mode: 'boolean' })
		.notNull()
		.default(false),
	profileVisibility: integer('profile_visibility', { mode: 'boolean' }).notNull().default(true),
	showOnLeaderboard: integer('show_on_leaderboard', { mode: 'boolean' }).notNull().default(true),
	analyticsTracking: integer('analytics_tracking', { mode: 'boolean' }).notNull().default(true),
	language: text('language').notNull().default('en'),
	theme: text('theme').notNull().default('system'),
	curriculum: text('curriculum').notNull().default('NSC'),
	homeLanguage: text('home_language'),
	preferredLanguage: text('preferred_language').notNull().default('en'),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// LEARNING TABLES
// ============================================================================

export const sqliteStudySessions = sqliteTable('study_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	subjectId: integer('subject_id'),
	sessionType: text('session_type').notNull(),
	topic: text('topic'),
	durationMinutes: integer('duration_minutes'),
	questionsAttempted: integer('questions_attempted').notNull().default(0),
	correctAnswers: integer('correct_answers').notNull().default(0),
	marksEarned: integer('marks_earned').notNull().default(0),
	startedAt: text('started_at').notNull(),
	completedAt: text('completed_at'),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteStudyPlans = sqliteTable('study_plans', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	targetExamDate: text('target_exam_date'),
	focusAreas: text('focus_areas'),
	weeklyGoals: text('weekly_goals'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteFlashcardDecks = sqliteTable('flashcard_decks', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	subjectId: integer('subject_id'),
	cardCount: integer('card_count').notNull().default(0),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteFlashcards = sqliteTable('flashcards', {
	id: text('id').primaryKey(),
	deckId: text('deck_id').notNull(),
	front: text('front').notNull(),
	back: text('back').notNull(),
	imageUrl: text('image_url'),
	difficulty: text('difficulty').notNull().default('medium'),
	timesReviewed: integer('times_reviewed').notNull().default(0),
	timesCorrect: integer('times_correct').notNull().default(0),
	easeFactor: text('ease_factor').notNull().default('2.5'),
	intervalDays: integer('interval_days').notNull().default(1),
	repetitions: integer('repetitions').notNull().default(0),
	nextReview: text('next_review'),
	lastReview: text('last_review'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteFlashcardReviews = sqliteTable('flashcard_reviews', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	flashcardId: text('flashcard_id').notNull(),
	rating: integer('rating').notNull(),
	intervalBefore: integer('interval_before'),
	intervalAfter: integer('interval_after').notNull(),
	easeFactorBefore: text('ease_factor_before'),
	easeFactorAfter: text('ease_factor_after').notNull(),
	reviewedAt: text('reviewed_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteTopicMastery = sqliteTable('topic_mastery', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	subjectId: integer('subject_id').notNull(),
	topic: text('topic').notNull(),
	masteryLevel: text('mastery_level').notNull().default('0'),
	questionsAttempted: integer('questions_attempted').notNull().default(0),
	questionsCorrect: integer('questions_correct').notNull().default(0),
	averageTime: integer('average_time_seconds'),
	lastPracticed: text('last_practiced'),
	nextReview: text('next_review'),
	consecutiveCorrect: integer('consecutive_correct').notNull().default(0),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteQuestionAttempts = sqliteTable('question_attempts', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	questionId: text('question_id').notNull(),
	topic: text('topic').notNull(),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
	responseTimeMs: integer('response_time_ms'),
	nextReviewAt: text('next_review_at'),
	intervalDays: integer('interval_days').notNull().default(1),
	easeFactor: text('ease_factor').notNull().default('2.5'),
	attemptedAt: text('attempted_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// SOCIAL TABLES
// ============================================================================

export const sqliteBookmarks = sqliteTable('bookmarks', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	bookmarkType: text('bookmark_type').notNull(),
	referenceId: text('reference_id').notNull(),
	note: text('note'),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteLeaderboardEntries = sqliteTable('leaderboard_entries', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	periodType: text('period_type').notNull(),
	periodStart: text('period_start').notNull(),
	totalPoints: integer('total_points').notNull().default(0),
	rank: integer('rank'),
	questionsCompleted: integer('questions_completed').notNull().default(0),
	accuracyPercentage: integer('accuracy_percentage'),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteChannels = sqliteTable('channels', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	subjectId: integer('subject_id'),
	createdBy: text('created_by').notNull(),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
	memberCount: integer('member_count').notNull().default(1),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteChannelMembers = sqliteTable('channel_members', {
	channelId: text('channel_id').notNull(),
	userId: text('user_id').notNull(),
	role: text('role').notNull().default('member'),
	joinedAt: text('joined_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// COMMENTS TABLES
// ============================================================================

export const sqliteComments = sqliteTable('comments', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	content: text('content').notNull(),
	resourceType: text('resource_type').notNull(),
	resourceId: text('resource_id').notNull(),
	parentId: text('parent_id'),
	isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
	isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
	flagReason: text('flag_reason'),
	upvotes: integer('upvotes').notNull().default(0),
	downvotes: integer('downvotes').notNull().default(0),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteCommentVotes = sqliteTable('comment_votes', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	commentId: text('comment_id').notNull(),
	voteType: text('vote_type').notNull(),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================

export const sqliteNotifications = sqliteTable('notifications', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	type: text('type').notNull(),
	title: text('title').notNull(),
	message: text('message').notNull(),
	data: text('data'),
	isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
	readAt: text('read_at'),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// CALENDAR EVENTS TABLE
// ============================================================================

export const sqliteCalendarEvents = sqliteTable('calendar_events', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	eventType: text('event_type').notNull(),
	subjectId: integer('subject_id'),
	startTime: text('start_time').notNull(),
	endTime: text('end_time').notNull(),
	isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
	location: text('location'),
	reminderMinutes: text('reminder_minutes'),
	recurrenceRule: text('recurrence_rule'),
	examId: text('exam_id'),
	lessonId: integer('lesson_id'),
	studyPlanId: text('study_plan_id'),
	isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// AI CONVERSATIONS TABLE
// ============================================================================

export const sqliteAiConversations = sqliteTable('ai_conversations', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	subject: text('subject'),
	messages: text('messages').notNull(),
	messageCount: integer('message_count').notNull().default(0),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// BUDDY SYSTEM TABLES
// ============================================================================

export const sqliteBuddyRequests = sqliteTable('buddy_requests', {
	id: text('id').primaryKey(),
	fromUserId: text('from_user_id').notNull(),
	toUserId: text('to_user_id').notNull(),
	message: text('message'),
	status: text('status').notNull().default('pending'),
	createdAt: text('created_at').notNull(),
	respondedAt: text('responded_at'),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteStudyBuddyProfiles = sqliteTable('study_buddy_profiles', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	bio: text('bio'),
	studyGoals: text('study_goals'),
	preferredSubjects: text('preferred_subjects'),
	studySchedule: text('study_schedule'),
	lookingFor: text('looking_for'),
	isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
	matchPreferences: text('match_preferences'),
	personality: text('personality').notNull().default('mentor'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteStudyBuddyRequests = sqliteTable('study_buddy_requests', {
	id: text('id').primaryKey(),
	requesterId: text('requester_id').notNull(),
	recipientId: text('recipient_id').notNull(),
	status: text('status').notNull().default('pending'),
	message: text('message'),
	createdAt: text('created_at').notNull(),
	respondedAt: text('responded_at'),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteStudyBuddies = sqliteTable('study_buddies', {
	id: text('id').primaryKey(),
	userId1: text('user_id_1').notNull(),
	userId2: text('user_id_2').notNull(),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// AI LEARNING TABLES
// ============================================================================

export const sqliteConceptStruggles = sqliteTable('concept_struggles', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	concept: text('concept').notNull(),
	struggleCount: integer('struggle_count').notNull().default(1),
	lastStruggleAt: text('last_struggle_at').notNull(),
	isResolved: integer('is_resolved', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteTopicConfidence = sqliteTable('topic_confidence', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	topic: text('topic').notNull(),
	subject: text('subject').notNull(),
	confidenceScore: text('confidence_score').notNull().default('0.5'),
	timesCorrect: integer('times_correct').notNull().default(0),
	timesAttempted: integer('times_attempted').notNull().default(0),
	lastAttemptAt: text('last_attempt_at'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// UNIVERSITY TARGETS TABLES
// ============================================================================

export const sqliteUniversityTargets = sqliteTable('university_targets', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	universityName: text('university_name').notNull(),
	faculty: text('faculty').notNull(),
	targetAps: integer('target_aps').notNull(),
	requiredSubjects: text('required_subjects'),
	recommendedStudyPath: text('recommended_study_path'),
	roadmapGeneratedAt: text('roadmap_generated_at'),
	lastMilestoneId: text('last_milestone_id'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteUserApsScores = sqliteTable('user_aps_scores', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	subject: text('subject').notNull(),
	currentGrade: text('current_grade').notNull(),
	apsPoints: integer('aps_points').notNull(),
	lastAssessmentType: text('last_assessment_type'),
	lastAssessmentScore: integer('last_assessment_score'),
	lastUpdatedAt: text('last_updated_at').notNull(),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteApsMilestones = sqliteTable('aps_milestones', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	universityTargetId: text('university_target_id'),
	title: text('title').notNull(),
	description: text('description'),
	subject: text('subject'),
	topic: text('topic'),
	apsPotentialPoints: integer('aps_potential_points').notNull().default(1),
	status: text('status').notNull().default('pending'),
	completedAt: text('completed_at'),
	dueDate: text('due_date'),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// TOPIC WEIGHTAGES TABLE
// ============================================================================

export const sqliteTopicWeightages = sqliteTable('topic_weightages', {
	id: text('id').primaryKey(),
	subject: text('subject').notNull(),
	topic: text('topic').notNull(),
	weightagePercent: integer('weightage_percent').notNull(),
	examPaper: text('exam_paper'),
	lastUpdated: text('last_updated').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// COMMERCE TABLES
// ============================================================================

export const sqliteSubscriptionPlans = sqliteTable('subscription_plans', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	priceZar: text('price_zar').notNull(),
	billingInterval: text('billing_interval').notNull().default('monthly'),
	features: text('features'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqliteUserSubscriptions = sqliteTable('user_subscriptions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	planId: text('plan_id').notNull(),
	paystackCustomerCode: text('paystack_customer_code'),
	paystackSubscriptionCode: text('paystack_subscription_code'),
	paystackEmailToken: text('paystack_email_token'),
	status: text('status').notNull().default('active'),
	currentPeriodStart: text('current_period_start').notNull(),
	currentPeriodEnd: text('current_period_end').notNull(),
	cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
	isFreeTrial: integer('is_free_trial', { mode: 'boolean' }).notNull().default(false),
	trialEndDate: text('trial_end_date'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

export const sqlitePayments = sqliteTable('payments', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	subscriptionId: text('subscription_id'),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull().default('ZAR'),
	status: text('status').notNull(),
	paystackReference: text('paystack_reference'),
	paystackCustomerCode: text('paystack_customer_code'),
	paymentMethod: text('payment_method'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

// ============================================================================
// CONTENT FLAGS TABLE
// ============================================================================

export const sqliteContentFlags = sqliteTable('content_flags', {
	id: text('id').primaryKey(),
	reporterId: text('reporter_id').notNull(),
	contentType: text('content_type').notNull(),
	contentId: text('content_id').notNull(),
	contentPreview: text('content_preview'),
	flagReason: text('flag_reason').notNull(),
	flagDetails: text('flag_details'),
	status: text('status').notNull().default('pending'),
	reviewedBy: text('reviewed_by'),
	reviewedAt: text('reviewed_at'),
	createdAt: text('created_at').notNull(),
	syncVersion: integer('sync_version').notNull().default(1),
	lastModifiedAt: text('last_modified_at').notNull(),
	localUpdatedAt: text('local_updated_at').notNull(),
	syncStatus: text('sync_status').notNull().default('synced'),
});

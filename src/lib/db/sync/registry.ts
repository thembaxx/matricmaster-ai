import * as schema from '../schema';
import * as sqliteSchema from '../sqlite-schema';

export interface TableMapping {
	tableName: string;
	pgTable: any;
	sqliteTable: any;
	idColumn: string;
}

export const syncTableRegistry: TableMapping[] = [
	{
		tableName: 'users',
		pgTable: schema.user,
		sqliteTable: sqliteSchema.sqliteUsers,
		idColumn: 'id',
	},
	{
		tableName: 'sessions',
		pgTable: schema.session,
		sqliteTable: sqliteSchema.sqliteSessions,
		idColumn: 'id',
	},
	{
		tableName: 'accounts',
		pgTable: schema.account,
		sqliteTable: sqliteSchema.sqliteAccounts,
		idColumn: 'id',
	},
	{
		tableName: 'verifications',
		pgTable: schema.verification,
		sqliteTable: sqliteSchema.sqliteVerifications,
		idColumn: 'id',
	},
	{
		tableName: 'subjects',
		pgTable: schema.subjects,
		sqliteTable: sqliteSchema.sqliteSubjects,
		idColumn: 'id',
	},
	{
		tableName: 'questions',
		pgTable: schema.questions,
		sqliteTable: sqliteSchema.sqliteQuestions,
		idColumn: 'id',
	},
	{
		tableName: 'options',
		pgTable: schema.options,
		sqliteTable: sqliteSchema.sqliteOptions,
		idColumn: 'id',
	},
	{
		tableName: 'quiz_results',
		pgTable: schema.quizResults,
		sqliteTable: sqliteSchema.sqliteQuizResults,
		idColumn: 'id',
	},
	{
		tableName: 'search_history',
		pgTable: schema.searchHistory,
		sqliteTable: sqliteSchema.sqliteSearchHistory,
		idColumn: 'id',
	},
	{
		tableName: 'past_papers',
		pgTable: schema.pastPapers,
		sqliteTable: sqliteSchema.sqlitePastPapers,
		idColumn: 'id',
	},
	{
		tableName: 'user_progress',
		pgTable: schema.userProgress,
		sqliteTable: sqliteSchema.sqliteUserProgress,
		idColumn: 'id',
	},
	{
		tableName: 'user_achievements',
		pgTable: schema.userAchievements,
		sqliteTable: sqliteSchema.sqliteUserAchievements,
		idColumn: 'id',
	},
	{
		tableName: 'user_settings',
		pgTable: schema.userSettings,
		sqliteTable: sqliteSchema.sqliteUserSettings,
		idColumn: 'userId',
	},
	{
		tableName: 'study_sessions',
		pgTable: schema.studySessions,
		sqliteTable: sqliteSchema.sqliteStudySessions,
		idColumn: 'id',
	},
	{
		tableName: 'study_plans',
		pgTable: schema.studyPlans,
		sqliteTable: sqliteSchema.sqliteStudyPlans,
		idColumn: 'id',
	},
	{
		tableName: 'flashcard_decks',
		pgTable: schema.flashcardDecks,
		sqliteTable: sqliteSchema.sqliteFlashcardDecks,
		idColumn: 'id',
	},
	{
		tableName: 'flashcards',
		pgTable: schema.flashcards,
		sqliteTable: sqliteSchema.sqliteFlashcards,
		idColumn: 'id',
	},
	{
		tableName: 'flashcard_reviews',
		pgTable: schema.flashcardReviews,
		sqliteTable: sqliteSchema.sqliteFlashcardReviews,
		idColumn: 'id',
	},
	{
		tableName: 'topic_mastery',
		pgTable: schema.topicMastery,
		sqliteTable: sqliteSchema.sqliteTopicMastery,
		idColumn: 'id',
	},
	{
		tableName: 'question_attempts',
		pgTable: schema.questionAttempts,
		sqliteTable: sqliteSchema.sqliteQuestionAttempts,
		idColumn: 'id',
	},
	{
		tableName: 'bookmarks',
		pgTable: schema.bookmarks,
		sqliteTable: sqliteSchema.sqliteBookmarks,
		idColumn: 'id',
	},
	{
		tableName: 'leaderboard_entries',
		pgTable: schema.leaderboardEntries,
		sqliteTable: sqliteSchema.sqliteLeaderboardEntries,
		idColumn: 'id',
	},
	{
		tableName: 'channels',
		pgTable: schema.channels,
		sqliteTable: sqliteSchema.sqliteChannels,
		idColumn: 'id',
	},
	{
		tableName: 'channel_members',
		pgTable: schema.channelMembers,
		sqliteTable: sqliteSchema.sqliteChannelMembers,
		idColumn: 'channelId',
	},
	{
		tableName: 'comments',
		pgTable: schema.comments,
		sqliteTable: sqliteSchema.sqliteComments,
		idColumn: 'id',
	},
	{
		tableName: 'comment_votes',
		pgTable: schema.commentVotes,
		sqliteTable: sqliteSchema.sqliteCommentVotes,
		idColumn: 'id',
	},
	{
		tableName: 'notifications',
		pgTable: schema.notifications,
		sqliteTable: sqliteSchema.sqliteNotifications,
		idColumn: 'id',
	},
	{
		tableName: 'calendar_events',
		pgTable: schema.calendarEvents,
		sqliteTable: sqliteSchema.sqliteCalendarEvents,
		idColumn: 'id',
	},
	{
		tableName: 'ai_conversations',
		pgTable: schema.aiConversations,
		sqliteTable: sqliteSchema.sqliteAiConversations,
		idColumn: 'id',
	},
	{
		tableName: 'buddy_requests',
		pgTable: schema.buddyRequests,
		sqliteTable: sqliteSchema.sqliteBuddyRequests,
		idColumn: 'id',
	},
	{
		tableName: 'study_buddy_profiles',
		pgTable: schema.studyBuddyProfiles,
		sqliteTable: sqliteSchema.sqliteStudyBuddyProfiles,
		idColumn: 'id',
	},
	{
		tableName: 'study_buddy_requests',
		pgTable: schema.studyBuddyRequests,
		sqliteTable: sqliteSchema.sqliteStudyBuddyRequests,
		idColumn: 'id',
	},
	{
		tableName: 'study_buddies',
		pgTable: schema.studyBuddies,
		sqliteTable: sqliteSchema.sqliteStudyBuddies,
		idColumn: 'id',
	},
	{
		tableName: 'concept_struggles',
		pgTable: schema.conceptStruggles,
		sqliteTable: sqliteSchema.sqliteConceptStruggles,
		idColumn: 'id',
	},
	{
		tableName: 'topic_confidence',
		pgTable: schema.topicConfidence,
		sqliteTable: sqliteSchema.sqliteTopicConfidence,
		idColumn: 'id',
	},
	{
		tableName: 'university_targets',
		pgTable: schema.universityTargets,
		sqliteTable: sqliteSchema.sqliteUniversityTargets,
		idColumn: 'id',
	},
	{
		tableName: 'user_aps_scores',
		pgTable: schema.userApsScores,
		sqliteTable: sqliteSchema.sqliteUserApsScores,
		idColumn: 'id',
	},
	{
		tableName: 'aps_milestones',
		pgTable: schema.apsMilestones,
		sqliteTable: sqliteSchema.sqliteApsMilestones,
		idColumn: 'id',
	},
	{
		tableName: 'topic_weightages',
		pgTable: schema.topicWeightages,
		sqliteTable: sqliteSchema.sqliteTopicWeightages,
		idColumn: 'id',
	},
	{
		tableName: 'subscription_plans',
		pgTable: schema.subscriptionPlans,
		sqliteTable: sqliteSchema.sqliteSubscriptionPlans,
		idColumn: 'id',
	},
	{
		tableName: 'user_subscriptions',
		pgTable: schema.userSubscriptions,
		sqliteTable: sqliteSchema.sqliteUserSubscriptions,
		idColumn: 'id',
	},
	{
		tableName: 'content_flags',
		pgTable: schema.contentFlags,
		sqliteTable: sqliteSchema.sqliteContentFlags,
		idColumn: 'id',
	},
];

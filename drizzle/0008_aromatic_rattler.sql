CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"subject" varchar(50),
	"messages" text NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bookmark_type" varchar(20) NOT NULL,
	"reference_id" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "buddy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"message" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"event_type" varchar(30) NOT NULL,
	"subject_id" bigint,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_all_day" boolean DEFAULT false NOT NULL,
	"location" text,
	"reminder_minutes" text,
	"recurrence_rule" text,
	"exam_id" uuid,
	"lesson_id" bigint,
	"study_plan_id" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channel_members" (
	"channel_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "channel_members_channel_id_user_id_pk" PRIMARY KEY("channel_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"subject_id" integer,
	"created_by" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text',
	"reply_to_id" uuid,
	"is_edited" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comment_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"comment_id" uuid NOT NULL,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" text NOT NULL,
	"parent_id" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content_id" text NOT NULL,
	"content_preview" text,
	"flag_reason" varchar(50) NOT NULL,
	"flag_details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flashcard_decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"subject_id" bigint,
	"card_count" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flashcard_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"interval_before" integer,
	"interval_after" integer NOT NULL,
	"ease_factor_before" numeric(3, 2),
	"ease_factor_after" numeric(3, 2) NOT NULL,
	"reviewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" uuid NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"image_url" text,
	"difficulty" varchar(20) DEFAULT 'medium' NOT NULL,
	"times_reviewed" integer DEFAULT 0 NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"ease_factor" numeric(3, 2) DEFAULT '2.5' NOT NULL,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp,
	"last_review" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"questions_completed" integer DEFAULT 0 NOT NULL,
	"accuracy_percentage" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(30) NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"data" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"mutation_id" varchar(100) NOT NULL,
	"channel" varchar(200) NOT NULL,
	"name" varchar(20) NOT NULL,
	"data" text,
	"rejected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "past_papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paper_id" varchar(100) NOT NULL,
	"original_pdf_url" text NOT NULL,
	"stored_pdf_url" text,
	"subject" varchar(100) NOT NULL,
	"paper" varchar(20) NOT NULL,
	"year" integer NOT NULL,
	"month" varchar(20) NOT NULL,
	"is_extracted" boolean DEFAULT false NOT NULL,
	"extracted_questions" text,
	"instructions" text,
	"total_marks" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "past_papers_paper_id_unique" UNIQUE("paper_id")
);
--> statement-breakpoint
CREATE TABLE "study_buddies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id_1" text NOT NULL,
	"user_id_2" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "study_buddy_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"study_goals" text,
	"preferred_subjects" text,
	"study_schedule" text,
	"looking_for" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"match_preferences" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "study_buddy_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "study_buddy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"target_exam_date" timestamp,
	"focus_areas" text,
	"weekly_goals" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" integer,
	"session_type" varchar(20) NOT NULL,
	"duration_minutes" integer,
	"questions_attempted" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"marks_earned" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "topic_mastery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" bigint NOT NULL,
	"topic" varchar(100) NOT NULL,
	"mastery_level" numeric(5, 2) DEFAULT '0' NOT NULL,
	"questions_attempted" integer DEFAULT 0 NOT NULL,
	"questions_correct" integer DEFAULT 0 NOT NULL,
	"average_time_seconds" integer,
	"last_practiced" timestamp,
	"next_review" timestamp,
	"consecutive_correct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" varchar(50) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_presence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(20) DEFAULT 'online',
	"last_seen_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" integer,
	"topic" varchar(100),
	"total_questions_attempted" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_marks_earned" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "anonymous_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "anonymous_users" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twoFactorEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_requests" ADD CONSTRAINT "buddy_requests_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_requests" ADD CONSTRAINT "buddy_requests_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_buddies" ADD CONSTRAINT "study_buddies_user_id_1_users_id_fk" FOREIGN KEY ("user_id_1") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_buddies" ADD CONSTRAINT "study_buddies_user_id_2_users_id_fk" FOREIGN KEY ("user_id_2") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_buddy_profiles" ADD CONSTRAINT "study_buddy_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_buddy_requests" ADD CONSTRAINT "study_buddy_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_buddy_requests" ADD CONSTRAINT "study_buddy_requests_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_created_at_idx" ON "ai_conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_type_idx" ON "bookmarks" USING btree ("bookmark_type");--> statement-breakpoint
CREATE INDEX "bookmarks_reference_id_idx" ON "bookmarks" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "buddy_requests_from_user_id_idx" ON "buddy_requests" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "buddy_requests_to_user_id_idx" ON "buddy_requests" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "buddy_requests_status_idx" ON "buddy_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "buddy_requests_unique" ON "buddy_requests" USING btree ("from_user_id","to_user_id");--> statement-breakpoint
CREATE INDEX "calendar_events_user_id_idx" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "channel_members_user_id_idx" ON "channel_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "channels_subject_id_idx" ON "channels" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "channels_created_by_idx" ON "channels" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "chat_messages_channel_id_idx" ON "chat_messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_votes_comment_id_idx" ON "comment_votes" USING btree ("comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_votes_unique" ON "comment_votes" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "comments_resource_idx" ON "comments" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "content_flags_reporter_id_idx" ON "content_flags" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "content_flags_content_type_idx" ON "content_flags" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "content_flags_content_id_idx" ON "content_flags" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "content_flags_status_idx" ON "content_flags" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_flags_created_at_idx" ON "content_flags" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "flashcard_decks_user_id_idx" ON "flashcard_decks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flashcard_decks_subject_id_idx" ON "flashcard_decks" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "flashcard_reviews_user_id_idx" ON "flashcard_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flashcard_reviews_flashcard_id_idx" ON "flashcard_reviews" USING btree ("flashcard_id");--> statement-breakpoint
CREATE INDEX "flashcard_reviews_reviewed_at_idx" ON "flashcard_reviews" USING btree ("reviewed_at");--> statement-breakpoint
CREATE INDEX "flashcards_deck_id_idx" ON "flashcards" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "flashcards_next_review_idx" ON "flashcards" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX "leaderboard_user_id_idx" ON "leaderboard_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leaderboard_period_idx" ON "leaderboard_entries" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboard_unique_entry" ON "leaderboard_entries" USING btree ("user_id","period_type","period_start");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "outbox_channel_idx" ON "outbox" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "outbox_mutation_id_idx" ON "outbox" USING btree ("mutation_id");--> statement-breakpoint
CREATE INDEX "past_papers_paper_id_idx" ON "past_papers" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "past_papers_is_extracted_idx" ON "past_papers" USING btree ("is_extracted");--> statement-breakpoint
CREATE INDEX "past_papers_subject_idx" ON "past_papers" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "past_papers_year_idx" ON "past_papers" USING btree ("year");--> statement-breakpoint
CREATE INDEX "study_buddies_user_idx" ON "study_buddies" USING btree ("user_id_1","user_id_2");--> statement-breakpoint
CREATE UNIQUE INDEX "study_buddies_unique" ON "study_buddies" USING btree ("user_id_1","user_id_2");--> statement-breakpoint
CREATE INDEX "study_buddy_profiles_user_id_idx" ON "study_buddy_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_buddy_requests_requester_idx" ON "study_buddy_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "study_buddy_requests_recipient_idx" ON "study_buddy_requests" USING btree ("recipient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_buddy_requests_unique" ON "study_buddy_requests" USING btree ("requester_id","recipient_id");--> statement-breakpoint
CREATE INDEX "study_plans_user_id_idx" ON "study_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_plans_is_active_idx" ON "study_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "study_sessions_user_id_idx" ON "study_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_sessions_subject_id_idx" ON "study_sessions" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "study_sessions_started_at_idx" ON "study_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "topic_mastery_user_id_idx" ON "topic_mastery" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "topic_mastery_subject_id_idx" ON "topic_mastery" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "topic_mastery_next_review_idx" ON "topic_mastery" USING btree ("next_review");--> statement-breakpoint
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievement_unique" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_presence_channel_user_idx" ON "user_presence" USING btree ("channel_id","user_id");--> statement-breakpoint
CREATE INDEX "user_presence_channel_id_idx" ON "user_presence" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "user_presence_user_id_idx" ON "user_presence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_progress_user_id_idx" ON "user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_progress_subject_id_idx" ON "user_progress" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "user_progress_topic_idx" ON "user_progress" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_blocked_idx" ON "users" USING btree ("is_blocked");
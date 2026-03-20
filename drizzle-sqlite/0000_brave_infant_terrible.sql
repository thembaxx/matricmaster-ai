CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` text,
	`refreshTokenExpiresAt` text,
	`scope` text,
	`password` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`subject` text,
	`messages` text NOT NULL,
	`message_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `aps_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`university_target_id` text,
	`title` text NOT NULL,
	`description` text,
	`subject` text,
	`topic` text,
	`aps_potential_points` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`completed_at` text,
	`due_date` text,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bookmark_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `buddy_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`from_user_id` text NOT NULL,
	`to_user_id` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`responded_at` text,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_type` text NOT NULL,
	`subject_id` integer,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`is_all_day` integer DEFAULT false NOT NULL,
	`location` text,
	`reminder_minutes` text,
	`recurrence_rule` text,
	`exam_id` text,
	`lesson_id` integer,
	`study_plan_id` text,
	`is_completed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `channel_members` (
	`channel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subject_id` integer,
	`created_by` text NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`member_count` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comment_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`comment_id` text NOT NULL,
	`vote_type` text NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`parent_id` text,
	`is_edited` integer DEFAULT false NOT NULL,
	`is_flagged` integer DEFAULT false NOT NULL,
	`flag_reason` text,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`downvotes` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `concept_struggles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`concept` text NOT NULL,
	`struggle_count` integer DEFAULT 1 NOT NULL,
	`last_struggle_at` text NOT NULL,
	`is_resolved` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` text NOT NULL,
	`content_preview` text,
	`flag_reason` text NOT NULL,
	`flag_details` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flashcard_decks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subject_id` integer,
	`card_count` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flashcard_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`flashcard_id` text NOT NULL,
	`rating` integer NOT NULL,
	`interval_before` integer,
	`interval_after` integer NOT NULL,
	`ease_factor_before` text,
	`ease_factor_after` text NOT NULL,
	`reviewed_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`image_url` text,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`times_reviewed` integer DEFAULT 0 NOT NULL,
	`times_correct` integer DEFAULT 0 NOT NULL,
	`ease_factor` text DEFAULT '2.5' NOT NULL,
	`interval_days` integer DEFAULT 1 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`next_review` text,
	`last_review` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leaderboard_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`period_type` text NOT NULL,
	`period_start` text NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`rank` integer,
	`questions_completed` integer DEFAULT 0 NOT NULL,
	`accuracy_percentage` integer,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `options` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`option_letter` text NOT NULL,
	`explanation` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `past_paper_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text,
	`question_text` text NOT NULL,
	`answer_text` text,
	`year` integer NOT NULL,
	`subject` text NOT NULL,
	`paper` text,
	`month` text,
	`topic` text,
	`marks` integer,
	`question_number` integer,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `past_papers` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`original_pdf_url` text NOT NULL,
	`stored_pdf_url` text,
	`markdown_file_url` text,
	`subject` text NOT NULL,
	`paper` text NOT NULL,
	`year` integer NOT NULL,
	`month` text NOT NULL,
	`is_extracted` integer DEFAULT false NOT NULL,
	`extracted_questions` text,
	`instructions` text,
	`total_marks` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `past_papers_paper_id_unique` ON `past_papers` (`paper_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`status` text NOT NULL,
	`paystack_reference` text,
	`paystack_customer_code` text,
	`payment_method` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`topic` text NOT NULL,
	`is_correct` integer NOT NULL,
	`response_time_ms` integer,
	`next_review_at` text,
	`interval_days` integer DEFAULT 1 NOT NULL,
	`ease_factor` text DEFAULT '2.5' NOT NULL,
	`attempted_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` integer NOT NULL,
	`question_text` text NOT NULL,
	`image_url` text,
	`grade_level` integer NOT NULL,
	`topic` text NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`marks` integer DEFAULT 2 NOT NULL,
	`hint` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quiz_id` text NOT NULL,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`percentage` text NOT NULL,
	`time_taken` integer NOT NULL,
	`completed_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`query` text NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` text NOT NULL,
	`token` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `study_buddies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id_1` text NOT NULL,
	`user_id_2` text NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_buddy_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bio` text,
	`study_goals` text,
	`preferred_subjects` text,
	`study_schedule` text,
	`looking_for` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`match_preferences` text,
	`personality` text DEFAULT 'mentor' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_buddy_profiles_user_id_unique` ON `study_buddy_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `study_buddy_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`requester_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` text NOT NULL,
	`responded_at` text,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`target_exam_date` text,
	`focus_areas` text,
	`weekly_goals` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject_id` integer,
	`session_type` text NOT NULL,
	`topic` text,
	`duration_minutes` integer,
	`questions_attempted` integer DEFAULT 0 NOT NULL,
	`correct_answers` integer DEFAULT 0 NOT NULL,
	`marks_earned` integer DEFAULT 0 NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`curriculum_code` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_name_unique` ON `subjects` (`name`);--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price_zar` text NOT NULL,
	`billing_interval` text DEFAULT 'monthly' NOT NULL,
	`features` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_log` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`operation` text NOT NULL,
	`record_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`direction` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	`local_version` integer,
	`remote_version` integer
);
--> statement-breakpoint
CREATE TABLE `sync_metadata` (
	`table_name` text PRIMARY KEY NOT NULL,
	`last_sync_timestamp` integer,
	`last_sync_version` integer,
	`sync_direction` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`operation` text NOT NULL,
	`record_id` text NOT NULL,
	`data` text NOT NULL,
	`timestamp` integer NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_confidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`subject` text NOT NULL,
	`confidence_score` text DEFAULT '0.5' NOT NULL,
	`times_correct` integer DEFAULT 0 NOT NULL,
	`times_attempted` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_mastery` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject_id` integer NOT NULL,
	`topic` text NOT NULL,
	`mastery_level` text DEFAULT '0' NOT NULL,
	`questions_attempted` integer DEFAULT 0 NOT NULL,
	`questions_correct` integer DEFAULT 0 NOT NULL,
	`average_time_seconds` integer,
	`last_practiced` text,
	`next_review` text,
	`consecutive_correct` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_weightages` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`weightage_percent` integer NOT NULL,
	`exam_paper` text,
	`last_updated` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `university_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`university_name` text NOT NULL,
	`faculty` text NOT NULL,
	`target_aps` integer NOT NULL,
	`required_subjects` text,
	`recommended_study_path` text,
	`roadmap_generated_at` text,
	`last_milestone_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text,
	`unlocked_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_aps_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`current_grade` text NOT NULL,
	`aps_points` integer NOT NULL,
	`last_assessment_type` text,
	`last_assessment_score` integer,
	`last_updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject_id` integer,
	`topic` text,
	`total_questions_attempted` integer DEFAULT 0 NOT NULL,
	`total_correct` integer DEFAULT 0 NOT NULL,
	`total_marks_earned` integer DEFAULT 0 NOT NULL,
	`streak_days` integer DEFAULT 0 NOT NULL,
	`best_streak` integer DEFAULT 0 NOT NULL,
	`streak_freezes` integer DEFAULT 0 NOT NULL,
	`last_login_bonus_at` text,
	`consecutive_login_days` integer DEFAULT 0 NOT NULL,
	`total_login_bonuses_claimed` integer DEFAULT 0 NOT NULL,
	`last_activity_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email_notifications` integer DEFAULT true NOT NULL,
	`push_notifications` integer DEFAULT true NOT NULL,
	`push_subscription` text,
	`study_reminders` integer DEFAULT true NOT NULL,
	`achievement_alerts` integer DEFAULT true NOT NULL,
	`whatsapp_notifications` integer DEFAULT false NOT NULL,
	`profile_visibility` integer DEFAULT true NOT NULL,
	`show_on_leaderboard` integer DEFAULT true NOT NULL,
	`analytics_tracking` integer DEFAULT true NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`curriculum` text DEFAULT 'NSC' NOT NULL,
	`home_language` text,
	`preferred_language` text DEFAULT 'en' NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`paystack_customer_code` text,
	`paystack_subscription_code` text,
	`paystack_email_token` text,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` text NOT NULL,
	`current_period_end` text NOT NULL,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`is_free_trial` integer DEFAULT false NOT NULL,
	`trial_end_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`isBlocked` integer DEFAULT false NOT NULL,
	`twoFactorEnabled` integer DEFAULT false NOT NULL,
	`has_completed_onboarding` integer DEFAULT false NOT NULL,
	`school` text,
	`avatar_id` text,
	`deleted_at` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text NOT NULL,
	`created_at` text,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`last_modified_at` text NOT NULL,
	`local_updated_at` text NOT NULL,
	`sync_status` text DEFAULT 'synced' NOT NULL
);

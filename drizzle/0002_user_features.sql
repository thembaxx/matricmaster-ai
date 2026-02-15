-- Migration: Add user features tables
-- Tables: past_papers, user_progress, user_achievements, study_sessions, 
--         study_plans, bookmarks, leaderboard_entries, channels, channel_members
-- Created: 2026-02-15

-- ============================================================================
-- PAST PAPERS TABLE (AI-extracted questions from PDFs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "past_papers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "paper_id" varchar(100) UNIQUE NOT NULL,
    "original_pdf_url" text NOT NULL,
    "stored_pdf_url" text,
    "subject" varchar(100) NOT NULL,
    "paper" varchar(20) NOT NULL,
    "year" integer NOT NULL,
    "month" varchar(20) NOT NULL,
    "is_extracted" boolean NOT NULL DEFAULT false,
    "extracted_questions" text,
    "instructions" text,
    "total_marks" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "past_papers_paper_id_idx" ON "past_papers" USING btree ("paper_id");
CREATE INDEX IF NOT EXISTS "past_papers_is_extracted_idx" ON "past_papers" USING btree ("is_extracted");
CREATE INDEX IF NOT EXISTS "past_papers_subject_idx" ON "past_papers" USING btree ("subject");
CREATE INDEX IF NOT EXISTS "past_papers_year_idx" ON "past_papers" USING btree ("year");

-- ============================================================================
-- USER PROGRESS TABLE (Track learning progress)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_progress" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "topic" varchar(100),
    "total_questions_attempted" integer NOT NULL DEFAULT 0,
    "total_correct" integer NOT NULL DEFAULT 0,
    "total_marks_earned" integer NOT NULL DEFAULT 0,
    "streak_days" integer NOT NULL DEFAULT 0,
    "last_activity_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_progress_user_id_idx" ON "user_progress" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_progress_subject_id_idx" ON "user_progress" USING btree ("subject_id");
CREATE INDEX IF NOT EXISTS "user_progress_topic_idx" ON "user_progress" USING btree ("topic");

-- ============================================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "achievement_id" varchar(50) NOT NULL,
    "title" varchar(100) NOT NULL,
    "description" text,
    "icon" varchar(50),
    "unlocked_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id", "achievement_id")
);

CREATE INDEX IF NOT EXISTS "user_achievements_user_id_idx" ON "user_achievements" USING btree ("user_id");

-- ============================================================================
-- STUDY SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "study_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "session_type" varchar(20) NOT NULL,
    "duration_minutes" integer,
    "questions_attempted" integer NOT NULL DEFAULT 0,
    "correct_answers" integer NOT NULL DEFAULT 0,
    "marks_earned" integer NOT NULL DEFAULT 0,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp
);

CREATE INDEX IF NOT EXISTS "study_sessions_user_id_idx" ON "study_sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "study_sessions_subject_id_idx" ON "study_sessions" USING btree ("subject_id");
CREATE INDEX IF NOT EXISTS "study_sessions_started_at_idx" ON "study_sessions" USING btree ("started_at");

-- ============================================================================
-- STUDY PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "study_plans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" varchar(200) NOT NULL,
    "target_exam_date" timestamp,
    "focus_areas" text,
    "weekly_goals" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "study_plans_user_id_idx" ON "study_plans" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "study_plans_is_active_idx" ON "study_plans" USING btree ("is_active");

-- ============================================================================
-- BOOKMARKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "bookmarks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "bookmark_type" varchar(20) NOT NULL,
    "reference_id" text NOT NULL,
    "note" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "bookmarks_type_idx" ON "bookmarks" USING btree ("bookmark_type");
CREATE INDEX IF NOT EXISTS "bookmarks_reference_id_idx" ON "bookmarks" USING btree ("reference_id");

-- ============================================================================
-- LEADERBOARD ENTRIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "leaderboard_entries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "period_type" varchar(20) NOT NULL,
    "period_start" timestamp NOT NULL,
    "total_points" integer NOT NULL DEFAULT 0,
    "rank" integer,
    "questions_completed" integer NOT NULL DEFAULT 0,
    "accuracy_percentage" integer,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id", "period_type", "period_start")
);

CREATE INDEX IF NOT EXISTS "leaderboard_user_id_idx" ON "leaderboard_entries" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "leaderboard_period_idx" ON "leaderboard_entries" USING btree ("period_type", "period_start");

-- ============================================================================
-- CHANNELS (STUDY GROUPS) TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "channels" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "created_by" text NOT NULL REFERENCES "users"("id"),
    "is_public" boolean NOT NULL DEFAULT true,
    "member_count" integer NOT NULL DEFAULT 1,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "channels_subject_id_idx" ON "channels" USING btree ("subject_id");
CREATE INDEX IF NOT EXISTS "channels_created_by_idx" ON "channels" USING btree ("created_by");

-- ============================================================================
-- CHANNEL MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "channel_members" (
    "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" varchar(20) NOT NULL DEFAULT 'member',
    "joined_at" timestamp DEFAULT now() NOT NULL,
    PRIMARY KEY ("channel_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "channel_members_user_id_idx" ON "channel_members" USING btree ("user_id");

-- Migration: Add Social Features - Comments, Study Buddies, Calendar, Sharing
-- Tables: comments, study_buddies, calendar_events, user_calendar_sync
-- Created: 2026-02-17

-- ============================================================================
-- COMMENTS / DISCUSSION
-- ============================================================================

CREATE TABLE IF NOT EXISTS "comments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content" text NOT NULL,
    "resource_type" varchar(50) NOT NULL,
    "resource_id" text NOT NULL,
    "parent_id" uuid REFERENCES "comments"("id") ON DELETE CASCADE,
    "is_edited" boolean NOT NULL DEFAULT false,
    "is_flagged" boolean NOT NULL DEFAULT false,
    "flag_reason" text,
    "upvotes" integer NOT NULL DEFAULT 0,
    "downvotes" integer NOT NULL DEFAULT 0,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "comments_resource_idx" ON "comments" USING btree ("resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments" USING btree ("parent_id");

-- Comment upvotes/downvotes
CREATE TABLE IF NOT EXISTS "comment_votes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "comment_id" uuid NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
    "vote_type" varchar(10) NOT NULL CHECK ("vote_type" IN ('up', 'down')),
    "created_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id", "comment_id")
);

CREATE INDEX IF NOT EXISTS "comment_votes_comment_id_idx" ON "comment_votes" USING btree ("comment_id");

-- ============================================================================
-- STUDY BUDDY MATCHING
-- ============================================================================

CREATE TABLE IF NOT EXISTS "study_buddy_profiles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "bio" text,
    "study_goals" text,
    "preferred_subjects" text[],
    "study_schedule" jsonb,
    "looking_for" varchar(50)[],
    "is_visible" boolean NOT NULL DEFAULT true,
    "match_preferences" jsonb DEFAULT '{"subject_match": true, "level_match": true}'::jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "study_buddy_profiles_user_id_idx" ON "study_buddy_profiles" USING btree ("user_id");

-- Buddy requests
CREATE TABLE IF NOT EXISTS "study_buddy_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "requester_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "recipient_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected', 'blocked')),
    "message" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "responded_at" timestamp,
    UNIQUE("requester_id", "recipient_id")
);

CREATE INDEX IF NOT EXISTS "study_buddy_requests_requester_idx" ON "study_buddy_requests" USING btree ("requester_id");
CREATE INDEX IF NOT EXISTS "study_buddy_requests_recipient_idx" ON "study_buddy_requests" USING btree ("recipient_id");

-- Active buddy connections
CREATE TABLE IF NOT EXISTS "study_buddies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id_1" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "user_id_2" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id_1", "user_id_2")
);

CREATE INDEX IF NOT EXISTS "study_buddies_user_idx" ON "study_buddies" USING btree ("user_id_1", "user_id_2");

-- ============================================================================
-- CALENDAR INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS "calendar_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" varchar(200) NOT NULL,
    "description" text,
    "event_type" varchar(30) NOT NULL,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "is_all_day" boolean NOT NULL DEFAULT false,
    "location" text,
    "reminder_minutes" integer[],
    "recurrence_rule" text,
    "exam_id" uuid,
    "lesson_id" bigint,
    "study_plan_id" uuid,
    "is_completed" boolean NOT NULL DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "calendar_events_user_id_idx" ON "calendar_events" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");

-- External calendar sync (Google Calendar, Apple Calendar)
CREATE TABLE IF NOT EXISTS "calendar_sync" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider" varchar(20) NOT NULL,
    "external_calendar_id" text,
    "access_token" text,
    "refresh_token" text,
    "token_expires_at" timestamp,
    "sync_enabled" boolean NOT NULL DEFAULT true,
    "last_synced_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id", "provider")
);

CREATE INDEX IF NOT EXISTS "calendar_sync_user_id_idx" ON "calendar_sync" USING btree ("user_id");

-- ============================================================================
-- SOCIAL SHARING
-- ============================================================================

CREATE TABLE IF NOT EXISTS "shared_content" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content_type" varchar(30) NOT NULL,
    "content_id" text NOT NULL,
    "share_platform" varchar(20),
    "share_message" text,
    "view_count" integer NOT NULL DEFAULT 0,
    "click_count" integer NOT NULL DEFAULT 0,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "shared_content_user_id_idx" ON "shared_content" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "shared_content_content_idx" ON "shared_content" USING btree ("content_type", "content_id");

-- ============================================================================
-- CONTENT FLAGS / MODERATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS "content_flags" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "reporter_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content_type" varchar(30) NOT NULL,
    "content_id" text NOT NULL,
    "flag_reason" varchar(50) NOT NULL,
    "flag_details" text,
    "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    "reviewed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "review_notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "reviewed_at" timestamp
);

CREATE INDEX IF NOT EXISTS "content_flags_reporter_idx" ON "content_flags" USING btree ("reporter_id");
CREATE INDEX IF NOT EXISTS "content_flags_content_idx" ON "content_flags" USING btree ("content_type", "content_id");
CREATE INDEX IF NOT EXISTS "content_flags_status_idx" ON "content_flags" USING btree ("status");

-- Auto-moderation patterns (for content filtering)
CREATE TABLE IF NOT EXISTS "moderation_patterns" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "pattern" text NOT NULL,
    "pattern_type" varchar(20) NOT NULL,
    "severity" varchar(10) NOT NULL DEFAULT 'low' CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
    "action" varchar(20) NOT NULL DEFAULT 'flag' CHECK ("action" IN ('flag', 'block', 'approve')),
    "is_active" boolean NOT NULL DEFAULT true,
    "created_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- REAL-TIME NOTIFICATIONS (WebSocket support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" varchar(30) NOT NULL,
    "title" varchar(200) NOT NULL,
    "message" text NOT NULL,
    "data" jsonb,
    "is_read" boolean NOT NULL DEFAULT false,
    "read_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" USING btree ("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at");

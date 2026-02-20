-- Migration: Add AI Conversations, Buddy Requests, and Content Flags tables
-- Created: 2026-02-20

-- ============================================================================
-- AI CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_conversations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" varchar(200) NOT NULL,
    "subject" varchar(50),
    "messages" text NOT NULL,
    "message_count" integer NOT NULL DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT NOW(),
    "updated_at" timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");
CREATE INDEX IF NOT EXISTS "ai_conversations_created_at_idx" ON "ai_conversations"("created_at");

-- ============================================================================
-- BUDDY REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "buddy_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "from_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "to_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "message" text,
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "created_at" timestamp with time zone DEFAULT NOW(),
    "responded_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "buddy_requests_from_user_id_idx" ON "buddy_requests"("from_user_id");
CREATE INDEX IF NOT EXISTS "buddy_requests_to_user_id_idx" ON "buddy_requests"("to_user_id");
CREATE INDEX IF NOT EXISTS "buddy_requests_status_idx" ON "buddy_requests"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "buddy_requests_unique" ON "buddy_requests"("from_user_id", "to_user_id");

-- ============================================================================
-- CONTENT FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "content_flags" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "reporter_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content_type" varchar(20) NOT NULL,
    "content_id" text NOT NULL,
    "content_preview" text,
    "flag_reason" varchar(50) NOT NULL,
    "flag_details" text,
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "content_flags_reporter_id_idx" ON "content_flags"("reporter_id");
CREATE INDEX IF NOT EXISTS "content_flags_content_type_idx" ON "content_flags"("content_type");
CREATE INDEX IF NOT EXISTS "content_flags_content_id_idx" ON "content_flags"("content_id");
CREATE INDEX IF NOT EXISTS "content_flags_status_idx" ON "content_flags"("status");
CREATE INDEX IF NOT EXISTS "content_flags_created_at_idx" ON "content_flags"("created_at");

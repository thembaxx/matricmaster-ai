-- Migration: Add Learning Features - Flashcards, Notes, AI Tutor
-- Tables: flashcard_decks, flashcards, user_notes, ai_tutor_history, flagged_questions
-- Created: 2026-02-17

-- ============================================================================
-- FLASHCARD DECKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "flashcard_decks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" varchar(200) NOT NULL,
    "description" text,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "card_count" integer NOT NULL DEFAULT 0,
    "is_public" boolean NOT NULL DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "flashcard_decks_user_id_idx" ON "flashcard_decks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "flashcard_decks_subject_id_idx" ON "flashcard_decks" USING btree ("subject_id");

-- ============================================================================
-- FLASHCARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "flashcards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "deck_id" uuid NOT NULL REFERENCES "flashcard_decks"("id") ON DELETE CASCADE,
    "front" text NOT NULL,
    "back" text NOT NULL,
    "image_url" text,
    "difficulty" varchar(20) NOT NULL DEFAULT 'medium',
    "times_reviewed" integer NOT NULL DEFAULT 0,
    "times_correct" integer NOT NULL DEFAULT 0,
    "ease_factor" numeric NOT NULL DEFAULT 2.5,
    "interval_days" integer NOT NULL DEFAULT 1,
    "next_review" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "flashcards_deck_id_idx" ON "flashcards" USING btree ("deck_id");
CREATE INDEX IF NOT EXISTS "flashcards_next_review_idx" ON "flashcards" USING btree ("next_review");

-- ============================================================================
-- USER NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_notes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" varchar(200) NOT NULL,
    "content" text NOT NULL,
    "note_type" varchar(20) NOT NULL DEFAULT 'general',
    "reference_id" text,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "topic" varchar(100),
    "tags" text[],
    "is_pinned" boolean NOT NULL DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_notes_user_id_idx" ON "user_notes" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_notes_subject_id_idx" ON "user_notes" USING btree ("subject_id");
CREATE INDEX IF NOT EXISTS "user_notes_note_type_idx" ON "user_notes" USING btree ("note_type");

-- ============================================================================
-- AI TUTOR HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_tutor_history" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "subject" varchar(100),
    "topic" varchar(100),
    "question" text NOT NULL,
    "response" text NOT NULL,
    "model_used" varchar(50),
    "tokens_used" integer,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_tutor_history_user_id_idx" ON "ai_tutor_history" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "ai_tutor_history_created_at_idx" ON "ai_tutor_history" USING btree ("created_at");

-- ============================================================================
-- FLAGGED QUESTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "flagged_questions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "question_id" text NOT NULL,
    "flag_type" varchar(20) NOT NULL,
    "reason" text,
    "is_resolved" boolean NOT NULL DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "resolved_at" timestamp
);

CREATE INDEX IF NOT EXISTS "flagged_questions_user_id_idx" ON "flagged_questions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "flagged_questions_question_id_idx" ON "flagged_questions" USING btree ("question_id");

-- ============================================================================
-- EXAM SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "exam_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "exam_name" varchar(200) NOT NULL,
    "subject_id" bigint REFERENCES "subjects"("id") ON DELETE SET NULL,
    "total_questions" integer NOT NULL,
    "total_marks" integer NOT NULL,
    "duration_minutes" integer NOT NULL,
    "started_at" timestamp DEFAULT now() NOT NULL,
    "submitted_at" timestamp,
    "is_completed" boolean NOT NULL DEFAULT false,
    "score" integer,
    "percentage" numeric,
    "answers" jsonb
);

CREATE INDEX IF NOT EXISTS "exam_sessions_user_id_idx" ON "exam_sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "exam_sessions_started_at_idx" ON "exam_sessions" USING btree ("started_at");

-- ============================================================================
-- STUDY REMINDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "study_reminders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "reminder_type" varchar(20) NOT NULL,
    "scheduled_at" timestamp NOT NULL,
    "sent_at" timestamp,
    "message" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "recurring" boolean NOT NULL DEFAULT false,
    "recurrence_pattern" varchar(20),
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "study_reminders_user_id_idx" ON "study_reminders" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "study_reminders_scheduled_at_idx" ON "study_reminders" USING btree ("scheduled_at");
